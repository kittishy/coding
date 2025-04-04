/**
 * Controle do Temporizador
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do temporizador
    const hoursInput = document.getElementById('hours');
    const minutesInput = document.getElementById('minutes');
    const secondsInput = document.getElementById('seconds');
    const progressBar = document.querySelector('.progress-bar');
    const startBtn = document.getElementById('timer-start');
    const pauseBtn = document.getElementById('timer-pause');
    const resetBtn = document.getElementById('timer-reset');
    
    let timerInterval;
    let totalSeconds = 0;
    let remainingSeconds = 0;
    let isRunning = false;
    
    // Adiciona eventos para os botões
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    
    // Adiciona eventos para os inputs
    [hoursInput, minutesInput, secondsInput].forEach(input => {
        input.addEventListener('change', validateInput);
        input.addEventListener('input', updateTotalTime);
    });
    
    // Valida os valores de entrada
    function validateInput() {
        const value = parseInt(this.value) || 0;
        const min = parseInt(this.min);
        const max = parseInt(this.max);
        
        if (value < min) this.value = min;
        if (value > max) this.value = max;
        
        updateTotalTime();
    }
    
    // Atualiza o tempo total em segundos
    function updateTotalTime() {
        const hours = parseInt(hoursInput.value) || 0;
        const minutes = parseInt(minutesInput.value) || 0;
        const seconds = parseInt(secondsInput.value) || 0;
        
        totalSeconds = hours * 3600 + minutes * 60 + seconds;
        remainingSeconds = totalSeconds;
        
        updateDisplay();
        updateProgressBar();
    }
    
    // Inicia o temporizador
    function startTimer() {
        if (!isRunning && totalSeconds > 0) {
            isRunning = true;
            
            // Desabilita os inputs durante a contagem
            toggleInputs(true);
            
            // Atualiza a aparência dos botões
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            
            timerInterval = setInterval(function() {
                if (remainingSeconds > 0) {
                    remainingSeconds--;
                    updateDisplay();
                    updateProgressBar();
                } else {
                    completeTimer();
                }
            }, 1000);
        }
    }
    
    // Pausa o temporizador
    function pauseTimer() {
        if (isRunning) {
            isRunning = false;
            clearInterval(timerInterval);
            
            // Atualiza a aparência dos botões
            startBtn.disabled = false;
            pauseBtn.disabled = true;
        }
    }
    
    // Reseta o temporizador
    function resetTimer() {
        isRunning = false;
        clearInterval(timerInterval);
        
        // Habilita os inputs
        toggleInputs(false);
        
        // Reseta os valores dos inputs
        hoursInput.value = 0;
        minutesInput.value = 0;
        secondsInput.value = 0;
        
        // Reseta o tempo total e restante
        totalSeconds = 0;
        remainingSeconds = 0;
        
        // Atualiza a aparência dos botões
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        
        // Atualiza o display e a barra de progresso
        updateDisplay();
        updateProgressBar();
    }
    
    // Completa o temporizador
    function completeTimer() {
        isRunning = false;
        clearInterval(timerInterval);
        
        // Reproduz um som de alarme (em uma aplicação real, isso seria um som real)
        alert('Tempo esgotado!');
        
        // Habilita os inputs
        toggleInputs(false);
        
        // Atualiza a aparência dos botões
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }
    
    // Atualiza o display do temporizador
    function updateDisplay() {
        const hours = Math.floor(remainingSeconds / 3600);
        const minutes = Math.floor((remainingSeconds % 3600) / 60);
        const seconds = remainingSeconds % 60;
        
        hoursInput.value = hours.toString().padStart(2, '0');
        minutesInput.value = minutes.toString().padStart(2, '0');
        secondsInput.value = seconds.toString().padStart(2, '0');
    }
    
    // Atualiza a barra de progresso
    function updateProgressBar() {
        if (totalSeconds > 0) {
            const percentage = (remainingSeconds / totalSeconds) * 100;
            progressBar.style.width = `${percentage}%`;
        } else {
            progressBar.style.width = '0%';
        }
    }
    
    // Habilita/desabilita os inputs
    function toggleInputs(disabled) {
        hoursInput.disabled = disabled;
        minutesInput.disabled = disabled;
        secondsInput.disabled = disabled;
    }
    
    // Inicializa o display
    updateTotalTime();
});