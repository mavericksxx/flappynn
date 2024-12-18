import pygame
import os
from game.game import FlappyBirdGame
from ai.genetic import GeneticAlgorithm

def main():
    ga = GeneticAlgorithm(population_size=50)
    game = FlappyBirdGame(genetic_algorithm=ga)
    
    for i in range(ga.population_size):
        game.add_bird(i)
    
    game_speeds = [1, 2, 5, 10]
    speed_index = 0
    
    pygame.init()
    while game.running:
        game.stats.update({
            'generation': ga.generation,
            'best_fitness': ga.best_fitness
        })
        
        closest_pipe, running = game.run_frame()
        
        alive_birds = False
        for bird in game.birds:
            if bird.alive:
                alive_birds = True
                if closest_pipe:
                    dx = closest_pipe.x + closest_pipe.width - bird.x
                    pipe_center = closest_pipe.gap_y + closest_pipe.gap_height/2
                    dy = bird.y - pipe_center
                    
                    bird.fitness = (
                        bird.score * 1000
                        + (bird.distance / 100)
                        - (abs(dy) / pipe_center) * 100
                        + (50 if dx > 0 else 0)
                    )
                
                ga.activate_brain(bird, closest_pipe)

        if not alive_birds:
            ga.evolve_population(game.birds)
            game.reset()
            
            for i in range(ga.population_size):
                bird = game.add_bird(i)
                bird.y = game.height // 2
                bird.velocity = 0
        
        if game.running:
            pygame.display.set_caption(
                f"Flappy Bird AI - Generation: {ga.generation} - "
                f"Speed: {game.game_speed}x - "
                f"Best Fitness: {ga.best_fitness:.0f}"
            )

    pygame.quit()

if __name__ == "__main__":
    main() 