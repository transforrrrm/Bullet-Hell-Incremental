class renderer {
    constructor(canvas, ctx, state, core) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.state = state;
        this.core = core;
    }

    renderGame() {
        if (this.state.isPaused || this.state.gameOver) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawBackground();
        this.renderBullets();
        this.renderEnemyBullets();
        this.renderEnemies();
        this.renderBoss();
        this.renderPlayer();
        this.renderFloatingScores();
    }

    drawBackground() {
        this.ctx.fillStyle = '#0a0f1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 100; i++) {
            const x = (i * 31) % this.canvas.width;
            const y = (i * 13) % this.canvas.height;
            const size = Math.sin(this.state.waveTimer / 1000 + i) * 0.5 + 1;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.strokeStyle = 'rgba(0, 150, 255, 0.8)';
        this.ctx.lineWidth = 1;

        for (let i = 0; i < 20; i++) {
            const offset = (this.state.waveTimer / 50) % 100;
            const y = (i * 50 + offset) % this.canvas.height;

            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.bezierCurveTo(
                this.canvas.width * 0.3, y - 20,
                this.canvas.width * 0.7, y + 20,
                this.canvas.width, y
            );
            this.ctx.stroke();
        }
    }

    renderBullets() {
        this.state.bullets.forEach(bullet => {
            this.ctx.fillStyle = this.core.characters.getBulletColor();
            this.ctx.beginPath();
            this.ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    renderEnemyBullets() {
        this.state.enemyBullets.forEach(bullet => {
            this.ctx.fillStyle = '#ff416c';
            this.ctx.beginPath();
            this.ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    renderEnemies() {
        this.state.enemies.forEach(enemy => {
            if (enemy.type === 0) {
                this.ctx.fillStyle = '#ff6b6b';
            } else if (enemy.type === 1) {
                this.ctx.fillStyle = '#ffcc00';
            }

            this.ctx.beginPath();
            this.ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(
                formatNumber(enemy.hp).toString(),
                enemy.x,
                enemy.y
            );
        });
    }

    renderBoss() {
        if (!this.state.boss) return;
        const boss = this.state.boss;

        this.ctx.fillStyle = '#9c27b0';
        this.ctx.beginPath();
        this.ctx.arc(boss.x, boss.y, boss.radius, 0, Math.PI * 2);
        this.ctx.fill();

        const healthWidth = 150;
        const healthHeight = 10;
        const healthX = boss.x - healthWidth / 2;
        const healthY = boss.y - boss.radius - 20;

        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(healthX, healthY, healthWidth, healthHeight);

        this.ctx.fillStyle = boss.hp > boss.maxHp * 0.3 ? '#4CAF50' : '#ff0000';
        this.ctx.fillRect(healthX, healthY, healthWidth * (boss.hp / boss.maxHp), healthHeight);

        this.ctx.fillStyle = '#fff';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`×${boss.lives}`, boss.x, healthY);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText(
            `${formatNumber(boss.hp)}/${formatNumber(boss.maxHp)}`,
            boss.x,
            boss.y
        );
    }

    renderPlayer() {
        this.ctx.strokeStyle = this.core.characters.getPlayerColor();
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(this.state.player.x, this.state.player.y, 10, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.fillStyle = '#ff416c';
        this.ctx.beginPath();
        this.ctx.arc(this.state.player.x, this.state.player.y, 1, 0, Math.PI * 2);
        this.ctx.fill();
    }

    renderFloatingScores() {
        this.ctx.fillStyle = '#ffcc00';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.state.floatingScores.forEach(score => {
            const alpha = 1 - score.time / 1000;
            this.ctx.globalAlpha = alpha;
            this.ctx.fillText(score.text, score.x, score.y);
            this.ctx.globalAlpha = 1.0;
        });
    }
}

window.renderer = renderer;