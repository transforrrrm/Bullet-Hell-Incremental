function formatNumber(num) {
    if (num >= 1000000) {
        return num.toExponential(4).replace('+', '');
    } else if (num < 100) {
        return parseFloat(num.toPrecision(3)).toString();
    } else {
        return Math.floor(num).toString();
    }
}

class Notification {
    constructor() {
        this.timer = null;
    }

    show(message, duration = 2000, type = 'info') {
        this.hide();
        clearTimeout(this.timer);

        const element = document.getElementById('game-notification');
        const content = document.getElementById('notification-message');

        content.textContent = message;
        element.className = `notification ${type}`;
        element.classList.remove('hidden');

        this.timer = setTimeout(() => {
            this.hide();
        }, duration);
    }

    hide() {
        const element = document.getElementById('game-notification');
        element.classList.add('hidden');
    }
}