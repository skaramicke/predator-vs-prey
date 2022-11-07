const canvas = document.createElement("canvas");
const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight);
import Creature from "./creature";
import collision from "./collision";

const ray_length = 300.0;

let bestPredator = null;
let bestPrey = null;

document.body.style =
  "height: 100%; width: 100%; margin: 0; padding: 0; overflow: hidden;";

document.body.appendChild(canvas);

const ctx = canvas.getContext("2d");

let predators = [];
let prey = [];

const init = (bestPredator, bestPrey) => {
  console.log("init", bestPredator, bestPrey);

  let newPredators = [];
  let newPrey = [];
  for (let i = 0; i < 50; i++) {
    newPredators.push(new Creature(bestPredator, true, ctx, true));
    newPrey.push(new Creature(bestPrey, false, ctx, true));
  }
  predators = newPredators;
  prey = newPrey;
  gameOn = true;
  console.log('Init complete', predators, prey);
  loop();
}

let stats = [
  {
    predators: predators.length,
    prey: prey.length,
  }
];

const rayWidthRadians = Math.PI / 5;

let gameOn = false;

function loop() {
  if (prey.length === 0 || predators.length === 0) {
    console.log('One species extinct');
    gameOn = false;
  }

  if (gameOn) {
    requestAnimationFrame(loop);
  }


  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
  ctx.fillRect(0, 0, width, height);

  const killCreatures = [];
  const newCreatures = [];

  const creatures = predators.concat(prey);
  creatures.forEach((creature) => {
    creature.draw(ctx);
    // Look for nearby creatures in 5 polygons around the creature's front
    const rayHits = [];
    const forwardAngle = creature.angle;
    const startAngle = forwardAngle - Math.PI / 2;
    const endAngle = forwardAngle + Math.PI / 2;
    for (let rayStart = startAngle; rayStart < endAngle; rayStart += rayWidthRadians) {
      const points = [
        [creature.x, creature.y],
        [creature.x + ray_length * Math.cos(rayStart % (2 * Math.PI)), creature.y + ray_length * Math.sin(rayStart % (2 * Math.PI))],
        [creature.x + ray_length * Math.cos((rayStart + rayWidthRadians) % (2 * Math.PI)), creature.y + ray_length * Math.sin((rayStart + rayWidthRadians) % (2 * Math.PI))],
      ]
      // ctx.strokeStyle = 'rgba(255, 255, 255, 0.01)';
      // ctx.beginPath();
      // ctx.moveTo(...points[0]);
      // ctx.lineTo(...points[1]);
      // ctx.lineTo(...points[2]);
      // ctx.closePath();

      let hits = [];

      creatures.forEach((otherCreature) => {
        if (otherCreature === creature) {
          return;
        }
        if (collision(points, [otherCreature.x, otherCreature.y])) {
          ctx.fillStyle = `rgba(${otherCreature.predator ? '255' : '0'}, ${otherCreature.predator ? '0' : '255'}, 0, 0.5)`;
          // ctx.stroke();
          hits.push(otherCreature);
        }
      });

      if (hits.length > 0) {
        let closestHit = null;
        let closestDistance = null;
        hits.forEach((hit) => {
          const distance = Math.sqrt((hit.x - creature.x) ** 2 + (hit.y - creature.y) ** 2);
          if (closestDistance === null || distance < closestDistance) {
            closestDistance = distance;
            closestHit = hit;
          }
        });
        
        const hitValue = (1 - (closestDistance / ray_length)) * closestHit.predator == creature.predator ? 1 : -1;
        rayHits.push(hitValue);

      } else {
        rayHits.push(0.0);
      }
    }

    creatures.forEach((otherCreature) => {
      if (otherCreature === creature) {
        return;
      }
      if (creature.hit(otherCreature)) {
        if (otherCreature.predator && !creature.predator) {
          killCreatures.push(creature);
          otherCreature.hunger = 0;
          otherCreature.debug('Eating prey');
          creature.debug('Eaten by predator');
          otherCreature.reproduceCounter += 0.26;
        }
      }
    });

    creature.update(rayHits, width, height);

    if (creature.reproduce) {
      creature.debug('Reproducing');
      newCreatures.push(new Creature(creature, creature.predator, ctx));
      creature.reproduce = false;
      creature.reproduceCounter = 0;
    }

    if (creature.starved) {
      creature.debug('Starved');
      killCreatures.push(creature);
    }
  });

  killCreatures.forEach((creature) => {
    if (creature.predator) {
      if (bestPredator == null || creature.age > bestPredator.age) {
        bestPredator = creature;
        bestPredator.hunger = 0;
      }
      predators.splice(predators.indexOf(creature), 1);
    } else {
      if (!bestPrey || creature.age > bestPrey.age) {
        bestPrey = creature;
      }
      prey.splice(prey.indexOf(creature), 1);
    }
  });

  newCreatures.forEach((creature) => {
    creature.predator ? predators.push(creature) : prey.push(creature);
  });

  stats.push({
    predators: predators.length,
    prey: prey.length,
  });

  if (stats.length > width) {
    stats.shift();
  }

  ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.moveTo(0, height);
  stats.forEach((stat, i) => {
    ctx.lineTo(i, height - stat.predators);
  });
  ctx.lineTo(stats.length, height);
  ctx.closePath();
  ctx.stroke();

  ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
  ctx.beginPath();
  ctx.moveTo(0, height);
  stats.forEach((stat, i) => {
    ctx.lineTo(i, height - stat.prey);
  });
  ctx.lineTo(stats.length, height);
  ctx.closePath();
  ctx.stroke();
}

setInterval(() => {
  if (!gameOn) {
    init(bestPredator, bestPrey);
  }
}, 1000);

