class UI {
    constructor(width, gameHeight, metricsWidth, bottomHeight, gameWidth) {
        this.width = width;
        this.gameHeight = gameHeight;
        this.metricsWidth = metricsWidth;
        this.bottomHeight = bottomHeight;
        this.gameWidth = gameWidth;
        this.height = gameHeight;
        
        // Colors
        this.WHITE = 'rgb(255, 255, 255)';
        this.BLACK = 'rgb(0, 0, 0)';
        this.GRAY = 'rgb(128, 128, 128)';
        this.BLUE = 'rgb(0, 120, 255)';
        this.HOVER_BLUE = 'rgb(0, 150, 255)';
        
        // Button dimensions
        this.buttonWidth = 140;
        this.speedButtonWidth = 160;
        this.buttonHeight = 40;
        this.buttonMargin = 30;
        this.buttonSpacing = 15;
        
        // Calculate button positions
        const buttonStartX = this.gameWidth + (this.metricsWidth - (this.buttonWidth * 2 + this.buttonSpacing)) / 2;
        
        // Create buttons
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
        
        this.paused = false;
        this.font = '32px Arial';
        this.smallFont = '24px Arial';
        this.buttonAlpha = 230;
        this.mousePos = { x: 0, y: 0 };
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
        // Draw metrics background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(this.gameWidth, 0, this.metricsWidth, this.height);
        
        // Separator line
        ctx.strokeStyle = this.GRAY;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.gameWidth, 0);
        ctx.lineTo(this.gameWidth, this.height);
        ctx.stroke();
        
        // Draw buttons
        for (const [buttonName, button] of Object.entries(this.buttons)) {
            const hover = this.isPointInRect(this.mousePos, button);
            const color = hover ? this.HOVER_BLUE : this.BLUE;
            
            // Button background
            ctx.fillStyle = color;
            ctx.globalAlpha = this.buttonAlpha / 255;
            ctx.fillRect(button.x, button.y, button.width, button.height);
            ctx.globalAlpha = 1;
            
            // Button border
            ctx.strokeStyle = this.WHITE;
            ctx.lineWidth = 2;
            ctx.strokeRect(button.x, button.y, button.width, button.height);
            
            // Button text
            let text;
            if (buttonName === 'pause') {
                text = this.paused ? "Resume" : "Pause";
            } else if (buttonName === 'restart') {
                text = "Restart";
            } else {
                text = `Speed: ${stats.speed}x`;
            }
            
            ctx.font = '24px Arial';
            ctx.fillStyle = this.WHITE;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, button.x + button.width/2, button.y + button.height/2);
        }
        
        // Draw metrics text
        let metricsY = 150;
        ctx.font = this.font;
        ctx.fillStyle = this.WHITE;
        ctx.textAlign = 'center';
        
        // Title
        const title = "Training Metrics";
        ctx.fillText(title, this.gameWidth + this.metricsWidth/2, metricsY);
        metricsY += 40;
        
        // Stats
        const statsText = [
            `Generation: ${stats.generation}`,
            `Best Fitness: ${Math.floor(stats.bestFitness)}`,
            `Alive Birds: ${stats.aliveBirds}/${stats.totalBirds}`
        ];
        
        for (const text of statsText) {
            ctx.fillText(text, this.gameWidth + this.metricsWidth/2, metricsY);
            metricsY += 35;
        }
    }
    
    isPointInRect(point, rect) {
        return point.x >= rect.x && point.x <= rect.x + rect.width &&
               point.y >= rect.y && point.y <= rect.y + rect.height;
    }
    
    handleClick(pos) {
        const canvasRect = document.getElementById('gameCanvas').getBoundingClientRect();
        const scaleX = document.getElementById('gameCanvas').width / canvasRect.width;
        const scaleY = document.getElementById('gameCanvas').height / canvasRect.height;
        
        const scaledPos = {
            x: pos.x * scaleX,
            y: pos.y * scaleY
        };
        
        for (const [buttonName, button] of Object.entries(this.buttons)) {
            if (this.isPointInRect(scaledPos, button)) {
                return buttonName;
            }
        }
        return null;
    }
} 