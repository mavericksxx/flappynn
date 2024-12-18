import numpy as np
from .neural_network import NeuralNetwork

class GeneticAlgorithm:
    def __init__(self, population_size=10, top_units=4):
        self.population_size = population_size
        self.top_units = top_units
        self.generation = 1
        self.mutation_rate = 0.2
        
        self.best_fitness = 0
        self.best_network = None
        self.best_generation = 0
        
        self.population = []
        self.create_population()
    
    def create_population(self):
        """Create initial population of neural networks"""
        self.population = []
        for _ in range(self.population_size):
            self.population.append(NeuralNetwork())
    
    def evolve_population(self, birds):
        """Evolve population based on fitness scores"""
        sorted_birds = sorted(birds, key=lambda x: x.fitness, reverse=True)
        
        best_bird = sorted_birds[0]
        if best_bird.fitness > self.best_fitness:
            self.best_fitness = best_bird.fitness
            self.best_generation = self.generation
            self.best_network = self.population[best_bird.index].copy()
            print(f"New best fitness: {self.best_fitness:.0f} in generation {self.generation}")
        
        winners = [self.population[bird.index] for bird in sorted_birds[:self.top_units]]
        
        new_population = []
        
        new_population.extend(winners)
        
        while len(new_population) < self.population_size:
            if len(new_population) == self.top_units:
                parent1, parent2 = winners[0], winners[1]
            else:
                parent1 = np.random.choice(winners)
                parent2 = np.random.choice(winners)
            
            offspring = self.crossover(parent1, parent2)
            offspring = self.mutate(offspring)
            new_population.append(offspring)
        
        self.population = new_population
        self.generation += 1
        
        if self.mutation_rate == 1.0 and sorted_birds[0].fitness > 0:
            self.mutation_rate = 0.2
    
    def crossover(self, parent1, parent2):
        """Perform crossover between two parent networks"""
        child = NeuralNetwork()
        weights1 = parent1.get_weights()
        weights2 = parent2.get_weights()
        
        new_weights = {}
        for key in weights1:
            shape = weights1[key].shape
            mask = np.random.rand(*shape) > 0.5
            new_weights[key] = np.where(mask, weights1[key], weights2[key])
        
        child.set_weights(new_weights)
        return child
    
    def mutate(self, network):
        """Apply random mutations to the network"""
        weights = network.get_weights()
        
        for key in weights:
            mutation_mask = np.random.rand(*weights[key].shape) < self.mutation_rate
            mutation = np.random.randn(*weights[key].shape) * 0.1
            weights[key] = np.where(mutation_mask, weights[key] + mutation, weights[key])
        
        network.set_weights(weights)
        return network
    
    def activate_brain(self, bird, pipe):
        """Get neural network output for a bird"""
        if not pipe:
            return
        
        horizontal_distance = (pipe.x + pipe.width - bird.x) / 300
        height_difference = (bird.y - (pipe.gap_y + pipe.gap_height/2)) / 200
        velocity = bird.velocity / 8
        
        network = self.population[bird.index]
        output = network.forward([horizontal_distance, height_difference, velocity])
           
        bird.current_inputs = [horizontal_distance, height_difference, velocity]
        bird.current_output = output
        
        if output > 0.5:
            bird.flap() 