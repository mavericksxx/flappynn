import numpy as np

class NeuralNetwork:
    def __init__(self, input_size=3, hidden_size=6, output_size=1):
        self.input_size = input_size
        self.hidden_size = hidden_size
        self.output_size = output_size
        
        # Initialize weights with smaller values
        self.weights1 = np.random.randn(input_size, hidden_size) * 0.1
        self.weights2 = np.random.randn(hidden_size, output_size) * 0.1
        self.bias1 = np.random.randn(hidden_size) * 0.1
        self.bias2 = np.random.randn(output_size) * 0.1
    
    def sigmoid(self, x):
        return 1 / (1 + np.exp(-x))
    
    def forward(self, inputs):
        # Convert inputs to numpy array
        x = np.array(inputs)
        
        # Hidden layer
        hidden = self.sigmoid(np.dot(x, self.weights1) + self.bias1)
        
        # Output layer
        output = self.sigmoid(np.dot(hidden, self.weights2) + self.bias2)
        
        return output[0]  # Return scalar value
    
    def get_weights(self):
        return {
            'w1': self.weights1,
            'w2': self.weights2,
            'b1': self.bias1,
            'b2': self.bias2
        }
    
    def set_weights(self, weights):
        self.weights1 = weights['w1']
        self.weights2 = weights['w2']
        self.bias1 = weights['b1']
        self.bias2 = weights['b2'] 
    
    def copy(self):
        """Create a deep copy of the neural network"""
        new_network = NeuralNetwork(self.input_size, self.hidden_size, self.output_size)
        weights = self.get_weights()
        new_network.set_weights({
            'w1': weights['w1'].copy(),
            'w2': weights['w2'].copy(),
            'b1': weights['b1'].copy(),
            'b2': weights['b2'].copy()
        })
        return new_network