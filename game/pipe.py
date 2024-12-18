import pygame
import random
import os

class Pipe:
    def __init__(self, x, game_height):
        self.x = x
        self.game_height = game_height
        self.width = 70
        self.gap_height = 160
        self.speed = 2

        min_gap_y = 150
        max_gap_y = game_height - 150 - self.gap_height
        self.gap_y = random.randint(min_gap_y, max_gap_y)
        
        current_dir = os.path.dirname(os.path.dirname(__file__))
        self.image = pygame.image.load(os.path.join(current_dir, "assets", "pipe.png")).convert_alpha()
        self.image = pygame.transform.scale(self.image, (self.width, game_height))
        
    def update(self):
        self.x -= self.speed
        
    def draw(self, screen):
        top_pipe = pygame.transform.scale(self.image, (self.width, self.gap_y))
        screen.blit(top_pipe, (self.x, 0))
        
        bottom_height = self.game_height - (self.gap_y + self.gap_height)
        bottom_pipe = pygame.transform.scale(self.image, (self.width, bottom_height))
        bottom_pipe = pygame.transform.flip(bottom_pipe, False, True)
        screen.blit(bottom_pipe, (self.x, self.gap_y + self.gap_height))
    
    def get_rects(self):
        top_rect = pygame.Rect(self.x, 0, self.width, self.gap_y)
        bottom_rect = pygame.Rect(
            self.x, 
            self.gap_y + self.gap_height,
            self.width,
            self.game_height - (self.gap_y + self.gap_height)
        )
        return [top_rect, bottom_rect] 