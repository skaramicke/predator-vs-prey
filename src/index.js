const canvas = document.createElement("canvas");
const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight);
import Creature from "./creature";
import collision from "./collision";

const ray_length = 300.0;
import {rays} from './creature';

let bestPredators = [];

// Try to load bestPredators from localstorage
if (localStorage.getItem('bestPredators')) {
  bestPredators = JSON.parse(localStorage.getItem('bestPredators'));
  console.log('Loaded bestPredators from localstorage', bestPredators);
}

let bestPreys = [];
// Try to load bestPreys from localstorage
if (localStorage.getItem('bestPreys')) {
  bestPreys = JSON.parse(localStorage.getItem('bestPreys'));
  console.log('Loaded bestPreys from localstorage:', bestPreys);
}

let showHud = false;

document.body.style =
  "height: 100%; width: 100%; margin: 0; padding: 0; overflow: hidden;";

document.body.appendChild(canvas);

const ctx = canvas.getContext("2d");

let predators = [];
let prey = [];

const init = () => {
  let newPredators = [];
  let newPrey = [];
  if (bestPredators.length > 0 && bestPreys.length > 0) {
    bestPredators.forEach((bestPredator) => {
      for (let i = 0; i < 10; i++) {
        newPredators.push(new Creature(bestPredator, true, ctx, true));
      }
    });
    bestPreys.forEach((bestPrey) => {
      for (let i = 0; i < 10; i++) {
        newPrey.push(new Creature(bestPrey, false, ctx, true));
      }
    });
  } else {
    for (let i = 0; i < 50; i++) {
      newPredators.push(new Creature(null, true, ctx));
      newPrey.push(new Creature(null, false, ctx));
    }
  }
  predators = newPredators;
  predators[0].log = true;
  
  prey = newPrey;
  prey[0].log = true;

  gameOn = true;
  console.log('new generation', predators.length, prey.length);
  loop();
}

let stats = [
  {
    predators: predators.length,
    prey: prey.length,
  }
];

const rayWidthRadians = Math.PI / rays * 2;

let gameOn = false;

function loop() {

  if (prey.length === 0 || predators.length === 0) {
    console.log('One species extinct');
    gameOn = false;
  }

  if (gameOn) {
    requestAnimationFrame(loop);
  } else {
    init();
  }

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
  ctx.fillRect(0, 0, width, height);

  const killCreatures = [];
  const newCreatures = [];

  const creatures = predators.concat(prey);
  creatures.forEach((creature) => {
    creature.draw(ctx, showHud);
    // Look for nearby creatures in 5 polygons around the creature's front
    const rayHits = [];
    
    for (let rayi = 0; rayi < rays; rayi++) {
      const rayAngle = creature.angle + rayWidthRadians * (rayi - rays);
      const points = [
        [creature.x, creature.y],
        [creature.x + ray_length * Math.cos(rayAngle % (2 * Math.PI)), creature.y + ray_length * Math.sin(rayAngle % (2 * Math.PI))],
        [creature.x + ray_length * Math.cos((rayAngle + rayWidthRadians) % (2 * Math.PI)), creature.y + ray_length * Math.sin((rayAngle + rayWidthRadians) % (2 * Math.PI))],
      ]
      if (creature.log && showHud) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.moveTo(...points[0]);
        ctx.lineTo(...points[1]);
        ctx.lineTo(...points[2]);
        ctx.closePath();
        ctx.stroke();
      }

      let hits = [];

      creatures.forEach((otherCreature) => {
        if (otherCreature === creature) {
          return;
        }
        if (collision(points, [otherCreature.x, otherCreature.y])) {
          ctx.fillStyle = `rgba(${otherCreature.predator ? '255' : '0'}, ${otherCreature.predator ? '0' : '255'}, 0, 0.5)`;
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
        
        const hitValue = (1.0 - (closestDistance / ray_length)) * (closestHit.predator == creature.predator ? 1.0 : -1.0);
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

    creature.update(rayHits, width, height, showHud, ctx);

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
      bestPredators.push(creature);
      bestPredators.sort((a, b) => b.age - a.age);
      bestPredators = bestPredators.slice(0, 5);

      if (bestPredators.indexOf(creature) !== -1) {
        // Save bestPredators in localStorage
        console.log('Saving bestPredators');
        localStorage.setItem('bestPredators', JSON.stringify(bestPredators));
      }

      predators.splice(predators.indexOf(creature), 1);

      if (creature.log) {
        // Find the alive predator with highest age
        let highestAge = 0;
        let highestAgePredator = null;
        predators.forEach((predator) => {
          if (predator.age > highestAge) {
            highestAge = predator.age;
            highestAgePredator = predator;
          }
        });
        if (highestAgePredator) {
          highestAgePredator.log = true;
        }
      }

    } else {
      bestPreys.push(creature);
      bestPreys.sort((a, b) => b.age - a.age);
      bestPreys = bestPreys.slice(0, 5);

      // If creature is in the list of best preys, save the list to localStorage
      if (bestPreys.indexOf(creature) !== -1) {
        // Save bestPreys in localstorage
        console.log('Saving bestPreys');
        localStorage.setItem('bestPreys', JSON.stringify(bestPreys));
      }

      prey.splice(prey.indexOf(creature), 1);

      if (creature.log) {
        // Find the alive prey with highest age
        let highestAge = 0;
        let highestAgePrey = null;
        prey.forEach((prey) => {
          if (prey.age > highestAge) {
            highestAge = prey.age;
            highestAgePrey = prey;
          }
        });
        if (highestAgePrey) {
          highestAgePrey.log = true;
        }
      }
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

window.onclick = (e) => {
  showHud = !showHud;
}

loop();