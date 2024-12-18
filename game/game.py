import pygame
from .bird import Bird
from .pipe import Pipe
from .ui import UI

class FlappyBirdGame:
    def __init__(self, width=800, height=600):
        self.width = width
        self.height = height
        self.screen = pygame.display.set_mode((width, height))
        pygame.display.set_caption("Flappy Bird AI")
        
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
        
        # Add UI
        self.ui = UI(width, height)
        
        # Initialize game state last
        self.reset()
        
    def reset(self):
        # Clear existing objects
        self.birds.clear()
        self.pipes.clear()
        
        # Create initial pipes
        for i in range(3):
            x = 800 + i * self.pipe_distance  # Start pipes off screen
            self.pipes.append(Pipe(x, self.height))
            
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
                    
                    # Check collision with ground or ceiling
                    if bird.y < 0 or bird.y > self.height - bird.height:
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
            self.pipes.append(Pipe(last_pipe.x + self.pipe_distance, self.height))
            
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
        # Clear screen
        self.screen.fill((135, 206, 235))  # Sky blue
        
        # Draw pipes
        for pipe in self.pipes:
            pipe.draw(self.screen)
            
        # Draw birds
        for bird in self.birds:
            bird.draw(self.screen)
        
        # Update stats before drawing UI
        self.stats.update({
            'alive_birds': len([b for b in self.birds if b.alive]),
            'total_birds': len(self.birds),
            'speed': self.game_speed
        })
        
        # Draw UI
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