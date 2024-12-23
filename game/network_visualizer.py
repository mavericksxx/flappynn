import pygame
import numpy as np

class NetworkVisualizer:
    def __init__(self, x, y, width, height):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        
        self.NODE_OUTLINE = (255, 255, 255)  
        self.POSITIVE_COLOR = (255, 255, 255)  
        self.NEGATIVE_COLOR = (255, 0, 0)  
        self.POSITIVE_WEIGHT_COLOR = (255, 255, 255, 128) 
        self.NEGATIVE_WEIGHT_COLOR = (255, 0, 0, 128)  
        self.NODE_RADIUS = 12  
        self.BACKGROUND_COLOR = (20, 20, 20)  
        
        self.layer_spacing = width // 3
        self.input_layer_x = x + self.layer_spacing * 0.5
        self.hidden_layer_x = x + self.layer_spacing * 1.5
        self.output_layer_x = x + self.layer_spacing * 2.5
        
    def draw(self, screen, network, inputs, output):
        pygame.draw.rect(screen, self.BACKGROUND_COLOR, 
                        (self.x, self.y, self.width, self.height))
        pygame.draw.rect(screen, (50, 50, 50), 
                        (self.x, self.y, self.width, self.height), 1)
        
        weights = network.get_weights()
        w1, w2 = weights['w1'], weights['w2']
        hidden_activations = network.last_hidden_activations if hasattr(network, 'last_hidden_activations') else None
        
        input_spacing = self.height // (len(inputs) + 1)
        hidden_spacing = self.height // (w1.shape[1] + 1)
        
        input_nodes = [(self.input_layer_x, self.y + (i+1) * input_spacing) 
                      for i in range(len(inputs))]
        hidden_nodes = [(self.hidden_layer_x, self.y + (i+1) * hidden_spacing) 
                       for i in range(w1.shape[1])]
        output_nodes = [(self.output_layer_x, self.y + self.height//2)]
        
        for i, input_pos in enumerate(input_nodes):
            for j, hidden_pos in enumerate(hidden_nodes):
                weight = w1[i, j]
                color = self.POSITIVE_WEIGHT_COLOR if weight > 0 else self.NEGATIVE_WEIGHT_COLOR
                alpha = int(min(abs(weight) * 255, 255))
                pygame.draw.line(screen, (*color[:3], alpha), input_pos, hidden_pos, 1)  
        
        for i, hidden_pos in enumerate(hidden_nodes):
            for output_pos in output_nodes:
                weight = w2[i, 0]
                color = self.POSITIVE_WEIGHT_COLOR if weight > 0 else self.NEGATIVE_WEIGHT_COLOR
                alpha = int(min(abs(weight) * 255, 255))
                pygame.draw.line(screen, (*color[:3], alpha), hidden_pos, output_pos, 1)  
        def draw_neuron(pos, value=None):
            pygame.draw.circle(screen, self.NODE_OUTLINE, pos, self.NODE_RADIUS, 1)  
            
            if value is not None:
                fill_color = self.POSITIVE_COLOR if value >= 0 else self.NEGATIVE_COLOR
                pygame.draw.circle(screen, fill_color, pos, self.NODE_RADIUS - 1)
                
                font = pygame.font.SysFont('Arial', 10)  
                text = font.render(f"{value:.2f}", True, (0, 0, 0) if value >= 0 else (255, 255, 255))
                text_rect = text.get_rect(center=pos)
                screen.blit(text, text_rect)
        
        for i, pos in enumerate(input_nodes):
            draw_neuron(pos, inputs[i])

        if hidden_activations is not None:
            for i, pos in enumerate(hidden_nodes):
                draw_neuron(pos, hidden_activations[i])
        else:
            for pos in hidden_nodes:
                draw_neuron(pos)

        for pos in output_nodes:
            draw_neuron(pos, output)
        
        font = pygame.font.SysFont('Arial', 12)  
        gen_text = font.render(
            f"Generation: {self.generation}, Neurons: {len(hidden_nodes)}, Connections: {len(input_nodes)*len(hidden_nodes) + len(hidden_nodes)}", 
            True, (150, 150, 150)
        )
        screen.blit(gen_text, (self.x + 10, self.y + self.height - 20))


        legend_y = self.y + self.height - 20
        pygame.draw.line(screen, self.NEGATIVE_WEIGHT_COLOR[:3], 
                        (self.x + self.width - 50, legend_y), 
                        (self.x + self.width - 35, legend_y), 1)
        pygame.draw.line(screen, self.POSITIVE_WEIGHT_COLOR[:3], 
                        (self.x + self.width - 30, legend_y), 
                        (self.x + self.width - 15, legend_y), 1)
        
        legend_font = pygame.font.SysFont('Arial', 10)
        neg_text = legend_font.render("-ve", True, (150, 150, 150))
        pos_text = legend_font.render("+ve", True, (150, 150, 150))
        screen.blit(neg_text, (self.x + self.width - 50, legend_y - 15))
        screen.blit(pos_text, (self.x + self.width - 30, legend_y - 15))