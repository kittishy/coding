/**
 * Relógio macOS - Módulo de Timer
 * Implementa as funcionalidades do temporizador com contagem regressiva
 */

function initTimer() {
    // Elementos do DOM
    const timerDisplayElement = document.querySelector('#timer-view .timer-display');
    const timeInputElement = document.querySelector('#timer-view .time-input');
    const countdownElement = document.querySelector('#timer-view .timer-countdown');
    const countdownTimeElement = document.querySelector('#timer-view .timer-countdown .time');
    
    // Inputs de tempo
    const hoursInput = document.getElementById('hours');
    const minutesInput = document.getElementById('minutes');
    const secondsInput = document.getElementById('seconds');
    
    // Botões de controle
    const startButton = document.getElementById('timer-start');
    const pauseButton = document.getElementById('timer-pause');
    const resetButton = document.getElementById('timer-reset');
    
    // Botões de presets
    const presetButtons = document.querySelectorAll('.preset-btn');
    
    // Variáveis de estado
    let totalSeconds = 0;
    let remainingSeconds = 0;
    let timerInterval = null;
    let isRunning = false;
    let originalTime = 0;
    let alarmTimeout = null;
    
    // Formatar tempo em HH:MM:SS
    function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Atualizar a exibição do tempo
    function updateDisplay() {
        if (isRunning || remainingSeconds > 0) {
            countdownTimeElement.textContent = formatTime(remainingSeconds);
        }
    }
    
    // Calcular tempo total em segundos a partir dos inputs
    function calculateTotalSeconds() {
        const hours = parseInt(hoursInput.value) || 0;
        const minutes = parseInt(minutesInput.value) || 0;
        const seconds = parseInt(secondsInput.value) || 0;
        
        return hours * 3600 + minutes * 60 + seconds;
    }
    
    // Definir valores nos inputs a partir de segundos totais
    function setInputsFromSeconds(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        hoursInput.value = hours;
        minutesInput.value = minutes;
        secondsInput.value = secs;
    }
    
    // Iniciar temporizador
    function startTimer() {
        if (isRunning) return;
        
        if (!remainingSeconds) {
            totalSeconds = calculateTotalSeconds();
            remainingSeconds = totalSeconds;
            originalTime = totalSeconds;
            
            if (remainingSeconds <= 0) {
                showNotification('Por favor, defina um tempo válido.');
                return;
            }
        }
        
        // Alternar entre visualização de entrada e contagem regressiva
        timeInputElement.style.display = 'none';
        countdownElement.style.display = 'block';
        
        isRunning = true;
        
        // Atualizar botões
        startButton.disabled = true;
        pauseButton.disabled = false;
        resetButton.disabled = false;
        
        // Atualizar display inicial
        updateDisplay();
        
        timerInterval = setInterval(() => {
            if (remainingSeconds > 0) {
                remainingSeconds--;
                updateDisplay();
                
                // Tocar tic-tac nos últimos 10 segundos
                if (remainingSeconds <= 10 && remainingSeconds > 0) {
                    playTickSound();
                }
                
                // Quando o temporizador acaba
                if (remainingSeconds === 0) {
                    clearInterval(timerInterval);
                    isRunning = false;
                    startButton.disabled = false;
                    pauseButton.disabled = true;
                    timerComplete();
                }
            }
        }, 1000);
    }
    
    // Pausar temporizador
    function pauseTimer() {
        if (!isRunning) return;
        
        clearInterval(timerInterval);
        isRunning = false;
        
        // Atualizar botões
        startButton.disabled = false;
        pauseButton.disabled = true;
    }
    
    // Resetar temporizador
    function resetTimer() {
        clearInterval(timerInterval);
        clearTimeout(alarmTimeout);
        
        isRunning = false;
        remainingSeconds = 0;
        
        // Voltar para a visualização de entrada
        timeInputElement.style.display = 'flex';
        countdownElement.style.display = 'none';
        
        // Se havia um tempo original, restaurá-lo
        if (originalTime > 0) {
            setInputsFromSeconds(originalTime);
        }
        
        // Atualizar botões
        startButton.disabled = false;
        pauseButton.disabled = true;
        resetButton.disabled = true;
        
        // Parar som de alarme se estiver tocando
        stopAlarmSound();
    }
    
    // Completar temporizador
    function timerComplete() {
        // Mostrar notificação
        showNotification('Timer concluído!');
        
        // Tocar som de alarme
        playAlarmSound();
        
        // Mostrar notificação do sistema se suportado
        showSystemNotification();
        
        // Permitir reiniciar diretamente
        startButton.innerHTML = '<i class="fas fa-redo"></i>';
        startButton.addEventListener('click', resetAndStart, { once: true });
    }
    
    // Resetar e iniciar novamente
    function resetAndStart() {
        resetTimer();
        setInputsFromSeconds(originalTime);
        startTimer();
        startButton.innerHTML = '<i class="fas fa-play"></i>';
    }
    
    // Definir temporizador a partir de preset
    function setTimerFromPreset(seconds) {
        resetTimer();
        setInputsFromSeconds(seconds);
        originalTime = seconds;
    }
    
    // Tocar som de alarme
    function playAlarmSound() {
        const alarmSound = new Audio('assets/sounds/alarm.mp3');
        alarmSound.loop = true;
        alarmSound.id = 'timer-alarm';
        document.body.appendChild(alarmSound);
        alarmSound.play();
        
        // Auto-parar o alarme após 1 minuto
        alarmTimeout = setTimeout(() => {
            stopAlarmSound();
        }, 60000);
    }
    
    // Parar som de alarme
    function stopAlarmSound() {
        const alarmSound = document.getElementById('timer-alarm');
        if (alarmSound) {
            alarmSound.pause();
            alarmSound.remove();
        }
    }
    
    // Tocar som de tique-taque
    function playTickSound() {
        const tickSound = new Audio('assets/sounds/click.mp3');
        tickSound.volume = 0.3;
        tickSound.play();
    }
    
    // Mostrar notificação in-app
    function showNotification(message) {
        const notificationContainer = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        notificationContainer.appendChild(notification);
        
        // Remover notificação após alguns segundos
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // Mostrar notificação do sistema
    function showSystemNotification() {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification('Timer Concluído', {
                    body: 'Seu tempo acabou!',
                    icon: 'assets/icons/light/timer.png'
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification('Timer Concluído', {
                            body: 'Seu tempo acabou!',
                            icon: 'assets/icons/light/timer.png'
                        });
                    }
                });
            }
        }
    }
    
    // Event Listeners
    
    // Iniciar temporizador
    startButton.addEventListener('click', startTimer);
    
    // Pausar temporizador
    pauseButton.addEventListener('click', pauseTimer);
    
    // Resetar temporizador
    resetButton.addEventListener('click', resetTimer);
    
    // Definir presets
    presetButtons.forEach(button => {
        button.addEventListener('click', () => {
            const seconds = parseInt(button.dataset.seconds);
            setTimerFromPreset(seconds);
            startTimer();
        });
    });
    
    // Atualizar exibição ao mudar os inputs
    hoursInput.addEventListener('input', () => {
        totalSeconds = calculateTotalSeconds();
        updateDisplay();
    });
    
    minutesInput.addEventListener('input', () => {
        totalSeconds = calculateTotalSeconds();
        updateDisplay();
    });
    
    secondsInput.addEventListener('input', () => {
        totalSeconds = calculateTotalSeconds();
        updateDisplay();
    });
    
    // Inicializar display
    updateDisplay();
}