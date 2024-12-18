import pygame
from game.game import FlappyBirdGame
from ai.genetic import GeneticAlgorithm

def main():
    # Initialize Pygame
    pygame.init()
    
    # Create game instance
    game = FlappyBirdGame()
    
    # Create genetic algorithm instance
    ga = GeneticAlgorithm()
    
    # Create initial birds
    for i in range(ga.population_size):
        game.add_bird(i)
    
    # Add speed control
    game_speeds = [1, 2, 5, 10]  # Different speed options
    speed_index = 0
    
    # Main game loop
    while game.running:
        # Update game stats
        game.stats.update({
            'generation': ga.generation,
            'best_fitness': ga.best_fitness
        })
        
        # Run one frame
        closest_pipe, running = game.run_frame()
        
        # Update each bird's fitness and let AI control them
        alive_birds = False
        for bird in game.birds:
            if bird.alive:
                alive_birds = True
                if closest_pipe:
                    # Calculate horizontal distance to pipe
                    dx = closest_pipe.x + closest_pipe.width - bird.x
                    
                    # Calculate vertical distance to pipe center
                    pipe_center = closest_pipe.gap_y + closest_pipe.gap_height/2
                    dy = bird.y - pipe_center
                    
                    # Improved fitness function with clearer scoring
                    bird.fitness = (
                        bird.score * 1000  # Base points for each pipe crossed
                        + (bird.distance / 100)  # Small bonus for distance (normalized)
                        - (abs(dy) / pipe_center) * 100  # Percentage-based penalty for being off-center
                        + (50 if dx > 0 else 0)  # Small bonus for being alive
                    )
                
                # Let AI control bird
                ga.activate_brain(bird, closest_pipe)
        
        # If all birds are dead, evolve and reset
        if not alive_birds:
            ga.evolve_population(game.birds)
            game.reset()
            
            # Create new birds for next generation
            for i in range(ga.population_size):
                bird = game.add_bird(i)
                bird.y = game.height // 2
                bird.velocity = 0
        
        # Display generation and speed info
        if game.running:
            pygame.display.set_caption(
                f"Flappy Bird AI - Generation: {ga.generation} - "
                f"Speed: {game.game_speed}x - "
                f"Best Fitness: {ga.best_fitness:.0f}"
            )
    
    pygame.quit()

if __name__ == "__main__":
    main() 