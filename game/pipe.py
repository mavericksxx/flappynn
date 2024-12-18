import pygame
import random

class Pipe:
    def __init__(self, x, game_height):
        self.x = x
        self.game_height = game_height
        self.width = 70
        self.gap_height = 160
        self.speed = 2
        
        # Randomize gap position
        min_gap_y = 150
        max_gap_y = game_height - 150 - self.gap_height
        self.gap_y = random.randint(min_gap_y, max_gap_y)
        
    def update(self):
        self.x -= self.speed
        
    def draw(self, screen):
        # Draw top pipe
        pygame.draw.rect(screen, (0, 255, 0), 
                        (self.x, 0, self.width, self.gap_y))
        
        # Draw bottom pipe
        bottom_pipe_y = self.gap_y + self.gap_height
        bottom_pipe_height = self.game_height - bottom_pipe_y
        pygame.draw.rect(screen, (0, 255, 0),
                        (self.x, bottom_pipe_y, self.width, bottom_pipe_height))
    
    def get_rects(self):
        # Return collision rects for top and bottom pipes
        top_rect = pygame.Rect(self.x, 0, self.width, self.gap_y)
        bottom_rect = pygame.Rect(
            self.x, 
            self.gap_y + self.gap_height,
            self.width,
            self.game_height - (self.gap_y + self.gap_height)
        )
        return [top_rect, bottom_rect] 