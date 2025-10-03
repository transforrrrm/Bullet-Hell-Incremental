class core {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.state = new state(this.canvas, this);
        this.renderer = new renderer(this.canvas, this.ctx, this.state, this);
        this.screens = new screens(this.state, this);
        this.upgrades = new upgrades(this.state, this);
        this.data = new data(this.state);
        this.characters = new characters(this.state, this);
    }

    init() {
        this.screens.initEventListeners();
        this.data.loadGame();
        this.upgrades.initUpgradeInputs();
        this.characters.checkCharacterSystemUnlock();
    }

    startGame() {
        this.state.startGame();
        this.state.updateGameStats();
        this.gameLoop();
    }

    gameLoop() {
        this.state.updateGame();
        this.renderer.renderGame();
        
        if (!this.state.gameOver) {
            requestAnimationFrame(() => this.gameLoop());
        }
    }

    showResult() {
        if (this.state.victory) {
            this.state.completeLevel();
        }
        this.screens.showResultScreen();
        this.data.saveGame();
    }
}

window.core = core;