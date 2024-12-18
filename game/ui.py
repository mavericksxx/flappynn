import pygame

class UI:
    def __init__(self, width, game_height, metrics_width, bottom_height):
        self.width = width
        self.game_height = game_height
        self.metrics_width = metrics_width
        self.bottom_height = bottom_height
        
        self.WHITE = (255, 255, 255)
        self.BLACK = (0, 0, 0)
        self.GRAY = (128, 128, 128)
        self.BLUE = (0, 120, 255)

        pygame.font.init()
        self.font = pygame.font.SysFont('Arial', 24)
        self.small_font = pygame.font.SysFont('Arial', 16)
        
        button_width = 100
        speed_button_width = 120 
        button_height = 30
        button_margin = 20
        button_spacing = 10
        metrics_center_x = metrics_width // 2

        total_width = (button_width * 2) + button_spacing
        start_x = metrics_center_x - (total_width / 2)
        
        self.buttons = {
            'pause': pygame.Rect(
                start_x,
                game_height + button_margin,
                button_width,
                button_height
            ),
            'restart': pygame.Rect(
                start_x + button_width + button_spacing,
                game_height + button_margin,
                button_width,
                button_height
            ),
            'speed': pygame.Rect(
                metrics_center_x - (speed_button_width / 2),  
                game_height + button_margin + button_height + button_spacing,
                speed_button_width,  
                button_height
            )
        }
        
        self.paused = False
        
    def draw(self, screen, stats):
        mouse_pos = pygame.mouse.get_pos()
        for button_name, button_rect in self.buttons.items():
            hover = button_rect.collidepoint(mouse_pos)
            color = (0, 150, 255) if hover else self.BLUE
            
            button_surface = pygame.Surface((button_rect.width, button_rect.height))
            button_surface.fill(color)
            button_surface.set_alpha(230)
            screen.blit(button_surface, button_rect)
            pygame.draw.rect(screen, self.WHITE, button_rect, 2)
            
            if button_name == 'pause':
                text = "Resume" if self.paused else "Pause"
            elif button_name == 'restart':
                text = "Restart"
            else:  
                text = f"Speed: {stats['speed']}x"
                
            text_surface = self.font.render(text, True, self.WHITE)
            text_rect = text_surface.get_rect(center=button_rect.center)
            screen.blit(text_surface, text_rect)
        
        metrics_y = self.game_height + 140 
        
        stats_text = [
            f"Generation: {stats['generation']}",
            f"Best Fitness: {stats['best_fitness']:.0f}",
            f"Alive Birds: {stats['alive_birds']}/{stats['total_birds']}"
        ]
        
        title = self.font.render("Training Metrics", True, self.WHITE)
        title_rect = title.get_rect(center=(self.metrics_width//2, metrics_y))
        screen.blit(title, title_rect)
        metrics_y = title_rect.bottom + 20
        
        for text in stats_text:
            text_surface = self.font.render(text, True, self.WHITE)
            text_rect = text_surface.get_rect(center=(self.metrics_width//2, metrics_y))
            screen.blit(text_surface, text_rect)
            metrics_y += 40
        
    def _draw_button(self, screen, rect, text):
        pygame.draw.rect(screen, self.BLUE, rect)
        pygame.draw.rect(screen, self.BLACK, rect, 2)

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
                print(f"Button clicked: {button_name}") 
                return button_name
        return None