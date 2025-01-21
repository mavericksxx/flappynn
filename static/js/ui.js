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
        this.buttonWidth = 140;
        this.speedButtonWidth = 160;
        this.buttonHeight = 40;
        this.buttonMargin = 30;
        this.buttonSpacing = 15;
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
        const canvasRect = event.target.getBoundingClientRect();
        const scaleX = event.target.width / canvasRect.width;
        const scaleY = event.target.height / canvasRect.height;
        
        this.mousePos = {
            x: (event.clientX - canvasRect.left) * scaleX,
            y: (event.clientY - canvasRect.top) * scaleY
        };
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
        
        // Calculate button positions relative to game width
        const buttonStartX = this.gameWidth + (this.metricsWidth - (this.buttonWidth * 2 + this.buttonSpacing)) / 2;
        
        // Update button positions to match where they're actually drawn
        this.buttons = {
            pause: {
                x: buttonStartX,
                y: 20,
                width: this.buttonWidth,
                height: this.buttonHeight
            },
            restart: {
                x: buttonStartX + this.buttonWidth + this.buttonSpacing,
                y: 20,
                width: this.buttonWidth,
                height: this.buttonHeight
            },
            speed: {
                x: this.gameWidth + (this.metricsWidth - this.speedButtonWidth) / 2,
                y: 20 + this.buttonHeight + this.buttonSpacing,
                width: this.speedButtonWidth,
                height: this.buttonHeight
            }
        };
        
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
        // Ensure pos coordinates are properly scaled relative to canvas
        const canvasRect = document.getElementById('gameCanvas').getBoundingClientRect();
        const scaleX = document.getElementById('gameCanvas').width / canvasRect.width;
        const scaleY = document.getElementById('gameCanvas').height / canvasRect.height;
        
        const scaledPos = {
            x: pos.x * scaleX,
            y: pos.y * scaleY
        };
        
        for (const [buttonName, button] of Object.entries(this.buttons)) {
            if (this.isPointInRect(scaledPos, button)) {
                console.log(`Button clicked: ${buttonName}`);
                return buttonName;
            }
        }
        return null;
    }
} 