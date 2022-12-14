import { drawNetwork } from "./drawNetwork";
import { lerpColor } from "./lerpColor";

export const rays = 10;
const hidden_neruons = 20;
const maxSpeed = 10.0;

class Creature {
  constructor(parent = null, predator, ctx, init = false) {
    this.age = 0;
    this.color = predator ? "#FF0000" : "#00FF00";
    this.predator = predator;
    this.weights = [];

    this.reproduce = false;

    this.reproduceCounter = parent ? Math.random() * 0.25 : Math.random();
    this.hunger = parent ? Math.random() * 0.25 : Math.random();
    this.starved = false;

    this.r = 5.0;

    // Weights between input layers and hidden layer and hidden layer and output layer
    for (let i = 0; i < (rays + 4) * hidden_neruons + 2 * hidden_neruons; i++) {
      let weight;
      if (parent) {
        weight = (parent.weights[i] + parent.weights[i]) / 2;
        weight += Math.random() * 0.1 - 0.05; // 1% mutation
      } else {
        weight = Math.random() * 2 - 1;
      }
      this.weights.push(weight);
    }

    const width = ctx.canvas.clientWidth;
    const height = ctx.canvas.clientHeight;

    if (parent && !init) {
      const spawnAngle = Math.random() * Math.PI * 2;
      this.x = parent.x + Math.cos(spawnAngle) * this.r * 2;
      this.y = parent.y + Math.sin(spawnAngle) * this.r * 2;
      this.angle = parent.angle + Math.random() * 0.5 - 0.25;
      this.speed = parent.speed + Math.random() * 0.1 - 0.05;
    } else {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
    }

    this.angle = Math.random() * Math.PI * 2;
    this.speed = 0.0;
  }

  // A ray hit is 0 if nothing is hit.
  // A ray hit is a positive value between 0 and 1 if it hits something of the same type as the creature.
  // A ray hit is a negative value between 0 and -1 if it hits something of the opposite type as the creature.
  // The larger the absolute value of the ray hit, the closer the object is to the creature.
  update(rayHits, width, height, showHud = false, ctx) {
    // Calculate the output of the neural network

    // X as float between -1 and 1
    const x_as_float = (this.x / width) * 2 - 1;
    const y_as_float = (this.y / height) * 2 - 1;
    const angle_as_float = (this.angle / (Math.PI * 2)) * 2 - 1;
    const speed_as_float = (this.speed / maxSpeed) * 2 - 1;

    let hidden_layer = [];
    for (let i = 0; i < hidden_neruons; i++) {
      let sum = 0;
      for (let j = 0; j < rays; j++) {
        sum += rayHits[j] * this.weights[j * hidden_neruons + i];
      }

      // Add x, y, and angle
      sum += x_as_float * this.weights[rays * hidden_neruons + i];
      sum += y_as_float * this.weights[rays * hidden_neruons + i + 1];
      sum += angle_as_float * this.weights[rays * hidden_neruons + i + 2];
      sum += speed_as_float * this.weights[rays * hidden_neruons + i + 3];

      // Normalize sum to be between -1 and 1
      sum = sum / (rays * 1.0);

      hidden_layer.push(sum);
    }

    let output_layer = [];
    for (let i = 0; i < 2; i++) {
      let sum = 0;
      for (let j = 0; j < hidden_neruons; j++) {
        sum +=
          hidden_layer[j] *
          this.weights[rays * hidden_neruons + i * hidden_neruons + j];
      }
      // Normalize sum to be between -1 and 1
      sum = sum / (hidden_neruons * 1.0);

      output_layer.push(sum);
    }

    if (this.log && showHud) {
      drawNetwork(
        [...rayHits, x_as_float, y_as_float, angle_as_float, speed_as_float],
        this.weights,
        hidden_layer,
        output_layer,
        ctx,
        this.predator,
        this.x,
        this.y
      )
    }

    // Update the creature's position
    this.speed += output_layer[0] * maxSpeed;
    if (this.speed > maxSpeed) {
      this.speed = maxSpeed;
    } else if (this.speed < -maxSpeed) {
      this.speed = -maxSpeed;
    }
    this.angle += (output_layer[1] * Math.PI) % (Math.PI * 2);

    // Move the creature
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;

    // Stop the creature at the walls
    if (this.x < 0) {
      this.x = 0;
    }
    if (this.x > width) {
      this.x = width;
    }
    if (this.y < 0) {
      this.y = 0;
    }
    if (this.y > height) {
      this.y = height;
    }

    // Increase reproduce counter
    if (!this.predator) {
      this.reproduceCounter += 0.005;
    }

    // Increase age counter on predators
    if (this.predator) {
      this.hunger += 0.003;
    }
    if (this.hunger > 1.0) {
      this.starved = true;
    }

    // Trigger reproduction on both types
    if (this.reproduceCounter > 1.0) {
      this.reproduceCounter = 0;
      this.reproduce = true;
    }

    this.age += 1;
  }

  draw(ctx, showHud = false) {
    ctx.beginPath();
    ctx.arc(
      this.x,
      this.y,
      this.r,
      (this.angle + 0.75) % (Math.PI * 2),
      (this.angle - 0.75) % (Math.PI * 2),
      false
    );

    // The mouth
    // A line from the end of the arc to the centre
    ctx.lineTo(this.x, this.y);

    // A line from the centre of the arc to the start
    ctx.closePath();

    let color;
    if (this.predator) {
      color = lerpColor(this.color, "#0000FF", this.hunger);
    } else {
      color = lerpColor(this.color, "#FFFFFF", this.reproduceCounter);
    }

    ctx.fillStyle = color;
    ctx.fill();

    if (this.log && showHud) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r + 10, 0, Math.PI * 2, false);
      ctx.stroke();
    }
  }

  // Collision processing
  hit(creature) {
    const distance = Math.sqrt(
      (this.x - creature.x) ** 2 + (this.y - creature.y) ** 2
    );
    if (distance < this.r + creature.r) {
      return true;
    }

    return false;
  }

  debug(text) {
    if (this.log) {
      console.log(
        this.predator ? "predator" : "prey",
        `${this.x}x${this.y}`,
        text
      );
    }
  }
}

export default Creature;
