class Bird {
    constructor(x, y, index) {
        this.x = x;
        this.y = y;
        this.index = index;
        
        this.gravity = 0.4;         // Increased from 0.35
        this.flapStrength = -6.5;   // Adjusted from -5.5
        this.maxVelocity = 10;      // Increased from 8
        this.terminalVelocity = 15; // Increased from 12
        this.smoothing = 0.8;       // Reduced from 0.9 for more responsive movement
        
        // Dimensions
        this.width = 34;
        this.height = 24;
        
        // Game stats
        this.alive = true;
        this.fitness = 0;
        this.score = 0;
        this.distance = 0;
        this.lastPipeX = 0;
        
        // Previous gen stats
        this.fitnessPrev = 0;
        this.scorePrev = 0;
        
        // Neural network related properties
        this.currentInputs = null;
        this.currentOutput = null;
        
        // Initialize velocity
        this.velocity = 0;
        
        // Load image with proper error handling
        this.image = new Image();
        this.image.crossOrigin = "anonymous";
        this.imageLoaded = false;
        
        // Set onload before src
        this.image.onload = () => {
            this.imageLoaded = true;
            console.log('Bird image loaded successfully');
        };
        
        this.image.onerror = (error) => {
            console.error('Failed to load bird image:', error);
            this.imageLoaded = false;
        };
        
        // Set src last
        this.image.src = '/static/assets/flappy-bird.png';
    }
    
    flap() {
        if (this.alive) {
            this.velocity = this.flapStrength;
        }
    }
    
    update() {
        if (!this.alive) return;
        
        // Apply gravity
        this.velocity += this.gravity;
        
        // Clamp velocity
        this.velocity = Math.max(
            Math.min(this.velocity, this.terminalVelocity),
            -this.maxVelocity
        );
        
        // Update position
        this.y += this.velocity;
        
        // Update distance
        this.distance += 0.5;
        
        // Keep bird in bounds
        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }
    }
    
    draw(ctx) {
        if (!this.alive || !this.imageLoaded) return;
        
        // Draw only the bird image, remove debug box
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        
        // Remove any debug visualization code
    }
    
    die() {
        this.alive = false;
    }
    
    getRect() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
} 