import pygame
from .bird import Bird
from .pipe import Pipe
from .ui import UI
from .network_visualizer import NetworkVisualizer

class FlappyBirdGame:
    def __init__(self, width=800, height=900, genetic_algorithm=None):
        self.width = width
        self.height = height
        self.game_height = 600  # Original game height
        self.bottom_height = 300  # Height of bottom section (metrics + network)
        self.metrics_width = 300  # Width for metrics section
        self.screen = pygame.display.set_mode((width, height))
        pygame.display.set_caption("Flappy Bird AI")
        
        # Store genetic algorithm reference
        self.ga = genetic_algorithm
        
        self.clock = pygame.time.Clock()
        self.running = True
        
        # Game objects
        self.birds = []
        self.pipes = []
        self.pipe_distance = 300  # Distance between pipes
        
        # Initialize stats first
        self.stats = {
            'generation': 0,
            'best_fitness': 0,
            'alive_birds': 0,
            'total_birds': 0,
            'speed': 1
        }
        
        self.game_speed = 1
        
        # Add UI with new dimensions
        self.ui = UI(width, self.game_height, self.metrics_width, self.bottom_height)
        
        # Adjust network visualizer position and size - now on right side
        self.network_vis = NetworkVisualizer(
            self.metrics_width + 20,  # x position after metrics
            self.game_height + 10,    # y position in bottom section
            width - self.metrics_width - 30,  # remaining width minus padding
            self.bottom_height - 20    # height minus padding
        )
        
        # Initialize game state last
        self.reset()
        
    def reset(self):
        # Clear existing objects
        self.birds.clear()
        self.pipes.clear()
        
        # Create initial pipes - use game_height instead of height
        for i in range(3):
            x = 800 + i * self.pipe_distance  # Start pipes off screen
            self.pipes.append(Pipe(x, self.game_height))  # Changed from self.height to self.game_height
            
    def add_bird(self, index):
        bird = Bird(150, self.height//2, index)
        self.birds.append(bird)
        return bird
        
    def update(self):
        # Run the update loop game_speed times
        for _ in range(self.game_speed):
            # Update birds
            for bird in self.birds:
                if bird.alive:
                    bird.update()
                    
                    # Check collision with ground or ceiling - use game_height
                    if bird.y < 0 or bird.y > self.game_height - bird.height:  # Changed from self.height
                        bird.die()
                    
                    # Check collision with pipes and update score
                    for pipe in self.pipes:
                        if bird.alive:
                            # Check collisions
                            for rect in pipe.get_rects():
                                if bird.get_rect().colliderect(rect):
                                    bird.die()
                            
                            # Update score when passing a pipe
                            if (pipe.x + pipe.width < bird.x and 
                                pipe.x + pipe.width > bird.x - bird.velocity and 
                                pipe.x < bird.last_pipe_x):
                                bird.score += 1
                                bird.last_pipe_x = pipe.x
                                print(f"Bird {bird.index} scored! Score: {bird.score}")
            
            # Update pipes
            for pipe in self.pipes:
                pipe.update()
        
        # Remove pipes that are off screen and add new ones
        if self.pipes[0].x < -self.pipes[0].width:
            self.pipes.pop(0)
            last_pipe = self.pipes[-1]
            # Use game_height when creating new pipes
            self.pipes.append(Pipe(last_pipe.x + self.pipe_distance, self.game_height))  # Changed from self.height
            
        # Get closest pipe for AI input
        closest_pipe = None
        min_distance = float('inf')
        for pipe in self.pipes:
            if pipe.x + pipe.width > 150:  # Bird x position
                if pipe.x < min_distance:
                    min_distance = pipe.x
                    closest_pipe = pipe
                    
        return closest_pipe
        
    def draw(self):
        # Clear all sections with different colors
        # Game section (sky blue)
        self.screen.fill((135, 206, 235), (0, 0, self.width, self.game_height))
        
        # Bottom section background (black for both metrics and network)
        self.screen.fill((0, 0, 0), 
                        (0, self.game_height, self.width, self.bottom_height))
        
        # Draw separating lines
        pygame.draw.line(self.screen, (100, 100, 100), 
                        (0, self.game_height), 
                        (self.width, self.game_height), 2)
        pygame.draw.line(self.screen, (100, 100, 100), 
                        (self.metrics_width, self.game_height), 
                        (self.metrics_width, self.height), 2)
        
        # Draw game elements
        for pipe in self.pipes:
            pipe.draw(self.screen)
        for bird in self.birds:
            bird.draw(self.screen)
            
        # Update stats
        self.stats['alive_birds'] = sum(1 for bird in self.birds if bird.alive)
        self.stats['total_birds'] = len(self.birds)
            
        # Draw neural network visualization
        alive_bird = next((bird for bird in self.birds if bird.alive), None)
        if alive_bird and len(self.pipes) > 0:
            closest_pipe = next((p for p in self.pipes if p.x + p.width > 150), None)
            if closest_pipe:
                horizontal_distance = (closest_pipe.x + closest_pipe.width - alive_bird.x) / 300
                height_difference = (alive_bird.y - (closest_pipe.gap_y + closest_pipe.gap_height/2)) / 200
                velocity = alive_bird.velocity / 8
                inputs = [horizontal_distance, height_difference, velocity]
                
                network = self.ga.population[alive_bird.index]
                output = network.forward(inputs)
                
                self.network_vis.generation = self.ga.generation
                self.network_vis.draw(self.screen, network, inputs, output)
        
        # Draw UI last
        self.ui.draw(self.screen, self.stats)
        pygame.display.flip()
        
    def run_frame(self):
        closest_pipe = None
        
        # Handle all events first
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
            elif event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:  # Make sure it's left click
                pos = pygame.mouse.get_pos()
                button = self.ui.handle_click(pos)
                if button == 'pause':
                    self.ui.paused = not self.ui.paused
                    print(f"Pause button clicked, paused: {self.ui.paused}")
                elif button == 'speed':
                    speeds = [1, 2, 5, 10]
                    current_index = speeds.index(self.game_speed) if self.game_speed in speeds else 0
                    self.game_speed = speeds[(current_index + 1) % len(speeds)]
                    self.stats['speed'] = self.game_speed  # Update speed in stats
                    print(f"Speed button clicked, new speed: {self.game_speed}x")
        
        # Update game state if not paused
        if not self.ui.paused:
            closest_pipe = self.update()
        else:
            closest_pipe = next((p for p in self.pipes if p.x + p.width > 150), None)
        
        # Draw everything
        self.draw()
        self.clock.tick(60)
        
        return closest_pipe, self.running