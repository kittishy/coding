/**
 * Controle do Cronômetro
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do cronômetro
    const stopwatchDisplay = document.querySelector('.stopwatch-display');
    const startBtn = document.getElementById('stopwatch-start');
    const pauseBtn = document.getElementById('stopwatch-pause');
    const resetBtn = document.getElementById('stopwatch-reset');
    
    let startTime;
    let elapsedTime = 0;
    let stopwatchInterval;
    let isRunning = false;
    
    // Inicia o cronômetro
    startBtn.addEventListener('click', startStopwatch);
    
    // Pausa o cronômetro
    pauseBtn.addEventListener('click', pauseStopwatch);
    
    // Reseta o cronômetro
    resetBtn.addEventListener('click', resetStopwatch);
    
    function startStopwatch() {
        if (!isRunning) {
            isRunning = true;
            startTime = Date.now() - elapsedTime;
            stopwatchInterval = setInterval(updateStopwatch, 10); // Atualiza a cada 10ms para maior precisão
            
            // Atualiza a aparência dos botões
            startBtn.disabled = true;
            pauseBtn.disabled = false;
        }
    }
    
    function pauseStopwatch() {
        if (isRunning) {
            isRunning = false;
            clearInterval(stopwatchInterval);
            elapsedTime = Date.now() - startTime;
            
            // Atualiza a aparência dos botões
            startBtn.disabled = false;
            pauseBtn.disabled = true;
        }
    }
    
    function resetStopwatch() {
        isRunning = false;
        clearInterval(stopwatchInterval);
        elapsedTime = 0;
        updateDisplay();
        
        // Atualiza a aparência dos botões
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }
    
    function updateStopwatch() {
        elapsedTime = Date.now() - startTime;
        updateDisplay();
    }
    
    function updateDisplay() {
        // Converte o tempo decorrido de milissegundos para horas, minutos e segundos
        const milliseconds = Math.floor((elapsedTime % 1000) / 10);
        const seconds = Math.floor((elapsedTime / 1000) % 60);
        const minutes = Math.floor((elapsedTime / (1000 * 60)) % 60);
        const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
        
        // Formata o tempo para exibição
        const formattedTime = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}.${padZero(milliseconds)}`;
        stopwatchDisplay.textContent = formattedTime;
    }
    
    // Adiciona zero à esquerda para números menores que 10
    function padZero(num) {
        return num < 10 ? `0${num}` : num;
    }
    
    // Inicializa o display
    updateDisplay();
});