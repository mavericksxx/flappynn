import pygame
import numpy as np

class Bird:
    def __init__(self, x, y, index):
        self.x = x
        self.y = y
        self.index = index
        
        # Physics - adjusted for better control
        self.velocity = 0
        self.gravity = 0.4  # Reduced further
        self.flap_strength = -7  # Reduced further
        self.max_velocity = 8  # Add velocity cap
        
        # Dimensions
        self.width = 34
        self.height = 24
        
        # Game stats
        self.alive = True
        self.fitness = 0
        self.score = 0
        self.distance = 0
        self.last_pipe_x = float('inf')
        
        # Previous generation stats
        self.fitness_prev = 0
        self.score_prev = 0
        
    def flap(self):
        if self.alive:
            self.velocity = self.flap_strength
    
    def update(self):
        if not self.alive:
            return
            
        # Apply gravity
        self.velocity += self.gravity
        # Cap velocity
        self.velocity = min(max(self.velocity, -self.max_velocity), self.max_velocity)
        self.y += self.velocity
        
        # Update distance
        self.distance += 1
        
    def draw(self, screen):
        if not self.alive:
            return
            
        color = (255, 255, 0) if self.alive else (150, 150, 150)
        pygame.draw.rect(screen, color, (self.x, self.y, self.width, self.height))
    
    def die(self):
        self.alive = False
        
    def get_rect(self):
        return pygame.Rect(self.x, self.y, self.width, self.height) 