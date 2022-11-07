# Predator vs Prey

Every run 50 predators and 50 prey are created.

On the first run they are all given a random set of neural network weights.

When a creature dies, its age denotes its fitness. The fittest prey and the fittest predator are used to spawn the next generation of each.

When only one species remains, the scene resets, 50 new predator and prey each are created, with the fittest parents used for the 

## Predators
The predators have ever increasing hunger which will kill them if they don't feed. They multiply when they eat two prey creatures.

Predators are born red. They turn blue as they grow hungrier, and turn back to red when they feed.

## Prey
Prey can only die by being eaten. They multiply when they have been alive for a certain amount of time.

Prey are born green. They turn white as they near procreation time, and turn back to green afterwards.

## Mutation
When a creature is created with a parent, it gets a copy of the parent weights with 10% mutation.

## Space
When a creature passes the boundaries of the scene, they are magically teleported to the opposite side.

# Network design

Each creature has 5 input neurons, one layer of 10 hidden neurons and 2 output neurons.

## Input neurons

The creature can see in a forward facing semi circle dividied into 5 sections.

For each section it looks at the closest creature (only the closest) and gives the section a value between -1 and 1. Positive numbers denote proximity of creatures of the same species and negative numbers denote proximity of the other species. The absolute number is higher the closer the detected creature is.

## Output neurons

The first neuron is the change in speed between negative max and positive max. The speed is then capped between -max and max. This gives the creatures the ability to change their direction of movement within two update frames.

The second neuron is the change in direction. The creature can turn all the way around in one update frame.

# How to run

1. `yarn`
2. `yarn dev`

# How to build

1. `yarn`
2. `yarn build`
3. Look in the `dist` directory

# How to contribute
## Coding mode
1. Fork
2. Change
3. Create a pull request

## Testing mode
1. Clone
2. Run
3. Have ideas or critisism
4. Create issues for others to solve, or solve them yourself

## Feedback mode
1. Clone
2. Run
3. Have ideas or critisism or praise or comments
4. Tweet them to [@skaramicke](https://twitter.com/skaramicke)

# Ideas
1. Perhaps the mutation rate should be a part of the genome.
2. There definitely needs to be a deployment flow that puts the code online somewhere.