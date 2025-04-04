/**
 * Relógio macOS - Módulo de Cronômetro
 * Implementa as funcionalidades do cronômetro com marcação de voltas
 */

function initStopwatch() {
    // Elementos do DOM
    const timeElement = document.querySelector('#stopwatch-view .time');
    const millisecondsElement = document.querySelector('#stopwatch-view .milliseconds');
    const startButton = document.getElementById('stopwatch-start');
    const lapButton = document.getElementById('stopwatch-lap');
    const resetButton = document.getElementById('stopwatch-reset');
    const lapsListElement = document.getElementById('laps-list');
    
    // Variáveis de estado
    let startTime = 0;
    let elapsedTime = 0;
    let timerInterval = null;
    let isRunning = false;
    let laps = [];
    let lastLapTime = 0;
    
    // Formatação de tempo
    function formatTime(milliseconds) {
        // Converter para segundos, minutos e horas
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        // Formatar como HH:MM:SS
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Formatação de milissegundos
    function formatMilliseconds(milliseconds) {
        return (milliseconds % 1000).toString().padStart(3, '0');
    }
    
    // Atualizar a exibição do tempo
    function updateDisplay() {
        const currentTime = isRunning ? Date.now() - startTime + elapsedTime : elapsedTime;
        timeElement.textContent = formatTime(currentTime);
        millisecondsElement.textContent = formatMilliseconds(currentTime);
    }
    
    // Iniciar ou pausar o cronômetro
    function toggleTimer() {
        if (isRunning) {
            // Pausar
            clearInterval(timerInterval);
            elapsedTime += Date.now() - startTime;
            isRunning = false;
            startButton.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            // Iniciar
            startTime = Date.now();
            isRunning = true;
            startButton.innerHTML = '<i class="fas fa-pause"></i>';
            
            timerInterval = setInterval(updateDisplay, 10); // Atualizar a cada 10ms para precisão
        }
        
        // Atualizar estado dos botões
        lapButton.disabled = !isRunning;
        resetButton.disabled = !(elapsedTime > 0);
    }
    
    // Registrar volta
    function recordLap() {
        if (!isRunning) return;
        
        const currentTime = Date.now() - startTime + elapsedTime;
        const lapTime = currentTime - lastLapTime;
        lastLapTime = currentTime;
        
        const lapNumber = laps.length + 1;
        
        laps.push({
            number: lapNumber,
            totalTime: currentTime,
            lapTime: lapTime
        });
        
        renderLaps();
        
        // Tocar som de clique
        const clickSound = new Audio('assets/sounds/click.mp3');
        clickSound.play();
    }
    
    // Renderizar lista de voltas
    function renderLaps() {
        // Limpar lista atual
        lapsListElement.innerHTML = '';
        
        if (laps.length === 0) return;
        
        // Criar cabeçalho da lista
        const header = document.createElement('div');
        header.className = 'lap-header';
        header.innerHTML = `
            <div class="lap-number">Volta</div>
            <div class="lap-time">Tempo da Volta</div>
            <div class="total-time">Tempo Total</div>
        `;
        lapsListElement.appendChild(header);
        
        // Encontrar a volta mais rápida e a mais lenta
        let fastestLapIndex = 0;
        let slowestLapIndex = 0;
        
        for (let i = 0; i < laps.length; i++) {
            if (i === 0) continue; // Pular a primeira volta para comparações
            
            if (laps[i].lapTime < laps[fastestLapIndex].lapTime) {
                fastestLapIndex = i;
            }
            
            if (laps[i].lapTime > laps[slowestLapIndex].lapTime) {
                slowestLapIndex = i;
            }
        }
        
        // Adicionar voltas em ordem reversa (mais recente primeiro)
        for (let i = laps.length - 1; i >= 0; i--) {
            const lap = laps[i];
            const lapElement = document.createElement('div');
            lapElement.className = 'lap-item';
            
            // Adicionar classes para voltas mais rápida e mais lenta
            if (laps.length > 1) {
                if (i === fastestLapIndex) {
                    lapElement.classList.add('fastest-lap');
                } else if (i === slowestLapIndex) {
                    lapElement.classList.add('slowest-lap');
                }
            }
            
            lapElement.innerHTML = `
                <div class="lap-number">Volta ${lap.number}</div>
                <div class="lap-time">${formatTime(lap.lapTime)}.${formatMilliseconds(lap.lapTime)}</div>
                <div class="total-time">${formatTime(lap.totalTime)}.${formatMilliseconds(lap.totalTime)}</div>
            `;
            
            lapsListElement.appendChild(lapElement);
        }
    }
    
    // Resetar cronômetro
    function resetTimer() {
        clearInterval(timerInterval);
        isRunning = false;
        startTime = 0;
        elapsedTime = 0;
        lastLapTime = 0;
        laps = [];
        
        timeElement.textContent = '00:00:00';
        millisecondsElement.textContent = '000';
        lapsListElement.innerHTML = '';
        
        startButton.innerHTML = '<i class="fas fa-play"></i>';
        lapButton.disabled = true;
        resetButton.disabled = true;
    }
    
    // Exportar para JSON
    function exportLaps() {
        if (laps.length === 0) {
            alert('Nenhuma volta registrada para exportar.');
            return;
        }
        
        const data = JSON.stringify(laps, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `cronometro_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Voltas exportadas com sucesso');
    }
    
    // Mostrar notificação
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
    startButton.addEventListener('click', toggleTimer);
    lapButton.addEventListener('click', recordLap);
    resetButton.addEventListener('click', resetTimer);
    
    // Adicionar botão de exportação (opcional)
    const exportButton = document.createElement('button');
    exportButton.id = 'export-laps';
    exportButton.className = 'action-btn';
    exportButton.innerHTML = '<i class="fas fa-download"></i> Exportar Voltas';
    exportButton.addEventListener('click', exportLaps);
    
    // Adicionar após a lista de voltas
    lapsListElement.parentNode.insertBefore(exportButton, lapsListElement.nextSibling);
    exportButton.style.display = 'none'; // Inicialmente oculto
    
    // Mostrar botão de exportar quando houver voltas
    const observer = new MutationObserver(() => {
        exportButton.style.display = laps.length > 0 ? 'block' : 'none';
    });
    
    observer.observe(lapsListElement, { childList: true });
    
    // Atualizar display inicial
    updateDisplay();
    
    // Atalhos de teclado
    document.addEventListener('keydown', (e) => {
        if (document.querySelector('#stopwatch-view').classList.contains('active')) {
            if (e.code === 'Space') {
                toggleTimer();
                e.preventDefault();
            } else if (e.code === 'KeyL') {
                if (isRunning) {
                    recordLap();
                    e.preventDefault();
                }
            } else if (e.code === 'KeyR') {
                resetTimer();
                e.preventDefault();
            }
        }
    });
    
    // Exportar funções para uso externo
    return {
        start: () => {
            if (!isRunning) toggleTimer();
        },
        pause: () => {
            if (isRunning) toggleTimer();
        },
        reset: resetTimer,
        lap: recordLap,
        getLaps: () => [...laps],
        exportLaps: exportLaps
    };
}
