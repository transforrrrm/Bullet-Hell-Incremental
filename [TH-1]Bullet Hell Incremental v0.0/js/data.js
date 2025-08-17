class data {
    constructor(state) {
        this.state = state;
        this.notification = new Notification();
    }

    deepMerge(target, source) {
        const result = { ...target };
        for (const key in target) {
            if (target[key] instanceof Object) {
                result[key] = this.deepMerge(target[key], source[key] || {});
            } else {
                result[key] = source[key] !== undefined ? source[key] : target[key];
            }
        }
        return result;
    }

    saveGame() {
        const saveData = this.state.save;
        localStorage.setItem('bulletHellSave', JSON.stringify(saveData));
        this.notification.show('游戏进度已保存', 2000, 'success');
    }

    loadGame() {
        const saveData = JSON.parse(localStorage.getItem('bulletHellSave'));
        if (saveData) {
            this.state.save = this.deepMerge(this.state.save, saveData);
            this.state.initStats();
            this.notification.show('存档已加载', 2000, 'success');
        }
    }

    exportData() {
        const saveData = JSON.parse(localStorage.getItem('bulletHellSave'));
        if (!saveData) {
            this.notification.show('没有找到存档数据', 2000, 'error');
            return;
        }
        
        const blob = new Blob([JSON.stringify(saveData)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bullet-hell-save.json';
        a.click();
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = event => {
                try {
                    const data = JSON.parse(event.target.result);
                    this.state.save = this.deepMerge(this.state.save, data);
                    this.state.initStats();
                    this.notification.show('数据导入成功！', 2000, 'success');
                } catch (err) {
                    this.notification.show('导入失败：文件格式错误', 2000, 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    resetGameData() {
        if (confirm('确定要重置游戏吗？所有进度将丢失！')) {
            localStorage.removeItem('bulletHellSave');
            this.state.init();
            this.notification.show('游戏已重置', 2000);
        }
    }
}

window.data = data;