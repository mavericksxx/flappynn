import pygame

class UI:
    def __init__(self, width, game_height, metrics_width, bottom_height):
        self.width = width
        self.game_height = game_height
        self.metrics_width = metrics_width
        self.bottom_height = bottom_height
        
        # Colors
        self.WHITE = (255, 255, 255)
        self.BLACK = (0, 0, 0)
        self.GRAY = (128, 128, 128)
        self.BLUE = (0, 120, 255)
        
        # Font
        pygame.font.init()
        self.font = pygame.font.SysFont('Arial', 24)
        self.small_font = pygame.font.SysFont('Arial', 16)
        
        # Buttons - keep in game section
        button_width = 100
        button_height = 40
        button_margin = 20
        self.buttons = {
            'pause': pygame.Rect(20, 20, button_width, button_height),
            'speed': pygame.Rect(140, 20, button_width, button_height)
        }
        
        self.paused = False
        
    def draw(self, screen, stats):
        # Draw buttons in game section
        mouse_pos = pygame.mouse.get_pos()
        for button_name, button_rect in self.buttons.items():
            hover = button_rect.collidepoint(mouse_pos)
            color = (0, 150, 255) if hover else self.BLUE
            
            button_surface = pygame.Surface((button_rect.width, button_rect.height))
            button_surface.fill(color)
            button_surface.set_alpha(230)
            screen.blit(button_surface, button_rect)
            pygame.draw.rect(screen, self.BLACK, button_rect, 2)
            
            text = "Resume" if self.paused and button_name == 'pause' else "Pause" if button_name == 'pause' else f"Speed: {stats['speed']}x"
            text_surface = self.font.render(text, True, self.WHITE)
            text_rect = text_surface.get_rect(center=button_rect.center)
            screen.blit(text_surface, text_rect)
        
        # Draw stats in metrics section
        metrics_y = self.game_height + 20  # Start below game section
        stats_text = [
            f"Generation: {stats['generation']}",
            f"Best Fitness: {stats['best_fitness']:.0f}",
            f"Alive Birds: {stats['alive_birds']}/{stats['total_birds']}"
        ]
        
        # Add title for metrics section
        title = self.font.render("Training Metrics", True, self.BLACK)
        title_rect = title.get_rect(center=(self.metrics_width//2, self.game_height + 30))
        screen.blit(title, title_rect)
        metrics_y = self.game_height + 70  # Start metrics below centered title
        
        # Draw metrics in centered column
        for text in stats_text:
            text_surface = self.font.render(text, True, self.BLACK)
            text_rect = text_surface.get_rect(center=(self.metrics_width//2, metrics_y))
            screen.blit(text_surface, text_rect)
            metrics_y += 40
        
    def _draw_button(self, screen, rect, text):
        # Draw button background
        pygame.draw.rect(screen, self.BLUE, rect)
        pygame.draw.rect(screen, self.BLACK, rect, 2)
        
        # Draw button text
        text_surface = self.font.render(text, True, self.WHITE)
        text_rect = text_surface.get_rect(center=rect.center)
        screen.blit(text_surface, text_rect)
        
    def _draw_text(self, screen, text, x, y):
        text_surface = self.font.render(text, True, self.BLACK)
        screen.blit(text_surface, (x, y))
        
    def handle_click(self, pos):
        """Handle mouse click on UI elements"""
        x, y = pos
        for button_name, button_rect in self.buttons.items():
            if button_rect.collidepoint(x, y):
                print(f"Button clicked: {button_name}")  # Debug print
                return button_name
        return None