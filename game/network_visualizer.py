import pygame
import numpy as np

class NetworkVisualizer:
    def __init__(self, x, y, width, height):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        
        # Colors
        self.NODE_OUTLINE = (255, 255, 255)  # White outline
        self.POSITIVE_COLOR = (255, 255, 255)  # White for positive values
        self.NEGATIVE_COLOR = (255, 0, 0)  # Red for negative values
        self.POSITIVE_WEIGHT_COLOR = (255, 255, 255)  # White for positive weights
        self.NEGATIVE_WEIGHT_COLOR = (255, 0, 0)  # Red for negative weights
        self.NODE_RADIUS = 15
        self.BACKGROUND_COLOR = (0, 0, 0)  # Black background
        
        # Layer spacing - distribute nodes across width
        self.layer_spacing = width // 4
        self.input_layer_x = x + self.layer_spacing
        self.hidden_layer_x = x + 2 * self.layer_spacing
        self.output_layer_x = x + 3 * self.layer_spacing
        
    def draw(self, screen, network, inputs, output):
        # Draw background
        pygame.draw.rect(screen, self.BACKGROUND_COLOR, 
                        (self.x, self.y, self.width, self.height))
        
        # Get weights from network
        weights = network.get_weights()
        w1, w2 = weights['w1'], weights['w2']
        hidden_activations = network.last_hidden_activations if hasattr(network, 'last_hidden_activations') else None
        
        # Calculate node positions
        input_spacing = self.height // (len(inputs) + 1)
        hidden_spacing = self.height // (w1.shape[1] + 1)
        
        input_nodes = [(self.input_layer_x, self.y + (i+1) * input_spacing) 
                      for i in range(len(inputs))]
        hidden_nodes = [(self.hidden_layer_x, self.y + (i+1) * hidden_spacing) 
                       for i in range(w1.shape[1])]
        output_nodes = [(self.output_layer_x, self.y + self.height//2)]
        
        # Draw connections first (weights)
        # Input to hidden
        for i, input_pos in enumerate(input_nodes):
            for j, hidden_pos in enumerate(hidden_nodes):
                weight = w1[i, j]
                color = self.POSITIVE_WEIGHT_COLOR if weight > 0 else self.NEGATIVE_WEIGHT_COLOR
                alpha = int(min(abs(weight) * 255, 255))
                pygame.draw.line(screen, (*color[:3], alpha), input_pos, hidden_pos, 1)
        
        # Hidden to output
        for i, hidden_pos in enumerate(hidden_nodes):
            for output_pos in output_nodes:
                weight = w2[i, 0]
                color = self.POSITIVE_WEIGHT_COLOR if weight > 0 else self.NEGATIVE_WEIGHT_COLOR
                alpha = int(min(abs(weight) * 255, 255))
                pygame.draw.line(screen, (*color[:3], alpha), hidden_pos, output_pos, 1)
        
        def draw_neuron(pos, value=None):
            # Draw white outline
            pygame.draw.circle(screen, self.NODE_OUTLINE, pos, self.NODE_RADIUS, 2)
            
            # If there's a value, fill the neuron based on its value
            if value is not None:
                fill_color = self.POSITIVE_COLOR if value >= 0 else self.NEGATIVE_COLOR
                pygame.draw.circle(screen, fill_color, pos, self.NODE_RADIUS - 2)
                
                # Draw the value
                font = pygame.font.SysFont('Arial', 12)
                text = font.render(f"{value:.2f}", True, (255, 255, 255))
                text_rect = text.get_rect(center=(pos[0] + self.NODE_RADIUS + 5, pos[1]))
                screen.blit(text, text_rect)
        
        # Draw input neurons
        for i, pos in enumerate(input_nodes):
            draw_neuron(pos, inputs[i])
        
        # Draw hidden neurons
        if hidden_activations is not None:
            for i, pos in enumerate(hidden_nodes):
                draw_neuron(pos, hidden_activations[i])
        else:
            for pos in hidden_nodes:
                draw_neuron(pos)
        
        # Draw output neurons
        for pos in output_nodes:
            draw_neuron(pos, output)
        
        # Add generation info at bottom
        font = pygame.font.SysFont('Arial', 16)
        gen_text = font.render(
            f"Generation: {self.generation}, Neurons: {len(hidden_nodes)}, Connections: {len(input_nodes)*len(hidden_nodes) + len(hidden_nodes)}", 
            True, (150, 150, 150)
        )
        screen.blit(gen_text, (self.x + 10, self.y + self.height - 30))