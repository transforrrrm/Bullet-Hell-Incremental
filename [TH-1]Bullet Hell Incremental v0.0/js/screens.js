class screens {
    constructor(state, core) {
        this.state = state;
        this.core = core;
    }

    showScreen(screenId) {
        if (this.state.currentScreen === 'game-screen' && screenId !== 'game-screen') {
            this.core.renderer.ctx.clearRect(0, 0, this.state.canvas.width, this.state.canvas.height);
        }

        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        document.getElementById(screenId).classList.remove('hidden');
        this.state.currentScreen = screenId;

        if (screenId === 'game-screen') {
            this.core.startGame();
        }
        if (screenId === 'level-select') {
            this.updateLevelSelect();
        }
    }

    updateLevelSelect() {
        const container = document.getElementById('level-buttons-container');
        container.innerHTML = '';

        for (let i = 1; i <= this.state.save.level + 1; i++) {
            const btn = document.createElement('div');
            btn.className = 'level-btn';
            btn.textContent = i;
            btn.dataset.level = i;

            if (i <= this.state.save.level) btn.classList.add('completed');

            if (i <= this.state.save.level + 1) {
                btn.addEventListener('click', () => {
                    this.state.level = i;
                    this.showScreen('game-screen');
                });
            }

            container.appendChild(btn);
        }
    }

    showResultScreen() {
        this.state.gameOver = true;
        this.state.save.score += this.state.score;
        document.getElementById('final-score').textContent = formatNumber(this.state.score);

        document.querySelector('.result-title.victory').style.display = this.state.victory ? 'block' : 'none';
        document.querySelector('.result-title.defeat').style.display = !this.state.victory ? 'block' : 'none';
        document.getElementById('total-score').textContent = formatNumber(this.state.save.score);

        this.showScreen('result-screen');
    }

    initEventListeners() {
        document.getElementById('start-btn').addEventListener('click', () => this.showScreen('level-select'));
        document.getElementById('upgrade-btn').addEventListener('click', () => {
            this.core.upgrades.updateUpgradeUI();
            this.showScreen('upgrade-screen');
        });
        document.getElementById('help-btn').addEventListener('click', () => this.showScreen('help-screen'));
        document.getElementById('settings-btn').addEventListener('click', () => this.showScreen('settings-screen'));

        document.getElementById('save-game').addEventListener('click', () => this.core.data.saveGame());
        document.getElementById('export-data').addEventListener('click', () => this.core.data.exportData());
        document.getElementById('import-data').addEventListener('click', () => this.core.data.importData());
        document.getElementById('reset-game').addEventListener('click', () => this.core.data.resetGameData());

        document.getElementById('back-to-main').addEventListener('click', () => this.showScreen('main-menu'));
        document.getElementById('back-to-main2').addEventListener('click', () => this.showScreen('main-menu'));
        document.getElementById('back-to-main3').addEventListener('click', () => this.showScreen('main-menu'));
        document.getElementById('back-to-main4').addEventListener('click', () => this.showScreen('main-menu'));
        document.getElementById('back-to-main-from-settings').addEventListener('click', () => this.showScreen('main-menu'));

        document.getElementById('upgrade-hp').addEventListener('click', () => this.core.upgrades.upgradeStat('hp'));
        document.getElementById('upgrade-atk').addEventListener('click', () => this.core.upgrades.upgradeStat('atk'));
        document.getElementById('upgrade-def').addEventListener('click', () => this.core.upgrades.upgradeStat('def'));

        window.addEventListener('keydown', (e) => {
            this.state.keys[e.key] = true;

            if (e.key === ' ' && this.state.currentScreen === 'game-screen') {
                this.state.isPaused = !this.state.isPaused;
                document.getElementById('pause-overlay').classList.toggle('hidden');
            }
        });

        window.addEventListener('keyup', (e) => {
            this.state.keys[e.key] = false;
        });

        document.getElementById('quit-game').addEventListener('click', () => {
            this.core.showResult();
        });
    }
}

window.screens = screens;