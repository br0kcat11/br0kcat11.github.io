class GameOfLife {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellSize = 8;
        this.rows = Math.floor(canvas.height / this.cellSize);
        this.cols = Math.floor(canvas.width / this.cellSize);
        this.grid = this.createGrid();
        this.nextGrid = this.createGrid();
    }

    createGrid() {
        return Array(this.rows).fill().map((_, row) => 
            Array(this.cols).fill().map((_, col) => {
                const isInRedZone = col > this.cols * 0.8 && row < this.rows * 0.3;
                // Augmenter légèrement la densité dans la zone rouge
                return Math.random() < (isInRedZone ? 0.15 : 0.1);
            })
        );
    }

    getNeighbors(row, col) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const newRow = (row + i + this.rows) % this.rows;
                const newCol = (col + j + this.cols) % this.cols;
                if (this.grid[newRow][newCol]) count++;
            }
        }
        return count;
    }

    update() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const neighbors = this.getNeighbors(row, col);
                const cell = this.grid[row][col];

                if (cell && (neighbors < 2 || neighbors > 3)) {
                    this.nextGrid[row][col] = false;
                } else if (!cell && neighbors === 3) {
                    this.nextGrid[row][col] = true;
                } else {
                    this.nextGrid[row][col] = cell;
                }
            }
        }

        // Swap grids
        [this.grid, this.nextGrid] = [this.nextGrid, this.grid];
    }

    draw() {
        this.ctx.fillStyle = 'rgba(0, 18, 25, 0.95)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.grid[row][col]) {
                    const type = (row + col) % 3;
                    this.drawCell(row, col, type);
                }
            }
        }
    }

    drawCell(row, col, type) {
        const x = col * this.cellSize;
        const y = row * this.cellSize;
        const size = this.cellSize - 1;

        // Zone rouge dans le coin supérieur droit
        const isInRedZone = col > this.cols * 0.8 && row < this.rows * 0.3;
        
        if (isInRedZone) {
            this.ctx.fillStyle = 'rgba(255, 50, 50, 0.8)';
            this.ctx.strokeStyle = 'rgba(255, 50, 50, 0.8)';
        } else {
            this.ctx.fillStyle = 'rgba(74, 78, 130, 0.8)';
            this.ctx.strokeStyle = 'rgba(74, 78, 130, 0.8)';
        }
        this.ctx.lineWidth = 1;

        switch(type) {
            case 0: // Carré
                this.ctx.fillRect(x, y, size, size);
                break;
            case 1: // Croix
                this.ctx.beginPath();
                this.ctx.moveTo(x, y + size/2);
                this.ctx.lineTo(x + size, y + size/2);
                this.ctx.moveTo(x + size/2, y);
                this.ctx.lineTo(x + size/2, y + size);
                this.ctx.stroke();
                break;
            case 2: // Petit carré
                const margin = size * 0.25;
                this.ctx.fillRect(x + margin, y + margin, size - margin*2, size - margin*2);
                break;
        }
    }
}

class Background {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.3 - 0.15;
        this.speedY = Math.random() * 0.3 - 0.15;
        this.color = this.getRandomColor();
        this.type = Math.floor(Math.random() * 3); // 0: carré, 1: croix, 2: petit carré
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
    }

    getRandomColor() {
        const colors = [
            'rgba(74, 78, 130, 0.8)',   // Bleu foncé
            'rgba(111, 116, 167, 0.8)',  // Bleu moyen
            'rgba(133, 137, 197, 0.8)',  // Bleu clair
            'rgba(45, 49, 84, 0.8)'      // Bleu très foncé
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        if (this.x > this.canvas.width) this.x = 0;
        if (this.x < 0) this.x = this.canvas.width;
        if (this.y > this.canvas.height) this.y = 0;
        if (this.y < 0) this.y = this.canvas.height;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;

        switch(this.type) {
            case 0: // Carré
                ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
                break;
            case 1: // Croix
                const crossSize = this.size * 1.5;
                ctx.beginPath();
                ctx.moveTo(-crossSize, 0);
                ctx.lineTo(crossSize, 0);
                ctx.moveTo(0, -crossSize);
                ctx.lineTo(0, crossSize);
                ctx.stroke();
                break;
            case 2: // Petit carré
                const smallSize = this.size * 0.8;
                ctx.fillRect(-smallSize, -smallSize, smallSize * 2, smallSize * 2);
                break;
        }
        ctx.restore();
    }
}

function initGameOfLife() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const game = new GameOfLife(canvas);

    function animate() {
        game.update();
        game.draw();
        setTimeout(() => requestAnimationFrame(animate), 100);
    }

    animate();
}

document.addEventListener('DOMContentLoaded', initGameOfLife);
