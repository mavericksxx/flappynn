class UI {
    constructor(width, gameHeight, metricsWidth, bottomHeight, gameWidth) {
        this.width = width;
        this.gameHeight = gameHeight;
        this.metricsWidth = metricsWidth;
        this.bottomHeight = bottomHeight;
        this.gameWidth = gameWidth;
        
        // Colors matching Python
        this.WHITE = 'rgb(255, 255, 255)';
        this.BLACK = 'rgb(0, 0, 0)';
        this.GRAY = 'rgb(128, 128, 128)';
        this.BLUE = 'rgb(0, 120, 255)';
        
        // Button dimensions matching Python
        this.buttonWidth = 100;
        this.speedButtonWidth = 160;
        this.buttonHeight = 40;
        this.buttonSpacing = 20;
        this.metricsCenterX = metricsWidth / 2;
        
        // Calculate button positions
        const totalWidth = (this.buttonWidth * 3) + this.buttonSpacing;
        const startX = this.gameWidth + 20;
        
        // Create buttons
        this.buttons = {
            pause: {
                x: startX,
                y: 20,
                width: this.buttonWidth,
                height: this.buttonHeight,
                text: 'Pause',
                hover: false
            },
            speed: {
                x: startX + this.buttonWidth + this.buttonSpacing,
                y: 20,
                width: this.buttonWidth,
                height: this.buttonHeight,
                text: 'Speed: 1x',
                hover: false
            },
            restart: {
                x: startX + (this.buttonWidth + this.buttonSpacing) * 2,
                y: 20,
                width: this.buttonWidth,
                height: this.buttonHeight,
                text: 'Restart',
                hover: false
            }
        };
        
        this.paused = false;
        
        // Match Python's font initialization
        this.font = '32px Arial';
        this.smallFont = '24px Arial';
        
        // Add alpha value to match Python's surface alpha
        this.buttonAlpha = 230;  // Matches Python's set_alpha(230)
        
        // Add mouse position tracking
        this.mousePos = { x: 0, y: 0 };
        
        // Bind the mousemove handler
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }
    
    handleMouseMove(event) {
        const rect = event.target.getBoundingClientRect();
        const pos = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };

        for (const button of Object.values(this.buttons)) {
            button.hover = this.isInside(pos, button);
        }
    }
    
    draw(ctx, stats) {
        // Use stored mouse position
        const mousePos = this.mousePos;
        
        // Draw metrics background (on the right side)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(this.gameWidth, 0, this.metricsWidth, this.height);
        
        // Add a separator line
        ctx.strokeStyle = this.GRAY;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.gameWidth, 0);
        ctx.lineTo(this.gameWidth, this.height);
        ctx.stroke();
        
        // Update speed button text
        this.buttons.speed.text = `Speed: ${stats.speed}x`;
        this.buttons.pause.text = this.paused ? 'Resume' : 'Pause';
        
        // Draw buttons
        for (const button of Object.values(this.buttons)) {
            ctx.fillStyle = button.hover ? '#444' : '#333';
            ctx.fillRect(button.x, button.y, button.width, button.height);
            
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 2;
            ctx.strokeRect(button.x, button.y, button.width, button.height);
            
            ctx.fillStyle = 'white';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(button.text, button.x + button.width/2, button.y + button.height/2);
        }
        
        // Draw metrics text with more space at the bottom
        let metricsY = 150;  // Start position
        
        ctx.font = this.font;
        ctx.fillStyle = this.WHITE;
        ctx.textAlign = 'center';
        
        // Draw title
        const title = "Training Metrics";
        ctx.fillText(title, this.gameWidth + this.metricsWidth/2, metricsY);
        metricsY += 40;
        
        // Draw stats with less vertical spacing
        const statsText = [
            `Generation: ${stats.generation}`,
            `Best Fitness: ${Math.floor(stats.bestFitness)}`,
            `Alive Birds: ${stats.aliveBirds}/${stats.totalBirds}`
        ];
        
        for (const text of statsText) {
            ctx.fillText(text, this.gameWidth + this.metricsWidth/2, metricsY);
            metricsY += 35;  // Reduced spacing between stats
        }
    }
    
    isPointInRect(point, rect) {
        return point.x >= rect.x && point.x <= rect.x + rect.width &&
               point.y >= rect.y && point.y <= rect.y + rect.height;
    }
    
    handleClick(pos) {
        for (const [name, button] of Object.entries(this.buttons)) {
            if (this.isInside(pos, button)) {
                return name;
            }
        }
        return null;
    }

    isInside(pos, button) {
        return pos.x > button.x && 
               pos.x < button.x + button.width &&
               pos.y > button.y && 
               pos.y < button.y + button.height;
    }
} 