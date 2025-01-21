class FlappyBirdGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Match Python dimensions
        this.width = 800;
        this.height = 900;
        this.gameHeight = 600;
        this.bottomHeight = 300;
        this.metricsWidth = 300;
        
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Game settings
        this.gameSpeed = 1;
        this.running = true;
        this.paused = false;
        
        // Initialize genetic algorithm first
        this.ga = new GeneticAlgorithm(50, 0.1);
        
        // Initialize arrays
        this.birds = [];
        this.pipes = [];
        this.pipeDistance = 300;
        
        // Stats
        this.stats = {
            generation: 0,
            bestFitness: 0,
            aliveBirds: 0,
            totalBirds: 0,
            speed: 1
        };
        
        // Initialize loading state
        this.assetsLoaded = false;
        
        // Initialize game objects and UI first
        this.reset();
        this.ui = new UI(this.width, this.gameHeight, this.metricsWidth, this.bottomHeight);
        this.setupControls();
        
        // Load assets and start game when ready
        this.loadAssets().then(() => {
            this.assetsLoaded = true;
            console.log('All assets loaded');
            this.start();
        }).catch(error => {
            console.error('Failed to load assets:', error);
            // Start anyway with fallback visuals
            this.start();
        });
    }
    
    scaleImage(img, width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        return canvas;
    }
    
    setupControls() {
        // Add click listener to canvas
        this.canvas.addEventListener('click', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const pos = {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            };
            
            const button = this.ui.handleClick(pos);
            if (button === 'pause') {
                this.paused = !this.paused;
                this.ui.paused = this.paused;
            } else if (button === 'speed') {
                const speeds = [1, 2, 5, 10];
                const currentIndex = speeds.indexOf(this.gameSpeed);
                this.gameSpeed = speeds[(currentIndex + 1) % speeds.length];
                this.stats.speed = this.gameSpeed;
            } else if (button === 'restart') {
                if (this.ga) {
                    this.ga.cleanup();
                }
                this.restart();
            }
        });

        // Add mousemove listener for button hover effects
        this.canvas.addEventListener('mousemove', (event) => {
            this.ui.handleMouseMove(event);
        });

        // Add debug mode toggle
        window.addEventListener('keypress', (event) => {
            if (event.key === 'd') {
                window.debugMode = !window.debugMode;
                console.log('Debug mode:', window.debugMode);
            }
        });
    }
    
    addBird(index) {
        const bird = new Bird(150, this.gameHeight / 2, index);  // Start birds in middle of game area
        this.birds.push(bird);
        return bird;
    }
    
    restart() {
        this.ga.generation = 1;
        this.ga.bestFitness = 0;
        this.ga.createPopulation();
        
        this.reset();
        this.birds = [];
        
        for (let i = 0; i < this.ga.populationSize; i++) {
            this.addBird(i);
        }
        
        this.stats = {
            generation: 1,
            bestFitness: 0,
            speed: 1
        };
        this.gameSpeed = 1;
    }
    
    reset() {
        // Clear arrays
        this.birds = [];
        this.pipes = [];
        
        // Match Python pipe initialization
        for (let i = 0; i < 3; i++) {
            const x = 800 + i * this.pipeDistance;
            this.pipes.push(new Pipe(x, this.gameHeight));
        }
    }
    
    verifyAssetPath(path) {
        const img = new Image();
        img.src = path;
        return new Promise((resolve, reject) => {
            img.onload = () => {
                console.log(`Asset verified: ${path}`);
                resolve(true);
            };
            img.onerror = () => {
                console.error(`Failed to load asset: ${path}`);
                reject(new Error(`Asset not found: ${path}`));
            };
        });
    }
    
    async loadAssets() {
        try {
            // Load background
            this.background = new Image();
            this.background.crossOrigin = "anonymous";
            
            const backgroundLoaded = new Promise((resolve, reject) => {
                this.background.onload = () => {
                    this.background = this.scaleImage(this.background, this.width, this.gameHeight);
                    resolve();
                };
                this.background.onerror = reject;
            });
            
            this.background.src = '/static/assets/background.png';
            await backgroundLoaded;
            
            console.log('Assets loaded successfully');
        } catch (error) {
            console.error('Error loading assets:', error);
            throw error;
        }
    }
    
    start() {
        console.log('Starting game...');
        // Create initial birds
        for (let i = 0; i < this.ga.populationSize; i++) {
            this.addBird(i);
        }
        console.log(`Created ${this.birds.length} birds`);
        
        // Initialize game objects
        this.reset();
        console.log('Game reset complete');
        
        // Start game loop
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
        console.log('Game loop started');
    }
    
    gameLoop(currentTime) {
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        if (!this.paused) {
            // Update multiple times based on game speed
            for (let i = 0; i < this.gameSpeed; i++) {
                this.update();
            }
        }
        
        this.draw();
        this.updateStats();
        
        // Debug info
        if (this.birds.some(b => b.alive)) {
            const aliveBirds = this.birds.filter(b => b.alive).length;
            console.log(`Alive birds: ${aliveBirds}, Generation: ${this.stats.generation}`);
        }
        
        if (this.running) {
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    }
    
    update() {
        // Update birds
        this.birds.forEach(bird => {
            if (bird.alive) {
                bird.update();
                
                // Check if bird hits game area boundaries
                if (bird.y <= 0 || bird.y + bird.height >= this.gameHeight) {
                    bird.die();
                }
                
                // Get closest pipe for AI
                const closestPipe = this.pipes.find(pipe => pipe.x + pipe.width > bird.x);
                
                // Activate neural network
                if (closestPipe) {
                    this.activateBrain(bird, closestPipe);
                    
                    // Check collisions
                    if (this.checkCollision(bird)) {
                        bird.die();
                    }
                    
                    // Update score when passing pipes
                    if (closestPipe.x + closestPipe.width < bird.x && 
                        closestPipe.x > bird.lastPipeX) {
                        bird.score++;
                        bird.lastPipeX = closestPipe.x;
                    }
                    
                    // Update fitness
                    this.updateBirdFitness(bird, closestPipe);
                }
            }
        });
        
        // Check if all birds are dead
        if (this.birds.every(bird => !bird.alive)) {
            this.nextGeneration();
        }
        
        // Update pipes
        this.pipes.forEach(pipe => pipe.update());
        
        // Remove off-screen pipes
        this.pipes = this.pipes.filter(pipe => pipe.x + pipe.width > 0);
        
        // Add new pipes
        if (this.pipes.length < 3) {
            const lastPipe = this.pipes[this.pipes.length - 1];
            const x = lastPipe ? lastPipe.x + this.pipeDistance : this.width;
            this.pipes.push(new Pipe(x, this.gameHeight));
        }
    }
    
    checkCollision(bird) {
        const birdBox = bird.getRect();
        
        // Check collision with pipes
        for (const pipe of this.pipes) {
            // Top pipe collision
            if (this.checkRectCollision(birdBox, {
                x: pipe.x,
                y: 0,
                width: pipe.width,
                height: pipe.gapY
            })) {
                return true;
            }
            
            // Bottom pipe collision
            if (this.checkRectCollision(birdBox, {
                x: pipe.x,
                y: pipe.gapY + pipe.gapHeight,
                width: pipe.width,
                height: this.gameHeight - (pipe.gapY + pipe.gapHeight)
            })) {
                return true;
            }
        }
        
        return false;
    }
    
    checkRectCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    async nextGeneration() {
        try {
            // Sort birds by fitness
            const sortedBirds = [...this.birds].sort((a, b) => 
                (b.fitness || 0) - (a.fitness || 0)
            );
            
            // Store the indexes, not the birds themselves
            const sortedIndexes = sortedBirds.map(bird => bird.index);
            
            // Update best fitness
            const bestFitness = sortedBirds[0]?.fitness || 0;
            this.ga.bestFitness = Math.max(this.ga.bestFitness, bestFitness);
            
            // Evolve population
            const newPopulation = await this.ga.evolvePopulation(sortedIndexes);
            if (!newPopulation || newPopulation.length === 0) {
                throw new Error('Evolution failed to produce new population');
            }
            
            this.ga.population = newPopulation;
            this.ga.generation++;
            
            // Reset game state
            this.reset();
            this.birds = [];
            
            // Create new birds with evolved networks
            for (let i = 0; i < this.ga.populationSize; i++) {
                const bird = this.addBird(i);
                bird.y = this.gameHeight / 2;  // Reset bird position
                bird.velocity = 0;  // Reset velocity
            }
            
            // Update stats
            this.stats.generation = this.ga.generation;
            this.stats.bestFitness = Math.floor(this.ga.bestFitness);
            
            console.log(`Generation ${this.stats.generation} created with ${this.birds.length} birds`);
        } catch (error) {
            console.error('Error in nextGeneration:', error);
            // Recover by creating new population
            this.ga.createPopulation();
            this.reset();
        }
    }
    
    draw() {
        if (!this.assetsLoaded) {
            // Draw loading screen
            this.ctx.fillStyle = '#70c5ce';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Loading...', this.width/2, this.height/2);
            return;
        }
        
        // Clear the entire canvas
        this.ctx.fillStyle = '#70c5ce';  // Sky blue background
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw bottom section first
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, this.gameHeight, this.width, this.bottomHeight);
        
        // Draw dividing lines
        this.ctx.strokeStyle = '#646464';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.gameHeight);
        this.ctx.lineTo(this.width, this.gameHeight);
        this.ctx.moveTo(this.metricsWidth, this.gameHeight);
        this.ctx.lineTo(this.metricsWidth, this.height);
        this.ctx.stroke();
        
        // Draw game area background
        if (this.background) {
            this.ctx.drawImage(this.background, 0, 0, this.width, this.gameHeight);
        }
        
        // Draw game objects (pipes and birds)
        this.pipes.forEach(pipe => pipe.draw(this.ctx));
        this.birds.forEach(bird => bird.draw(this.ctx));
        
        // Draw UI elements (metrics)
        this.ui.draw(this.ctx, this.stats);
        
        // Draw neural network visualization with null checks
        const aliveBird = this.birds.find(b => b.alive);
        if (aliveBird && this.pipes.length > 0) {
            const closestPipe = this.pipes.find(p => p.x + p.width > aliveBird.x);
            if (closestPipe) {
                try {
                    this.drawNeuralNetwork(aliveBird, closestPipe);
                } catch (error) {
                    console.error('Error drawing neural network:', error);
                }
            }
        }
    }
    
    drawNeuralNetwork(bird, closestPipe) {
        // Early return if we don't have valid data
        if (!bird || !bird.currentInputs || !this.ga.population[bird.index]) {
            return;
        }

        const network = this.ga.population[bird.index];
        if (!network || !network.weights1 || !network.weights2) {
            return;
        }

        // Constants for visualization
        const NODE_RADIUS = 12;
        const POSITIVE_COLOR = 'rgb(255, 255, 255)';
        const NEGATIVE_COLOR = 'rgb(255, 0, 0)';
        const BACKGROUND_COLOR = 'rgb(20, 20, 20)';
        
        // Calculate positions
        const x = this.metricsWidth + 20;
        const y = this.gameHeight + 10;
        const width = this.width - this.metricsWidth - 30;
        const height = this.bottomHeight - 20;
        
        // Draw background
        this.ctx.fillStyle = BACKGROUND_COLOR;
        this.ctx.fillRect(x, y, width, height);
        
        // Calculate node positions
        const layerSpacing = width / 3;
        const inputNodes = bird.currentInputs.map((val, i) => ({
            x: x + layerSpacing * 0.5,
            y: y + height * (i + 1) / (bird.currentInputs.length + 1),
            value: val || 0  // Default to 0 if null
        }));
        
        const hiddenNodes = network.weights1[0].map((_, i) => ({
            x: x + layerSpacing * 1.5,
            y: y + height * (i + 1) / (network.weights1[0].length + 1),
            value: (network.lastHiddenActivations && network.lastHiddenActivations[i]) || 0
        }));
        
        const outputNode = {
            x: x + layerSpacing * 2.5,
            y: y + height / 2,
            value: bird.currentOutput || 0
        };
        
        // Draw connections
        this.ctx.lineWidth = 1;
        
        // Input to hidden connections
        inputNodes.forEach((input, i) => {
            hiddenNodes.forEach((hidden, j) => {
                if (network.weights1[i] && typeof network.weights1[i][j] === 'number') {
                    const weight = network.weights1[i][j];
                    const alpha = Math.min(Math.abs(weight), 1);
                    this.ctx.strokeStyle = `rgba(${weight > 0 ? '255,255,255' : '255,0,0'},${alpha})`;
                    this.ctx.beginPath();
                    this.ctx.moveTo(input.x, input.y);
                    this.ctx.lineTo(hidden.x, hidden.y);
                    this.ctx.stroke();
                }
            });
        });
        
        // Hidden to output connections
        hiddenNodes.forEach((hidden, i) => {
            if (network.weights2[i] && typeof network.weights2[i][0] === 'number') {
                const weight = network.weights2[i][0];
                const alpha = Math.min(Math.abs(weight), 1);
                this.ctx.strokeStyle = `rgba(${weight > 0 ? '255,255,255' : '255,0,0'},${alpha})`;
                this.ctx.beginPath();
                this.ctx.moveTo(hidden.x, hidden.y);
                this.ctx.lineTo(outputNode.x, outputNode.y);
                this.ctx.stroke();
            }
        });
        
        // Draw nodes
        const drawNode = (node) => {
            if (!node || typeof node.value === 'undefined') return;
            
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
            this.ctx.fillStyle = node.value >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR;
            this.ctx.fill();
            this.ctx.stroke();
            
            // Draw value
            this.ctx.fillStyle = node.value >= 0 ? 'black' : 'white';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.font = '10px Arial';
            this.ctx.fillText(node.value.toFixed(2), node.x, node.y);
        };
        
        // Draw all nodes
        inputNodes.forEach(drawNode);
        hiddenNodes.forEach(drawNode);
        drawNode(outputNode);
    }
    
    updateStats() {
        // Update stats object
        this.stats.aliveBirds = this.birds.filter(b => b.alive).length;
        this.stats.totalBirds = this.birds.length;
        
        // Update best fitness if needed
        const currentBestFitness = Math.max(...this.birds.map(b => b.fitness));
        if (currentBestFitness > this.stats.bestFitness) {
            this.stats.bestFitness = currentBestFitness;
        }
    }
    
    updateBirdFitness(bird, closestPipe) {
        if (!bird.alive || !closestPipe) return;
        
        const dx = closestPipe.x + closestPipe.width - bird.x;
        const pipeCenter = closestPipe.gapY + closestPipe.gapHeight/2;
        const dy = Math.abs(bird.y - pipeCenter);
        
        // Improved fitness function with better rewards
        bird.fitness = (
            bird.score * 1000 +           // Much higher reward for passing pipes
            bird.distance * 1.0 +         // Increased distance reward
            (1000 / (dy + 1)) +          // Better height positioning reward
            (dx > 0 ? 250 : 0) +         // Reward for surviving
            (bird.y > 50 && bird.y < this.gameHeight - 50 ? 100 : 0)  // Stay in safe zone
        );
        
        // Heavy penalty for dying early
        if (bird.distance < 100) {
            bird.fitness *= 0.1;
        }
        
        // Penalty for extreme positions
        if (bird.y < 50 || bird.y > this.gameHeight - 50) {
            bird.fitness *= 0.5;
        }
    }
    
    async activateBrain(bird, pipe) {
        if (!pipe || !bird.alive) return;
        
        try {
            // Calculate normalized inputs
            const horizontalDistance = Math.min((pipe.x + pipe.width - bird.x) / 300, 1.0);
            const heightDifference = ((bird.y - (pipe.gapY + pipe.gapHeight/2)) / 200);
            const velocity = bird.velocity / 8;
            
            bird.currentInputs = [horizontalDistance, heightDifference, velocity];
            
            const network = this.ga.population[bird.index];
            if (!network) {
                return;
            }
            
            // Get network output
            const output = network.forward(bird.currentInputs);
            bird.currentOutput = output;
            
            // Flap if output is high enough
            if (output > 0.5) {
                bird.flap();
            }
            
        } catch (error) {
            console.error('Error in activateBrain:', error);
        }
    }
}

// Start game when page loads
window.addEventListener('load', () => {
    new FlappyBirdGame();
}); 