class UI {
    constructor(width, gameHeight, metricsWidth, bottomHeight) {
        this.width = width;
        this.gameHeight = gameHeight;
        this.metricsWidth = metricsWidth;
        this.bottomHeight = bottomHeight;
        
        // Colors matching Python
        this.WHITE = 'rgb(255, 255, 255)';
        this.BLACK = 'rgb(0, 0, 0)';
        this.GRAY = 'rgb(128, 128, 128)';
        this.BLUE = 'rgb(0, 120, 255)';
        
        // Button dimensions matching Python
        this.buttonWidth = 100;
        this.speedButtonWidth = 120;
        this.buttonHeight = 30;
        this.buttonMargin = 20;
        this.buttonSpacing = 10;
        this.metricsCenterX = metricsWidth / 2;
        
        // Calculate button positions
        const totalWidth = (this.buttonWidth * 2) + this.buttonSpacing;
        const startX = this.metricsCenterX - (totalWidth / 2);
        
        // Button rectangles
        this.buttons = {
            pause: {
                x: startX,
                y: gameHeight + this.buttonMargin,
                width: this.buttonWidth,
                height: this.buttonHeight
            },
            restart: {
                x: startX + this.buttonWidth + this.buttonSpacing,
                y: gameHeight + this.buttonMargin,
                width: this.buttonWidth,
                height: this.buttonHeight
            },
            speed: {
                x: this.metricsCenterX - (this.speedButtonWidth / 2),
                y: gameHeight + this.buttonMargin + this.buttonHeight + this.buttonSpacing,
                width: this.speedButtonWidth,
                height: this.buttonHeight
            }
        };
        
        this.paused = false;
        
        // Match Python's font initialization
        this.font = '24px Arial';
        this.smallFont = '16px Arial';
        
        // Add alpha value to match Python's surface alpha
        this.buttonAlpha = 230;  // Matches Python's set_alpha(230)
        
        // Add mouse position tracking
        this.mousePos = { x: 0, y: 0 };
        
        // Bind the mousemove handler
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }
    
    handleMouseMove(event) {
        const rect = event.target.getBoundingClientRect();
        this.mousePos = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }
    
    draw(ctx, stats) {
        // Use stored mouse position
        const mousePos = this.mousePos;
        
        // Draw metrics background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, this.gameHeight, this.metricsWidth, this.bottomHeight);
        
        // Draw buttons
        for (const [buttonName, button] of Object.entries(this.buttons)) {
            const hover = this.isPointInRect(mousePos, button);
            const color = hover ? 'rgb(0, 150, 255)' : this.BLUE;
            
            // Draw button background
            ctx.fillStyle = color;
            ctx.globalAlpha = this.buttonAlpha / 255;
            ctx.fillRect(button.x, button.y, button.width, button.height);
            ctx.globalAlpha = 1;
            
            // Draw button border
            ctx.strokeStyle = this.WHITE;
            ctx.lineWidth = 2;
            ctx.strokeRect(button.x, button.y, button.width, button.height);
            
            // Draw button text
            let text;
            if (buttonName === 'pause') {
                text = this.paused ? "Resume" : "Pause";
            } else if (buttonName === 'restart') {
                text = "Restart";
            } else {
                text = `Speed: ${stats.speed}x`;
            }
            
            ctx.font = this.font;
            ctx.fillStyle = this.WHITE;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, button.x + button.width/2, button.y + button.height/2);
        }
        
        // Draw metrics text
        let metricsY = this.gameHeight + 140;
        
        ctx.font = this.font;
        ctx.fillStyle = this.WHITE;
        ctx.textAlign = 'center';
        
        // Draw title
        const title = "Training Metrics";
        ctx.fillText(title, this.metricsWidth/2, metricsY);
        metricsY += 60;
        
        // Draw stats
        const statsText = [
            `Generation: ${stats.generation}`,
            `Best Fitness: ${Math.floor(stats.bestFitness)}`,
            `Alive Birds: ${stats.aliveBirds}/${stats.totalBirds}`
        ];
        
        for (const text of statsText) {
            ctx.fillText(text, this.metricsWidth/2, metricsY);
            metricsY += 40;
        }
    }
    
    isPointInRect(point, rect) {
        return point.x >= rect.x && point.x <= rect.x + rect.width &&
               point.y >= rect.y && point.y <= rect.y + rect.height;
    }
    
    handleClick(pos) {
        for (const [buttonName, button] of Object.entries(this.buttons)) {
            if (this.isPointInRect(pos, button)) {
                console.log(`Button clicked: ${buttonName}`);
                return buttonName;
            }
        }
        return null;
    }
} 