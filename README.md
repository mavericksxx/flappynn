

````markdown
# Flappy Bird AI with Neural Networks & Genetic Algorithm

An AI that learns to play Flappy Bird using neural networks and genetic algorithms, built with Pygame.

## How It Works

### Neural Network Architecture
- **Input Layer (3 neurons)**: Distance to pipe, height difference, bird velocity
- **Hidden Layer (6 neurons)**: Processes inputs using learned weights
- **Output Layer (1 neuron)**: Decides whether to flap (>0.5) or not (≤0.5)

### Genetic Algorithm
- Creates population of birds with random neural networks
- Best performing birds are selected for breeding
- New generation created through:
  - Crossover: Combining weights from successful birds
  - Mutation: Random weight adjustments
- Process repeats, improving performance over generations

### Real-time Visualization
- Neural network structure and activations
- Connection weights (red = negative, white = positive)
- Training metrics and generation stats
- Bird performance

## Features
- Adjustable game speed (1x-10x)
- Population size and mutation rate controls
- Network visualization
- Performance metrics tracking

[Screenshot or GIF of the game in action]

## Requirements
- Python 3.x
- Pygame
- NumPy

## Usage
```bash
python main.py
```
````
