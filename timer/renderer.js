const { ipcRenderer } = require('electron');
const fs = require('fs');

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

const timerContainer = document.getElementById('timer-container');

timerContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    timerContainer.classList.add('drag-over');
});

timerContainer.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    timerContainer.classList.remove('drag-over');
});

timerContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    timerContainer.classList.remove('drag-over');

    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.css')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const css = event.target.result;
            
            // Remove any existing custom styles
            const existingStyle = document.getElementById('custom-styles');
            if (existingStyle) {
                existingStyle.remove();
            }

            // Add new styles
            const style = document.createElement('style');
            style.id = 'custom-styles';
            style.textContent = css;
            document.head.appendChild(style);

            // Save the CSS file
            ipcRenderer.send('save-css', css);
        };
        reader.readAsText(file);
    }
});
