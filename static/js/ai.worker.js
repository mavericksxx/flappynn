// Remove the importScripts line since we're implementing everything in the worker
// self.importScripts('neural_network.js');

// Neural Network functions for Web Worker
function sigmoid(x) {
    return 1 / (1 + Math.exp(-Math.max(-10, Math.min(10, x))));
}

function forward(inputs, weights1, weights2, bias1, bias2) {
    // Normalize inputs
    const normalizedInputs = inputs.map(x => Math.max(-1, Math.min(1, x)));
    
    // Hidden layer
    const hidden = Array(weights1[0].length).fill(0);
    for (let i = 0; i < hidden.length; i++) {
        let sum = bias1[i];
        for (let j = 0; j < inputs.length; j++) {
            sum += normalizedInputs[j] * weights1[j][i];
        }
        hidden[i] = sigmoid(sum);
    }
    
    // Output layer
    let output = bias2[0];
    for (let i = 0; i < hidden.length; i++) {
        output += hidden[i] * weights2[i][0];
    }
    output = sigmoid(output);
    
    return {
        output,
        lastHiddenActivations: hidden
    };
}

function copyNetwork(network) {
    if (!network || !network.weights1 || !network.weights2 || 
        !network.bias1 || !network.bias2) {
        throw new Error('Invalid network structure');
    }
    
    return {
        weights1: network.weights1.map(row => [...row]),
        weights2: network.weights2.map(row => [...row]),
        bias1: [...network.bias1],
        bias2: [...network.bias2]
    };
}

function evolvePopulation(population, sortedBirdIndexes, populationSize, mutationRate) {
    // Validate inputs
    if (!Array.isArray(population) || !Array.isArray(sortedBirdIndexes) || 
        population.length === 0 || sortedBirdIndexes.length === 0) {
        console.error('Invalid population or indexes');
        return population;
    }

    const newPopulation = [];
    
    try {
        // Copy best networks (elitism)
        const bestNetwork = population[sortedBirdIndexes[0]];
        const secondBestNetwork = population[sortedBirdIndexes[1]];
        
        if (!bestNetwork || !secondBestNetwork) {
            throw new Error('Could not find best networks');
        }
        
        newPopulation.push(copyNetwork(bestNetwork));
        newPopulation.push(copyNetwork(secondBestNetwork));
        
        // Generate rest through crossover and mutation
        while (newPopulation.length < populationSize) {
            // Select parents from top 5 networks
            const topCount = Math.min(5, sortedBirdIndexes.length);
            const parent1 = population[sortedBirdIndexes[Math.floor(Math.random() * topCount)]];
            const parent2 = population[sortedBirdIndexes[Math.floor(Math.random() * topCount)]];
            
            if (!parent1 || !parent2) {
                throw new Error('Invalid parent selection');
            }
            
            const child = crossover(parent1, parent2);
            mutate(child, mutationRate);
            newPopulation.push(child);
        }
        
        return newPopulation;
    } catch (error) {
        console.error('Error in evolvePopulation:', error);
        return population; // Return original population on error
    }
}

function crossover(parent1, parent2) {
    const child = {
        weights1: [],
        weights2: [],
        bias1: [],
        bias2: []
    };
    
    // Crossover weights1
    for (let i = 0; i < parent1.weights1.length; i++) {
        child.weights1[i] = [];
        for (let j = 0; j < parent1.weights1[i].length; j++) {
            child.weights1[i][j] = Math.random() < 0.5 ? parent1.weights1[i][j] : parent2.weights1[i][j];
        }
    }
    
    // Crossover weights2
    for (let i = 0; i < parent1.weights2.length; i++) {
        child.weights2[i] = [];
        for (let j = 0; j < parent1.weights2[i].length; j++) {
            child.weights2[i][j] = Math.random() < 0.5 ? parent1.weights2[i][j] : parent2.weights2[i][j];
        }
    }
    
    // Crossover biases
    child.bias1 = parent1.bias1.map((b, i) => Math.random() < 0.5 ? b : parent2.bias1[i]);
    child.bias2 = parent1.bias2.map((b, i) => Math.random() < 0.5 ? b : parent2.bias2[i]);
    
    return child;
}

function mutate(network, mutationRate) {
    const mutateValue = (value) => {
        if (Math.random() < mutationRate) {
            return value + (Math.random() * 2 - 1) * 0.2;
        }
        return value;
    };
    
    // Mutate weights
    for (let i = 0; i < network.weights1.length; i++) {
        for (let j = 0; j < network.weights1[i].length; j++) {
            network.weights1[i][j] = mutateValue(network.weights1[i][j]);
        }
    }
    
    for (let i = 0; i < network.weights2.length; i++) {
        for (let j = 0; j < network.weights2[i].length; j++) {
            network.weights2[i][j] = mutateValue(network.weights2[i][j]);
        }
    }
    
    // Mutate biases
    network.bias1 = network.bias1.map(mutateValue);
    network.bias2 = network.bias2.map(mutateValue);
}

// Web Worker message handler
self.onmessage = function(e) {
    const { type, data } = e.data;
    
    try {
        if (type === 'FORWARD') {
            const result = forward(
                data.inputs,
                data.weights1,
                data.weights2,
                data.bias1,
                data.bias2
            );
            self.postMessage({ type: 'FORWARD_RESULT', data: result });
        }
        else if (type === 'EVOLVE') {
            const newPopulation = evolvePopulation(
                data.population,
                data.sortedBirdIndexes,
                data.populationSize,
                data.mutationRate
            );
            self.postMessage({ type: 'EVOLVE_RESULT', data: newPopulation });
        }
    } catch (error) {
        console.error('Worker error:', error);
        self.postMessage({ type: 'ERROR', data: error.message });
    }
}; 