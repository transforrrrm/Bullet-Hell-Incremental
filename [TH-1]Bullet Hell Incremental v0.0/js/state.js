class state {
    constructor(canvas, core) {
        this.canvas = canvas;
        this.core = core;
        this.init();
    }

    init() {
        this.currentScreen = 'main-menu';
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 50,
            hp: 10,
            maxHp: 10,
            atk: 1,
            def: 1,
            speed: 300,
            fireRate: 10,
            lastShot: 0
        };
        this.save = {
            hp: { totalSpent: 0 },
            atk: { totalSpent: 0 },
            def: { cost: 10000, level: 1 },
            level: 0,
            score: 0
        };
        this.bullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.floatingScores = [];
        this.keys = {};
        this.score = 0;
        this.level = 1;
        this.wave = 0;
        this.waveProgress = 0;
        this.waveTimer = 0;
        this.bossTime = 0;
        this.haveSpawned = false;
        this.isPaused = false;
        this.boss = null;
        this.bossSpawned = false;
        this.gameOver = false;
        this.victory = false;
        this.enemyArea = {
            top: 0,
            bottom: this.canvas.height / 2,
            left: 0,
            right: this.canvas.width
        };
        this.lastUpdate = 0;
        this.patterns = [
            { type: 'normal', count: 1, interval: 1000, duration: 5000 },
            { type: 'elite', count: 2, duration: 5000 },
            { type: 'normal', count: 2, interval: 1000, duration: 5000 },
            { type: 'elite', count: 1, duration: 5000 }
        ];
    }

    startGame() {
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height - 50;
        this.player.hp = this.player.maxHp;
        this.bullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.floatingScores = [];
        this.keys = {};
        this.score = 0;
        this.wave = 0;
        this.waveProgress = 0;
        this.waveTimer = 0;
        this.bossTime = 0;
        this.haveSpawned = false;
        this.isPaused = false;
        this.boss = null;
        this.bossSpawned = false;
        this.gameOver = false;
        this.victory = false;
        this.startNextWave();
    }

    startNextWave() {
        this.wave++;
        this.waveProgress = 0;
        this.waveTimer = 0;
    }

    spawnBoss() {
        this.bossSpawned = true;
        this.boss = {
            type: 2,
            x: this.canvas.width / 2,
            y: 100,
            radius: 40,
            hp: 600 * Math.pow(1.1, this.level - 1) * (1 + this.level * (this.wave - 1) * 0.1),
            maxHp: 600 * Math.pow(1.1, this.level - 1) * (1 + this.level * (this.wave - 1) * 0.1),
            lives: 6 * (this.wave === 6 ? 2 : 1),
            lastShot: 0,
            fireRate: 750,
            pattern: Math.floor(Math.random() * 3)
        };
    }

    spawnEnemy(type) {
        const enemy = {
            type: type,
            x: Math.random() * (this.canvas.width - 100) + 50,
            y: -30,
            radius: type === 0 ? 15 : 25,
            hp: (type === 0 ? 1 : 15) * Math.pow(1.1, this.level - 1) * (1 + this.level * (this.wave - 1) * 0.1),
            maxHp: (type === 0 ? 1 : 15) * Math.pow(1.1, this.level - 1) * (1 + this.level * (this.wave - 1) * 0.1),
            speed: {
                x: type === 0 ? 100 : 70,
                y: (Math.random() - 0.5) * 50
            },
            lastShot: 0,
            fireRate: type === 0 ? 2000 : 1500
        };

        this.enemies.push(enemy);
        return enemy;
    }

    playerShoot() {
        const now = Date.now();
        if (now - this.player.lastShot > 1000 / this.player.fireRate) {
            this.bullets.push({
                x: this.player.x,
                y: this.player.y,
                radius: 5,
                speed: 1000,
                damage: this.player.atk
            });
            this.player.lastShot = now;
        }
    }

    enemyShoot(enemy) {
        const now = Date.now();
        if (now - enemy.lastShot > enemy.fireRate) {
            if (enemy.type === 0) {
                const angle = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x);
                this.enemyBullets.push({
                    x: enemy.x,
                    y: enemy.y,
                    radius: 4,
                    speed: 50,
                    damage: Math.pow(1.1, this.level - 1),
                    angle: angle
                });
            } else if (enemy.type === 1) {
                for (let i = 0; i < 3; i++) {
                    const angle = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x) + (i - 1) * 0.3;
                    this.enemyBullets.push({
                        x: enemy.x,
                        y: enemy.y,
                        radius: 4,
                        speed: 115,
                        damage: Math.pow(1.1, this.level - 1),
                        angle: angle
                    });
                }
            } else if (enemy.type === 2) {
                const pattern = this.boss.pattern;
                if (pattern === 0) {
                    for (let i = 0; i < 12; i++) {
                        const angle = (i * Math.PI * 2) / 12;
                        this.enemyBullets.push({
                            x: enemy.x,
                            y: enemy.y,
                            radius: 6,
                            speed: 80,
                            damage: Math.pow(1.1, this.level - 1),
                            angle: angle
                        });
                    }
                } else if (pattern === 1) {
                    const baseAngle = (this.waveTimer / 100) % (Math.PI * 2);
                    for (let i = 0; i < 8; i++) {
                        const angle = baseAngle + (i * Math.PI * 2) / 8;
                        this.enemyBullets.push({
                            x: enemy.x,
                            y: enemy.y,
                            radius: 5,
                            speed: 100,
                            damage: Math.pow(1.1, this.level - 1),
                            angle: angle
                        });
                    }
                } else {
                    const playerAngle = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x);
                    for (let i = -2; i <= 2; i++) {
                        this.enemyBullets.push({
                            x: enemy.x,
                            y: enemy.y,
                            radius: 5,
                            speed: 130,
                            damage: Math.pow(1.1, this.level - 1),
                            angle: playerAngle + i * 0.2
                        });
                    }
                }
            }

            enemy.lastShot = now;
        }
    }

    updateGame() {
        if (this.isPaused || this.gameOver) return;

        const now = Date.now();
        const dt = Math.min(100, now - this.lastUpdate) / 1000;
        this.lastUpdate = now;
        this.waveTimer += dt * 1000;
        if (this.bossSpawned) this.bossTime += dt * 1000;

        let speed = this.keys.Shift ? this.player.speed * 0.5 : this.player.speed;
        speed *= dt;
        if (this.keys.ArrowUp) this.player.y -= speed;
        if (this.keys.ArrowDown) this.player.y += speed;
        if (this.keys.ArrowLeft) this.player.x -= speed;
        if (this.keys.ArrowRight) this.player.x += speed;

        this.player.x = Math.max(0, Math.min(this.canvas.width, this.player.x));
        this.player.y = Math.max(0, Math.min(this.canvas.height, this.player.y));

        if (this.keys.z) this.playerShoot();

        if (!this.bossSpawned) {
            if (this.waveProgress < 60000) {
                if (this.waveTimer >= this.waveProgress) {
                    this.currentPattern = this.patterns[Math.floor(Math.random() * this.patterns.length)];
                    this.haveSpawned = false;
                    this.waveProgress += this.currentPattern.duration;
                }

                const pattern = this.currentPattern;
                if (pattern.interval && this.waveTimer % pattern.interval < dt * 1000) {
                    for (let i = 0; i < pattern.count; i++) {
                        this.spawnEnemy(pattern.type === 'normal' ? 0 : 1);
                    }
                } else if (!this.haveSpawned) {
                    for (let i = 0; i < pattern.count; i++) {
                        this.spawnEnemy(pattern.type === 'normal' ? 0 : 1);
                    }
                    this.haveSpawned = true;
                }
            } else if (this.enemies.length === 0) this.spawnBoss();
        }

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.y -= bullet.speed * dt;

            if (bullet.y < -bullet.radius) {
                this.bullets.splice(i, 1);
                continue;
            }

            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                const dx = bullet.x - enemy.x;
                const dy = bullet.y - enemy.y;
                const distanceSq = dx * dx + dy * dy;

                if (distanceSq < (bullet.radius + enemy.radius) ** 2) {
                    enemy.hp -= bullet.damage;

                    if (enemy.hp <= 0) {
                        let score = 0;
                        if (enemy.type === 0) {
                            score = 1 * this.level;
                        } else if (enemy.type === 1) {
                            score = 10 * this.level;
                        }

                        this.score += score;
                        this.updateGameStats();
                        this.floatingScores.push({
                            x: enemy.x,
                            y: enemy.y,
                            text: formatNumber(score),
                            time: 0
                        });

                        this.enemies.splice(j, 1);
                    }

                    this.bullets.splice(i, 1);
                    break;
                }
            }

            if (this.boss) {
                const boss = this.boss;
                const dx = bullet.x - boss.x;
                const dy = bullet.y - boss.y;
                const distanceSq = dx * dx + dy * dy;

                if (distanceSq < (bullet.radius + boss.radius) ** 2) {
                    boss.hp -= bullet.damage;

                    if (boss.hp <= 0) {
                        boss.lives--;
                        if (boss.lives > 0) {
                            boss.hp = boss.maxHp;
                            boss.pattern = (boss.pattern + 1) % 3;
                        } else {
                            const t = this.bossTime / 1000;
                            const score = Math.floor(1000 / Math.log(t + 1)) * this.level;
                            this.score += score;
                            this.updateGameStats();
                            this.floatingScores.push({
                                x: boss.x,
                                y: boss.y,
                                text: formatNumber(score),
                                time: 0
                            });

                            this.boss = null;
                            this.bossSpawned = false;
                            this.bossTime = 0;

                            if (this.wave >= 6) {
                                this.victory = true;
                                this.core.showResult();
                            } else {
                                this.startNextWave();
                                this.updateGameStats();
                            }
                        }
                    }

                    this.bullets.splice(i, 1);
                }
            }
        }

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];

            if (enemy.type === 0 || enemy.type === 1) {
                enemy.x += enemy.speed.x * dt;
                enemy.y += enemy.speed.y * dt;

                if (enemy.x < enemy.radius) {
                    enemy.x = enemy.radius;
                    enemy.speed.x *= -1;
                } else if (enemy.x > this.canvas.width - enemy.radius) {
                    enemy.x = this.canvas.width - enemy.radius;
                    enemy.speed.x *= -1;
                }

                if (enemy.y < enemy.radius) {
                    enemy.y = enemy.radius;
                    enemy.speed.y *= -1;
                } else if (enemy.y > this.enemyArea.bottom - enemy.radius) {
                    enemy.y = this.enemyArea.bottom - enemy.radius;
                    enemy.speed.y *= -1;
                }
            }

            this.enemyShoot(enemy);
        }

        if (this.boss) {
            if (this.boss.pattern === 2) {
                this.boss.x = this.canvas.width / 2 + Math.sin(this.bossTime / 1000) * 200;
            } else {
                this.boss.x = this.canvas.width / 2;
            }

            this.enemyShoot(this.boss);
        }

        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = this.enemyBullets[i];
            bullet.x += Math.cos(bullet.angle) * bullet.speed * dt;
            bullet.y += Math.sin(bullet.angle) * bullet.speed * dt;

            if (bullet.x < -bullet.radius || bullet.x > this.canvas.width + bullet.radius ||
                bullet.y < -bullet.radius || bullet.y > this.canvas.height + bullet.radius) {
                this.enemyBullets.splice(i, 1);
                continue;
            }

            const dx = bullet.x - this.player.x;
            const dy = bullet.y - this.player.y;
            const distanceSq = dx * dx + dy * dy;

            if (distanceSq < bullet.radius ** 2) {
                this.player.hp -= bullet.damage / this.player.def;
                this.updateGameStats();
                this.enemyBullets.splice(i, 1);

                if (this.player.hp <= 0) {
                    this.core.showResult();
                }
            }
        }

        for (let i = this.floatingScores.length - 1; i >= 0; i--) {
            const score = this.floatingScores[i];
            score.y -= 1;
            score.time += dt * 1000;

            if (score.time > 1000) {
                this.floatingScores.splice(i, 1);
            }
        }
    }

    updateGameStats() {
        document.getElementById('current-score').textContent = formatNumber(this.score);
        document.getElementById('hp-display').textContent =
            `${formatNumber(this.player.hp)}/${formatNumber(this.player.maxHp)}`;
        document.getElementById('level-display').textContent = this.level;
        document.getElementById('wave-display').textContent = `${this.wave}/6`;

        const healthPercent = (this.player.hp / this.player.maxHp) * 100;
        document.getElementById('health-fill').style.width = `${healthPercent}%`;
    }

    initStats() {
        this.player.maxHp = 10 + Math.sqrt(this.save.hp.totalSpent / 100);
        this.player.atk = 1 + Math.pow(this.save.atk.totalSpent / 100, 0.2);
        this.player.def = this.save.def.level;
    }

    completeLevel() {
        if (this.level > this.save.level) this.save.level = this.level;
    }
}

window.state = state;