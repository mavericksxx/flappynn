class GeneticAlgorithm {
    constructor(populationSize = 50, mutationRate = 0.2) {
        this.populationSize = populationSize;
        this.mutationRate = mutationRate;
        this.generation = 1;
        this.bestFitness = 0;
        this.population = [];
        
        // Initialize mutation rates
        this.initialMutationRate = 0.25;
        this.normalMutationRate = 0.1;
        this.eliteSize = 2;
        
        this.pendingPromises = new Map();
        
        // Create initial population
        this.createPopulation();
        
        // Initialize worker after population is created
        this.initWorker();
    }
    
    initWorker() {
        if (this.worker) {
            this.worker.terminate();
        }
        
        try {
            this.worker = new Worker('/static/js/ai.worker.js');
            
            this.worker.onmessage = (e) => {
                const { type, data } = e.data;
                const resolve = this.pendingPromises.get(type);
                if (resolve) {
                    resolve(data);
                    this.pendingPromises.delete(type);
                }
            };
            
            this.worker.onerror = (error) => {
                console.error('Worker error:', error);
                // Reinitialize worker on error
                setTimeout(() => this.initWorker(), 1000);
            };
        } catch (error) {
            console.error('Failed to initialize worker:', error);
        }
    }
    
    createPopulation() {
        console.log('Creating new population...');
        this.population = [];
        for (let i = 0; i < this.populationSize; i++) {
            const network = new NeuralNetwork();
            // Verify network initialization
            if (!network.weights1 || !network.weights2) {
                console.error('Network not properly initialized');
            }
            this.population.push(network);
        }
        console.log(`Created population of ${this.population.length} networks`);
    }
    
    crossover(parent1, parent2) {
        const child = new NeuralNetwork();
        
        // Improved crossover with weighted averaging
        const crossoverValue = (v1, v2) => {
            const r = Math.random();
            return v1 * r + v2 * (1 - r);  // Weighted average
        };
        
        // Crossover weights and biases
        child.weights1 = parent1.weights1.map((row, i) => 
            row.map((w, j) => crossoverValue(w, parent2.weights1[i][j]))
        );
        
        child.weights2 = parent1.weights2.map((row, i) => 
            row.map((w, j) => crossoverValue(w, parent2.weights2[i][j]))
        );
        
        child.bias1 = parent1.bias1.map((b, i) => 
            crossoverValue(b, parent2.bias1[i])
        );
        
        child.bias2 = parent2.bias2.map((b, i) => 
            crossoverValue(b, parent2.bias2[i])
        );
        
        return child;
    }
    
    mutate(network) {
        const mutationStrength = 0.5;  // Increased from 0.2
        
        // Mutate weights with improved probability distribution
        const mutateValue = (value) => {
            if (Math.random() < this.mutationRate) {
                // Use Gaussian distribution for mutations
                const gaussian = () => {
                    let u = 0, v = 0;
                    while (u === 0) u = Math.random();
                    while (v === 0) v = Math.random();
                    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
                };
                return value + gaussian() * mutationStrength;
            }
            return value;
        };

        // Apply mutations with higher probability in early generations
        const earlyGenBonus = Math.max(0, 5 - this.generation) * 0.1;
        this.mutationRate = this.normalMutationRate + earlyGenBonus;

        // Apply mutations
        network.weights1 = network.weights1.map(row => row.map(mutateValue));
        network.weights2 = network.weights2.map(row => row.map(mutateValue));
        network.bias1 = network.bias1.map(mutateValue);
        network.bias2 = network.bias2.map(mutateValue);
        
        return network;
    }
    
    async activateBrain(bird, pipe) {
        if (!pipe) return;
        
        const horizontalDistance = (pipe.x + pipe.width - bird.x) / 300;
        const heightDifference = (bird.y - (pipe.gapY + pipe.gapHeight/2)) / 200;
        const velocity = bird.velocity / 8;
        
        bird.currentInputs = [horizontalDistance, heightDifference, velocity];
        
        const network = this.population[bird.index];
        if (!network) return;
        
        // Use Web Worker for forward pass
        try {
            const result = await this.workerForward(bird.currentInputs, network);
            bird.currentOutput = result.output;
            network.lastHiddenActivations = result.lastHiddenActivations;
            
            if (result.output > 0.5) {
                bird.flap();
            }
        } catch (error) {
            console.error('Error in activateBrain:', error);
        }
    }
    
    workerForward(inputs, network) {
        return new Promise((resolve, reject) => {
            if (!this.worker) {
                console.log('Initializing new worker...');
                this.initWorker();
            }
            
            try {
                const messageData = {
                    type: 'FORWARD',
                    data: {
                        inputs: inputs,
                        weights1: network.weights1,
                        weights2: network.weights2,
                        bias1: network.bias1,
                        bias2: network.bias2
                    }
                };
                
                this.pendingPromises.set('FORWARD_RESULT', resolve);
                this.worker.postMessage(messageData);
            } catch (error) {
                console.error('Error in workerForward:', error);
                reject(error);
            }
        });
    }
    
    async evolvePopulation(sortedBirdIndexes) {
        // Validate inputs
        if (!Array.isArray(sortedBirdIndexes) || sortedBirdIndexes.length === 0) {
            console.error('Invalid bird indexes for evolution');
            return this.population;
        }

        // Adjust mutation rate based on generation
        this.mutationRate = this.generation <= 3 ? this.initialMutationRate : this.normalMutationRate;
        
        // Create a clean copy of the population data for the worker
        const populationData = this.population.map(network => ({
            weights1: network.weights1.map(row => [...row]),
            weights2: network.weights2.map(row => [...row]),
            bias1: [...network.bias1],
            bias2: [...network.bias2]
        }));

        return new Promise((resolve, reject) => {
            if (!this.worker) {
                this.initWorker();
            }
            
            try {
                this.pendingPromises.set('EVOLVE_RESULT', (newPopulation) => {
                    // Convert the plain objects back to NeuralNetwork instances
                    const evolvedPopulation = newPopulation.map(networkData => {
                        const network = new NeuralNetwork();
                        network.weights1 = networkData.weights1;
                        network.weights2 = networkData.weights2;
                        network.bias1 = networkData.bias1;
                        network.bias2 = networkData.bias2;
                        return network;
                    });
                    resolve(evolvedPopulation);
                });

                this.worker.postMessage({
                    type: 'EVOLVE',
                    data: {
                        population: populationData,
                        sortedBirdIndexes,
                        populationSize: this.populationSize,
                        mutationRate: this.mutationRate
                    }
                });
            } catch (error) {
                console.error('Error in evolvePopulation:', error);
                reject(error);
            }
        });
    }
    
    cleanup() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
        this.pendingPromises.clear();
    }
} 