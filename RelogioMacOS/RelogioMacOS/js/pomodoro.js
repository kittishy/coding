/**
 * Relógio macOS - Módulo de Pomodoro
 * Implementa as funcionalidades do temporizador Pomodoro
 */

function initPomodoro() {
    // Elementos do DOM
    const statusElement = document.querySelector('#pomodoro-view .status');
    const timeElement = document.querySelector('#pomodoro-view .time');
    const cycleCountElement = document.querySelector('#pomodoro-view .cycle-count');
    const progressRingElement = document.querySelector('.progress-ring-circle-value');
    
    // Botões de controle
    const startButton = document.getElementById('pomodoro-start');
    const pauseButton = document.getElementById('pomodoro-pause');
    const skipButton = document.getElementById('pomodoro-skip');
    const resetButton = document.getElementById('pomodoro-reset');
    const settingsButton = document.getElementById('pomodoro-settings-btn');
    
    // Elementos da configuração
    const settingsModal = document.getElementById('pomodoro-settings-modal');
    const saveSettingsButton = document.getElementById('save-pomodoro-settings');
    const focusTimeInput = document.getElementById('focus-time');
    const shortBreakTimeInput = document.getElementById('short-break-time');
    const longBreakTimeInput = document.getElementById('long-break-time');
    const cycleCountInput = document.getElementById('cycle-count');
    const autoStartBreaksInput = document.getElementById('auto-start-breaks');
    const autoStartPomodorosInput = document.getElementById('auto-start-pomodoros');
    
    // Estados do Pomodoro
    const STATES = {
        FOCUS: 'focus',
        SHORT_BREAK: 'short-break',
        LONG_BREAK: 'long-break'
    };
    
    // Configurações padrão
    let settings = {
        focusTime: 25, // minutos
        shortBreakTime: 5, // minutos
        longBreakTime: 15, // minutos
        cyclesBeforeLongBreak: 4,
        autoStartBreaks: true,
        autoStartPomodoros: false
    };
    
    // Variáveis de estado
    let currentState = STATES.FOCUS;
    let timeLeft = settings.focusTime * 60; // em segundos
    let totalTime = settings.focusTime * 60; // em segundos
    let timerInterval = null;
    let isActive = false;
    let currentCycle = 1;
    
    // Configurar circunferência para o anel de progresso
    const circle = progressRingElement;
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = circumference;
    
    // Carregar configurações do localStorage
    function loadSettings() {
        const savedSettings = localStorage.getItem('pomodoro-settings');
        if (savedSettings) {
            settings = JSON.parse(savedSettings);
            
            // Atualizar inputs com valores salvos
            focusTimeInput.value = settings.focusTime;
            shortBreakTimeInput.value = settings.shortBreakTime;
            longBreakTimeInput.value = settings.longBreakTime;
            cycleCountInput.value = settings.cyclesBeforeLongBreak;
            autoStartBreaksInput.checked = settings.autoStartBreaks;
            autoStartPomodorosInput.checked = settings.autoStartPomodoros;
            
            // Resetar timer com novas configurações
            resetTimer();
        }
    }
    
    // Salvar configurações no localStorage
    function saveSettings() {
        settings = {
            focusTime: parseInt(focusTimeInput.value),
            shortBreakTime: parseInt(shortBreakTimeInput.value),
            longBreakTime: parseInt(longBreakTimeInput.value),
            cyclesBeforeLongBreak: parseInt(cycleCountInput.value),
            autoStartBreaks: autoStartBreaksInput.checked,
            autoStartPomodoros: autoStartPomodorosInput.checked
        };
        
        localStorage.setItem('pomodoro-settings', JSON.stringify(settings));
        
        // Resetar timer com novas configurações
        resetTimer();
        
        // Mostrar notificação
        showNotification('Configurações do Pomodoro salvas');
    }
    
    // Atualizar o anel de progresso
    function setProgress(percent) {
        const offset = circumference - (percent / 100 * circumference);
        circle.style.strokeDashoffset = offset;
    }
    
    // Formatar tempo para exibição (MM:SS)
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    // Iniciar temporizador
    function startTimer() {
        if (!isActive) {
            isActive = true;
            
            // Atualizar botões
            startButton.disabled = true;
            pauseButton.disabled = false;
            skipButton.disabled = false;
            resetButton.disabled = false;
            
            timerInterval = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    updateTimerDisplay();
                } else {
                    completeCurrentState();
                }
            }, 1000);
        }
    }
    
    // Pausar temporizador
    function pauseTimer() {
        if (isActive) {
            isActive = false;
            clearInterval(timerInterval);
            
            // Atualizar botões
            startButton.disabled = false;
            pauseButton.disabled = true;
        }
    }
    
    // Avançar para o próximo estado
    function skipToNextState() {
        clearInterval(timerInterval);
        completeCurrentState();
    }
    
    // Resetar temporizador
    function resetTimer() {
        // Parar timer ativo
        clearInterval(timerInterval);
        isActive = false;
        
        // Resetar para estado inicial
        currentState = STATES.FOCUS;
        currentCycle = 1;
        
        // Definir duração com base no estado atual
        timeLeft = settings.focusTime * 60;
        totalTime = timeLeft;
        
        // Atualizar interface
        updateStateDisplay();
        updateTimerDisplay();
        
        // Resetar botões
        startButton.disabled = false;
        pauseButton.disabled = true;
        skipButton.disabled = true;
        resetButton.disabled = true;
    }
    
    // Completar o estado atual e passar para o próximo
    function completeCurrentState() {
        clearInterval(timerInterval);
        
        // Tocar som de notificação
        playNotificationSound();
        
        // Mostrar notificação de sistema (se suportado)
        showSystemNotification();
        
        // Determinar próximo estado
        if (currentState === STATES.FOCUS) {
            // Se completou ciclos suficientes, fazer pausa longa
            if (currentCycle >= settings.cyclesBeforeLongBreak) {
                currentState = STATES.LONG_BREAK;
                timeLeft = settings.longBreakTime * 60;
                currentCycle = 1; // Reiniciar contagem após pausa longa
            } else {
                currentState = STATES.SHORT_BREAK;
                timeLeft = settings.shortBreakTime * 60;
                // Manter ciclo atual durante pausa curta
            }
        } else {
            // Se estava em pausa (curta ou longa), voltar para foco
            currentState = STATES.FOCUS;
            timeLeft = settings.focusTime * 60;
            
            // Incrementar ciclo apenas após voltar de uma pausa curta
            if (currentState === STATES.SHORT_BREAK) {
                currentCycle++;
            }
        }
        
        totalTime = timeLeft;
        isActive = false;
        
        // Atualizar interface
        updateStateDisplay();
        updateTimerDisplay();
        
        // Iniciar automaticamente se configurado
        if (currentState === STATES.FOCUS && settings.autoStartPomodoros) {
            startTimer();
        } else if (currentState !== STATES.FOCUS && settings.autoStartBreaks) {
            startTimer();
        } else {
            // Resetar botões para estado inicial
            startButton.disabled = false;
            pauseButton.disabled = true;
            skipButton.disabled = false;
            resetButton.disabled = false;
        }
    }
    
    // Atualizar a exibição do temporizador
    function updateTimerDisplay() {
        timeElement.textContent = formatTime(timeLeft);
        
        // Calcular porcentagem e atualizar anel de progresso
        const percentComplete = ((totalTime - timeLeft) / totalTime) * 100;
        setProgress(percentComplete);
    }
    
    // Atualizar a exibição do estado atual
    function updateStateDisplay() {
        // Atualizar texto do estado
        if (currentState === STATES.FOCUS) {
            statusElement.textContent = 'Foco';
            circle.style.stroke = '#FF6347'; // Vermelho tomate
        } else if (currentState === STATES.SHORT_BREAK) {
            statusElement.textContent = 'Pausa Curta';
            circle.style.stroke = '#4CAF50'; // Verde
        } else {
            statusElement.textContent = 'Pausa Longa';
            circle.style.stroke = '#2196F3'; // Azul
        }
        
        // Atualizar contagem de ciclos
        cycleCountElement.textContent = `Ciclo: ${currentCycle}/${settings.cyclesBeforeLongBreak}`;
    }
    
    // Tocar som de notificação
    function playNotificationSound() {
        const audio = new Audio('assets/sounds/notification.mp3');
        audio.play();
    }
    
    // Mostrar notificação do sistema
    function showSystemNotification() {
        // Verificar se Notifications API é suportada
        if ('Notification' in window) {
            // Verificar permissão
            if (Notification.permission === 'granted') {
                sendNotification();
            } else if (Notification.permission !== 'denied') {
                // Solicitar permissão
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        sendNotification();
                    }
                });
            }
        }
        
        function sendNotification() {
            let title, body;
            
            if (currentState === STATES.FOCUS) {
                title = 'Tempo de foco concluído!';
                body = 'Hora de fazer uma pausa.';
            } else {
                title = 'Pausa concluída!';
                body = 'Hora de voltar ao trabalho.';
            }
            
            new Notification(title, {
                body: body,
                icon: 'assets/icons/light/pomodoro.png'
            });
        }
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
    
    // Event Listeners
    
    // Iniciar temporizador
    startButton.addEventListener('click', startTimer);
    
    // Pausar temporizador
    pauseButton.addEventListener('click', pauseTimer);
    
    // Pular para próximo estado
    skipButton.addEventListener('click', skipToNextState);
    
    // Resetar temporizador
    resetButton.addEventListener('click', resetTimer);
    
    // Abrir modal de configurações
    settingsButton.addEventListener('click', () => {
        settingsModal.style.display = 'flex';
    });
    
    // Salvar configurações
    saveSettingsButton.addEventListener('click', () => {
        // Validar inputs
        if (parseInt(focusTimeInput.value) <= 0 || parseInt(shortBreakTimeInput.value) <= 0 || 
            parseInt(longBreakTimeInput.value) <= 0 || parseInt(cycleCountInput.value) <= 0) {
            alert('Todos os valores de tempo devem ser maiores que zero.');
            return;
        }
        
        saveSettings();
        settingsModal.style.display = 'none';
    });
    
    // Fechar modais
    const closeModalButtons = document.querySelectorAll('.close-modal');
    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Fechar modal ao clicar fora do conteúdo
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    // Inicialização
    loadSettings();
    updateStateDisplay();
    updateTimerDisplay();
    
    // Exportar funções para uso externo se necessário
    return {
        start: startTimer,
        pause: pauseTimer,
        skip: skipToNextState,
        reset: resetTimer
    };
}
