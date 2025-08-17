class upgrades {
    constructor(state) {
        this.state = state;
        this.notification = new Notification();
    }

    upgradeStat(stat) {
        const inputElement = document.getElementById(`${stat}-input`);
        let pointsToSpend = 0;

        if (stat === 'hp' || stat === 'atk') {
            pointsToSpend = parseInt(inputElement.value) || 0;
            if (pointsToSpend <= 0) {
                this.notification.show("请输入有效的积分数！", 2000, 'error');
                return;
            }
        } else {
            pointsToSpend = this.state.save[stat].cost;
        }

        if (this.state.save.score >= pointsToSpend) {
            this.state.save.score -= pointsToSpend;

            switch (stat) {
                case 'hp':
                    this.state.save.hp.totalSpent += pointsToSpend;
                    this.state.player.maxHp = 10 + Math.sqrt(this.state.save.hp.totalSpent / 100);
                    break;

                case 'atk':
                    this.state.save.atk.totalSpent += pointsToSpend;
                    this.state.player.atk = 1 + Math.pow(this.state.save.atk.totalSpent / 100, 0.2);
                    break;

                case 'def':
                    this.state.save.def.cost *= 10;
                    this.state.save.def.level += 1;
                    this.state.player.def = this.state.save.def.level;
                    break;
            }

            this.updateUpgradeUI();
        } else {
            this.notification.show("积分不足！", 2000, 'error');
        }
    }

    updateUpgradeUI() {
        document.getElementById('total-score').textContent = formatNumber(this.state.save.score);

        document.getElementById('current-hp').textContent =
            formatNumber(this.state.player.maxHp);
        document.getElementById('current-atk').textContent =
            formatNumber(this.state.player.atk);
        document.getElementById('current-def').textContent =
            formatNumber(this.state.player.def);

        document.getElementById('def-cost').textContent =
            formatNumber(this.state.save.def.cost);

        document.getElementById('hp-input').max = this.state.save.score;
        document.getElementById('atk-input').max = this.state.save.score;
    }

    initUpgradeInputs() {
        document.getElementById('hp-input').addEventListener('change', function () {
            this.value = Math.max(0, Math.min(parseInt(this.value) || 0, this.max));
        });

        document.getElementById('atk-input').addEventListener('change', function () {
            this.value = Math.max(0, Math.min(parseInt(this.value) || 0, this.max));
        });
    }
}

window.upgrades = upgrades;