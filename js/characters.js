class characters {
    constructor(state, core) {
        this.state = state;
        this.core = core;
        this.initCharacters();
        this.notification = new Notification();
    }
c
    initCharacters() {
        this.state.characters = [
            {
                id: 0,
                name: "默认",
                image: "Default",
                description: "什么特点都没有",
                unlockCost: 0,
                hpMod: 1.0,
                atkMod: 1.0,
                defMod: 1.0,
                speedMod: 1.0,
                fireRateMod: 1.0,
                bulletColor: '#00f2fe',
                playerColor: '#00f2fe'
            },
            {
                id: 1,
                name: "博丽 灵梦",
                image: "Reimu",
                description: "生存能力较强，适合新手",
                unlockCost: 0,
                hpMod: 1.5,
                atkMod: 0.9,
                defMod: 1.5,
                speedMod: 0.8,
                fireRateMod: 0.9,
                bulletColor: '#ff416c',
                playerColor: '#ffffff'
            },
            {
                id: 2,
                name: "雾雨 魔理沙",
                image: "Marisa",
                description: "火力很强DA☆ZE，适合东方玩家",
                unlockCost: 5000,
                hpMod: 0.8,
                atkMod: 1.7,
                defMod: 0.8,
                speedMod: 1.5,
                fireRateMod: 1.7,
                bulletColor: '#ffcc00',
                playerColor: '#ffcc00'
            },
            {
                id: 3,
                name: "十六夜 咲夜",
                image: "Sakuya",
                description: "还要啥默认啊",
                unlockCost: 10000,
                hpMod: 1.2,
                atkMod: 1.2,
                defMod: 1.2,
                speedMod: 1.2,
                fireRateMod: 1.2,
                bulletColor: '#4500cf',
                playerColor: '#dcc3cf'
            }
        ];
    }

    getCurrentCharacter() {
        return this.state.characters[this.state.save.currentCharacter];
    }

    applyCharacterStats() {
        const char = this.getCurrentCharacter();
        
        // 应用自机属性加成到基础属性
        const baseHp = 10 + Math.sqrt(this.state.save.hp.totalSpent / 100);
        const baseAtk = 1 + Math.pow(this.state.save.atk.totalSpent / 100, 0.2);
        const baseDef = this.state.save.def.level;
        const baseSpeed = 300;
        const baseFireRate = 10;

        this.state.player.maxHp = baseHp * char.hpMod;
        this.state.player.hp = this.state.player.maxHp;
        this.state.player.atk = baseAtk * char.atkMod;
        this.state.player.def = baseDef * char.defMod;
        this.state.player.speed = baseSpeed * char.speedMod;
        this.state.player.fireRate = baseFireRate * char.fireRateMod;
    }

    unlockCharacter(charId) {
        const char = this.state.characters[charId];
        const unlocked = this.state.save.characterUnlocked[charId];
        if (!char || unlocked) return false;

        if (this.state.save.score >= char.unlockCost) {
            this.state.save.score -= char.unlockCost;
            this.state.save.characterUnlocked[charId] = true;
            this.core.data.saveGame();
            return true;
        }
        return false;
    }

    selectCharacter(charId) {
        if (this.state.save.currentCharacter === charId) return false;

        this.state.save.currentCharacter = charId;
        this.core.data.saveGame();
        return true;
    }

    updateCharacterUI() {
        const container = document.getElementById('characters-container');
        container.innerHTML = '';
        
        document.getElementById('character-total-score').textContent = 
            formatNumber(this.state.save.score);
        
        this.state.characters.forEach(char => {
            const card = document.createElement('div');
            card.className = `character-card ${this.state.save.currentCharacter === char.id ? 'selected' : ''}`;
            card.innerHTML = `
                <div class="character-image" style="background: ${char.playerColor}">
                    ${char.image}
                </div>
                <div class="character-info">
                    <div class="character-name">${char.name}</div>
                    <div class="character-stats">
                        <div class="stat-item">
                            <span class="stat-label">HP:</span>
                            <span class="stat-value">${char.hpMod}×</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">ATK:</span>
                            <span class="stat-value">${char.atkMod}×</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">DEF:</span>
                            <span class="stat-value">${char.defMod}×</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">速度:</span>
                            <span class="stat-value">${char.speedMod}×</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">射速:</span>
                            <span class="stat-value">${char.fireRateMod}×</span>
                        </div>
                    </div>
                    <div class="character-description">${char.description}</div>
                    <div class="character-actions"></div>
                </div>
            `;
            
            const actions = card.querySelector('.character-actions');
            const unlocked = this.state.save.characterUnlocked[char.id];
            if (unlocked) {
                const selectBtn = document.createElement('button');
                selectBtn.className = `btn select-btn ${this.state.save.currentCharacter === char.id ? 'disabled' : ''}`;
                selectBtn.textContent = this.state.save.currentCharacter === char.id ? '使用中' : '选择';
                selectBtn.addEventListener('click', () => {
                    if (this.selectCharacter(char.id)) {
                        this.updateCharacterUI();
                    }
                });
                actions.appendChild(selectBtn);
            } else {
                const unlockBtn = document.createElement('button');
                unlockBtn.className = 'btn unlock-btn';
                unlockBtn.textContent = `解锁 (${formatNumber(char.unlockCost)}积分)`;
                unlockBtn.addEventListener('click', () => {
                    if (this.unlockCharacter(char.id)) {
                        this.updateCharacterUI();
                        this.notification.show(`${char.name}已解锁！`, 3000, 'success');
                    } else {
                        this.notification.show('积分不足！', 2000, 'error');
                    }
                });
                actions.appendChild(unlockBtn);
            }
            
            container.appendChild(card);
        });
    }

    checkCharacterSystemUnlock() {
        const characterBtn = document.getElementById('character-btn');
        if (this.state.save.level >= 1) {
            characterBtn.classList.remove('hidden');
        } else {
            characterBtn.classList.add('hidden');
        }
    }

    getPlayerColor() {
        return this.getCurrentCharacter().playerColor;
    }

    getBulletColor() {
        return this.getCurrentCharacter().bulletColor;
    }
}

window.characters = characters;