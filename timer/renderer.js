const { ipcRenderer } = require('electron');

let timerInterval;
let milliseconds = 0;
const TICK_RATE = 50; // 50ms = 20 times per second

ipcRenderer.on('start-timer', () => {
    milliseconds = 0;
    clearInterval(timerInterval);
    document.getElementById('timer').className = 'running';
    timerInterval = setInterval(() => {
        milliseconds += TICK_RATE;
        updateDisplay();
    }, TICK_RATE);
});

ipcRenderer.on('stop-timer', () => {
    clearInterval(timerInterval);
    document.getElementById('timer').className = 'stopped';
});

function updateDisplay() {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const ms = Math.floor((milliseconds % 1000) / 10); // Shows only 2 digits of milliseconds
    
    const display = `${pad(minutes)}:${pad(seconds)}.${pad(ms)}`;
    document.getElementById('timer').textContent = display;
}

function pad(number) {
    return number.toString().padStart(2, '0');
}