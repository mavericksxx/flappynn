class UI {
    constructor(width, gameHeight, metricsWidth, bottomHeight, gameWidth) {
        this.width = width;
        this.gameHeight = gameHeight;
        this.metricsWidth = metricsWidth;
        this.bottomHeight = bottomHeight;
        this.gameWidth = gameWidth;
        this.height = gameHeight;
        
        // Colors
        this.WHITE = '#FFFFFF';
        this.BLACK = '#000000';
        this.GRAY = '#808080';
        this.BLUE = '#0078FF';
        this.HOVER_BLUE = '#0099FF';
        
        // Button dimensions
        this.buttonWidth = 100;
        this.buttonHeight = 40;
        this.buttonSpacing = 20;
        
        // Calculate total width of all buttons and spacing
        const totalButtonWidth = (this.buttonWidth * 3) + (this.buttonSpacing * 2);
        // Calculate starting X to center the buttons
        const startX = this.gameWidth + (this.metricsWidth - totalButtonWidth) / 2;
        
        // Create buttons
        this.buttons = {
            pause: {
                x: startX,
                y: 20,
                width: this.buttonWidth,
                height: this.buttonHeight
            },
            speed: {
                x: startX + this.buttonWidth + this.buttonSpacing,
                y: 20,
                width: this.buttonWidth,
                height: this.buttonHeight
            },
            restart: {
                x: startX + (this.buttonWidth + this.buttonSpacing) * 2,
                y: 20,
                width: this.buttonWidth,
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
        const canvas = document.getElementById('gameCanvas');
        const rect = canvas.getBoundingClientRect();
        
        this.mousePos = {
            x: ((event.clientX - rect.left) / rect.width) * canvas.width,
            y: ((event.clientY - rect.top) / rect.height) * canvas.height
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
            
            // Button background
            ctx.fillStyle = hover ? this.HOVER_BLUE : this.BLUE;
            ctx.fillRect(button.x, button.y, button.width, button.height);
            
            // Button text
            let text;
            if (buttonName === 'pause') {
                text = this.paused ? "Resume" : "Pause";
            } else if (buttonName === 'speed') {
                text = `Speed: ${stats.speed}x`;
            } else {
                text = "Restart";
            }
            
            ctx.font = '16px Arial';
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
        const canvas = document.getElementById('gameCanvas');
        const rect = canvas.getBoundingClientRect();
        
        const scaledPos = {
            x: (pos.x / rect.width) * canvas.width,
            y: (pos.y / rect.height) * canvas.height
        };
        
        for (const [buttonName, button] of Object.entries(this.buttons)) {
            if (this.isPointInRect(scaledPos, button)) {
                return buttonName;
            }
        }
        return null;
    }
} 