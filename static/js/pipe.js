class Pipe {
    constructor(x, gameHeight) {
        this.x = x;
        this.width = 70;
        this.speed = 2;
        this.gameHeight = gameHeight;
        
        // Update gap settings
        this.gapHeight = 160;
        this.minGapY = 150;
        this.maxGapY = gameHeight - 150 - this.gapHeight;
        this.gapY = Math.random() * (this.maxGapY - this.minGapY) + this.minGapY;
        
        // Load pipe image
        this.image = new Image();
        this.image.src = '/static/assets/pipe.png';
        this.imageLoaded = false;
        
        this.image.onload = () => {
            this.imageLoaded = true;
        };
        
        // Fallback colors if image fails to load
        this.pipeColor = '#74BF2E';
        this.pipeEdgeColor = '#4AA810';
    }
    
    update() {
        this.x -= this.speed;
    }
    
    draw(ctx) {
        if (this.imageLoaded) {
            // Draw top pipe
            ctx.save();
            ctx.translate(this.x + this.width, this.gapY);
            ctx.scale(-1, -1);
            ctx.drawImage(this.image, 0, 0, this.width, this.gapY);
            ctx.restore();
            
            // Draw bottom pipe
            ctx.save();
            ctx.translate(this.x, this.gapY + this.gapHeight);
            ctx.drawImage(
                this.image,
                0,
                0,
                this.width,
                this.gameHeight - (this.gapY + this.gapHeight)
            );
            ctx.restore();
        } else {
            // Fallback rendering if image fails to load
            // Draw top pipe
            ctx.fillStyle = this.pipeColor;
            ctx.fillRect(this.x, 0, this.width, this.gapY);
            
            // Draw bottom pipe
            ctx.fillRect(
                this.x,
                this.gapY + this.gapHeight,
                this.width,
                this.gameHeight - (this.gapY + this.gapHeight)
            );
            
            // Draw pipe edges
            ctx.fillStyle = this.pipeEdgeColor;
            const edgeWidth = 4;
            
            // Top pipe edges
            ctx.fillRect(this.x, this.gapY - edgeWidth, this.width, edgeWidth);
            ctx.fillRect(this.x + this.width - edgeWidth, 0, edgeWidth, this.gapY);
            
            // Bottom pipe edges
            ctx.fillRect(this.x, this.gapY + this.gapHeight, this.width, edgeWidth);
            ctx.fillRect(
                this.x + this.width - edgeWidth,
                this.gapY + this.gapHeight,
                edgeWidth,
                this.gameHeight - (this.gapY + this.gapHeight)
            );
        }
    }
    
    getRect() {
        return {
            top: {
                x: this.x,
                y: 0,
                width: this.width,
                height: this.gapY
            },
            bottom: {
                x: this.x,
                y: this.gapY + this.gapHeight,
                width: this.width,
                height: this.gameHeight - (this.gapY + this.gapHeight)
            }
        };
    }
} 