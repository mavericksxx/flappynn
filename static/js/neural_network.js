class NeuralNetwork {
    constructor(inputSize = 3, hiddenSize = 8, outputSize = 1) {
        this.inputSize = inputSize;
        this.hiddenSize = hiddenSize;
        this.outputSize = outputSize;
        
        // Initialize weights and biases
        this.weights1 = this.createRandomMatrix(inputSize, hiddenSize);
        this.weights2 = this.createRandomMatrix(hiddenSize, outputSize);
        this.bias1 = this.createRandomArray(hiddenSize);
        this.bias2 = this.createRandomArray(outputSize);
        
        // Verify initialization
        if (!this.weights1 || !this.weights2) {
            throw new Error('Failed to initialize neural network weights');
        }
    }

    createRandomMatrix(rows, cols) {
        return Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => (Math.random() * 2 - 1) * 0.5)
        );
    }

    createRandomArray(size) {
        return Array.from({ length: size }, () => (Math.random() * 2 - 1) * 0.5);
    }

    sigmoid(x) {
        return 1 / (1 + Math.exp(-Math.max(-10, Math.min(10, x))));
    }

    forward(inputs) {
        const normalizedInputs = [...inputs];
        
        // Clamp inputs to [-1, 1]
        normalizedInputs.forEach((val, i) => {
            normalizedInputs[i] = Math.max(-1, Math.min(1, val));
        });
        
        // Hidden layer
        const hidden = Array(this.hiddenSize).fill(0);
        for (let i = 0; i < this.hiddenSize; i++) {
            let sum = this.bias1[i];
            for (let j = 0; j < this.inputSize; j++) {
                sum += normalizedInputs[j] * this.weights1[j][i];
            }
            hidden[i] = this.sigmoid(sum);
        }

        // Output layer
        let output = this.bias2[0];
        for (let i = 0; i < this.hiddenSize; i++) {
            output += hidden[i] * this.weights2[i][0];
        }
        
        // Single sigmoid activation
        const finalOutput = this.sigmoid(output);
        
        // Store for visualization
        this.lastHiddenActivations = hidden;
        this.lastOutput = finalOutput;
        
        return finalOutput;
    }

    copy() {
        const newNetwork = new NeuralNetwork(this.inputSize, this.hiddenSize, this.outputSize);
        newNetwork.weights1 = this.weights1.map(row => [...row]);
        newNetwork.weights2 = this.weights2.map(row => [...row]);
        newNetwork.bias1 = [...this.bias1];
        newNetwork.bias2 = [...this.bias2];
        return newNetwork;
    }
} 