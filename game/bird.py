import pygame
import numpy as np

class Bird:
    def __init__(self, x, y, index):
        self.x = x
        self.y = y
        self.index = index
        
        # Physics
        self.velocity = 0
        self.gravity = 0.4  
        self.flap_strength = -7  
        self.max_velocity = 8  
        
        # Dimensions
        self.width = 34
        self.height = 24
        
        # Game stats
        self.alive = True
        self.fitness = 0
        self.score = 0
        self.distance = 0
        self.last_pipe_x = float('inf')
        
        # Previous gen stats
        self.fitness_prev = 0
        self.score_prev = 0
        
    def flap(self):
        if self.alive:
            self.velocity = self.flap_strength
    
    def update(self):
        if not self.alive:
            return
            
        self.velocity += self.gravity
        self.velocity = min(max(self.velocity, -self.max_velocity), self.max_velocity)
        self.y += self.velocity
        
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