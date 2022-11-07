# Predator vs Prey

## What it does

Every run 50 predators and 50 prey are created.

On the first run they are all given a random set of neural network weights.

### Predators
The predators have ever increasing hunger which will kill them if they don't feed. They multiply when they eat two prey creatures.

### Prey
Prey can only die by being eaten. They multiply when they have been alive for a certain amount of time.

### Procreation
When a creature is created with a parent, it gets a copy of the parent weights with 10% mutation.

### Space
When a creature passes the boundaries of the scene, they are magically teleported to the opposite side.

## Network design

Each creature has 5 input neurons, one layer of 10 hidden neurons and 2 output neurons.

### Input neurons

The creature can see in a forward facing semi circle dividied into 5 sections.

For each section it looks at the closest creature (only the closest) and gives the section a value between -1 and 1. Positive numbers denote proximity of creatures of the same species and negative numbers denote proximity of the other species. The absolute number is higher the closer the detected creature is.

### Output neurons

The first neuron is the change in speed between negative max and positive max. The speed is then capped between -max and max. This gives the creatures the ability to change their direction of movement within two update frames.

The second neuron is the change in direction. The creature can turn all the way around in one update frame.

## How to run

1. `yarn`
2. `yarn dev`

## How to build

1. `yarn`
2. `yarn build`
3. Look in the `dist` directory