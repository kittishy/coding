/**
 * Controle de Alarmes
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do alarme
    const alarmList = document.querySelector('.alarm-list');
    const noAlarmsMessage = document.querySelector('.no-alarms');
    const addAlarmBtn = document.querySelector('.add-alarm-btn');
    const alarmModal = document.getElementById('alarm-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const saveAlarmBtn = document.querySelector('.save-alarm');
    const alarmHoursInput = document.getElementById('alarm-hours');
    const alarmMinutesInput = document.getElementById('alarm-minutes');
    const dayButtons = document.querySelectorAll('.day-btn');
    const alarmLabelInput = document.getElementById('alarm-label');
    
    // Carrega os alarmes do localStorage
    let alarms = [];
    try {
        const savedAlarms = localStorage.getItem('alarms');
        if (savedAlarms) {
            alarms = JSON.parse(savedAlarms);
        }
    } catch (error) {
        console.error('Erro ao carregar alarmes:', error);
        alarms = [];
    }
    
    // Array para armazenar os alarmes
    let alarms = [];
    
    // Carrega os alarmes do localStorage
    loadAlarmsFromStorage();
    
    // Inicializa a lista de alarmes e começa a verificação
    renderAlarms();
    setInterval(checkAlarms, 60000); // Verifica os alarmes a cada minuto
    
    // Função para carregar alarmes do localStorage
    function loadAlarmsFromStorage() {
        try {
            const savedAlarms = localStorage.getItem('alarms');
            if (savedAlarms) {
                alarms = JSON.parse(savedAlarms);
            }
        } catch (error) {
            console.error('Erro ao carregar alarmes:', error);
            alarms = [];
        }
    }
    
    // Adiciona eventos para os botões
    addAlarmBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    saveAlarmBtn.addEventListener('click', saveAlarm);
    
    // Adiciona eventos para os botões de dia
    dayButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    });
    
    // Abre o modal para adicionar um alarme
    function openModal() {
        // Reseta os campos do modal
        const now = new Date();
        alarmHoursInput.value = now.getHours();
        alarmMinutesInput.value = now.getMinutes();
        alarmLabelInput.value = '';
        
        // Desativa todos os botões de dia
        dayButtons.forEach(button => button.classList.remove('active'));
        
        // Exibe o modal
        alarmModal.style.display = 'block';
        alarmModal.classList.add('show');
    }
    
    // Fecha o modal
    function closeModal() {
        alarmModal.classList.remove('show');
    }
    
    // Salva um novo alarme
    function saveAlarm() {
        const hours = parseInt(alarmHoursInput.value);
        const minutes = parseInt(alarmMinutesInput.value);
        const label = alarmLabelInput.value.trim() || 'Alarme';
        
        // Obtém os dias selecionados
        const days = [];
        dayButtons.forEach(button => {
            if (button.classList.contains('active')) {
                days.push(parseInt(button.dataset.day));
            }
        });
        
        // Cria um novo alarme
        const newAlarm = {
            id: Date.now(), // ID único baseado no timestamp
            hours,
            minutes,
            days,
            label,
            enabled: true
        };
        
        // Adiciona o alarme à lista
        alarms.push(newAlarm);
        
        // Salva os alarmes no localStorage
        saveAlarmsToStorage();
        
        // Atualiza a lista de alarmes
        renderAlarms();
        
        // Fecha o modal
        closeModal();
    }
    
    // Renderiza a lista de alarmes
    function renderAlarms() {
        // Limpa a lista atual
        alarmList.innerHTML = '';
        
        // Exibe a mensagem de "nenhum alarme" se não houver alarmes
        if (alarms.length === 0) {
            noAlarmsMessage.style.display = 'block';
            return;
        }
        
        // Oculta a mensagem de "nenhum alarme"
        noAlarmsMessage.style.display = 'none';
        
        // Ordena os alarmes por hora
        alarms.sort((a, b) => {
            if (a.hours !== b.hours) {
                return a.hours - b.hours;
            }
            return a.minutes - b.minutes;
        });
        
        // Adiciona cada alarme à lista
        alarms.forEach(alarm => {
            const alarmItem = document.createElement('div');
            alarmItem.className = 'alarm-item';
            alarmItem.dataset.id = alarm.id;
            
            // Formata a hora do alarme
            const formattedTime = `${padZero(alarm.hours)}:${padZero(alarm.minutes)}`;
            
            // Formata os dias do alarme
            let daysText = '';
            if (alarm.days.length === 0) {
                daysText = 'Uma vez';
            } else if (alarm.days.length === 7) {
                daysText = 'Todos os dias';
            } else {
                const dayAbbreviations = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
                daysText = alarm.days.map(day => dayAbbreviations[day]).join(', ');
            }
            
            // Cria o HTML do item de alarme
            alarmItem.innerHTML = `
                <div class="alarm-info">
                    <div class="alarm-time">${formattedTime}</div>
                    <div class="alarm-label">${alarm.label}</div>
                    <div class="alarm-days">${daysText}</div>
                </div>
                <div class="alarm-actions">
                    <div class="alarm-toggle ${alarm.enabled ? 'active' : ''}"></div>
                    <button class="delete-alarm"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            alarmList.appendChild(alarmItem);
            
            // Adiciona evento para o botão de toggle
            const toggleBtn = alarmItem.querySelector('.alarm-toggle');
            toggleBtn.addEventListener('click', function() {
                toggleAlarm(alarm.id);
            });
            
            // Adiciona evento para o botão de excluir
            const deleteBtn = alarmItem.querySelector('.delete-alarm');
            deleteBtn.addEventListener('click', function() {
                deleteAlarm(alarm.id);
            });
        });
    }
    
    // Alterna o estado de um alarme (ativado/desativado)
    function toggleAlarm(id) {
        const alarmIndex = alarms.findIndex(alarm => alarm.id === id);
        if (alarmIndex !== -1) {
            alarms[alarmIndex].enabled = !alarms[alarmIndex].enabled;
            saveAlarmsToStorage();
            renderAlarms();
        }
    }
    
    // Exclui um alarme
    function deleteAlarm(id) {
        alarms = alarms.filter(alarm => alarm.id !== id);
        saveAlarmsToStorage();
        renderAlarms();
    }
    
    // Salva os alarmes no localStorage
    function saveAlarmsToStorage() {
        localStorage.setItem('alarms', JSON.stringify(alarms));
    }
    
    // Verifica os alarmes a cada minuto
    function checkAlarms() {
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentDay = now.getDay();
        
        console.log('Verificando alarmes:', currentHours + ':' + currentMinutes + ', Dia: ' + currentDay);
        console.log('Alarmes ativos:', alarms.filter(a => a.enabled).length);
        
        alarms.forEach(alarm => {
            if (alarm.enabled && 
                alarm.hours === currentHours && 
                alarm.minutes === currentMinutes && 
                (alarm.days.length === 0 || alarm.days.includes(currentDay))) {
                
                console.log('Alarme encontrado para disparar:', alarm.label);
                // Dispara o alarme
                triggerAlarm(alarm);
            }
        });
    }
    
    // Dispara um alarme
    function triggerAlarm(alarm) {
        // Cria uma notificação visual na interface
        const notification = document.createElement('div');
        notification.className = 'alarm-notification';
        notification.innerHTML = `
            <div class="alarm-notification-content">
                <h3>Alarme Ativado!</h3>
                <p>${alarm.label}</p>
                <p>${padZero(alarm.hours)}:${padZero(alarm.minutes)}</p>
                <button class="dismiss-alarm">Desligar</button>
            </div>
        `;
        
        // Adiciona a notificação ao corpo do documento
        document.body.appendChild(notification);
        
        // Reproduz um som de alarme (se disponível)
        playAlarmSound();
        
        // Adiciona evento para o botão de desligar
        const dismissBtn = notification.querySelector('.dismiss-alarm');
        dismissBtn.addEventListener('click', function() {
            stopAlarmSound();
            document.body.removeChild(notification);
        });
        
        // Remove a notificação após 60 segundos se não for desligada
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
                stopAlarmSound();
            }
        }, 60000);
    }
    
    // Reproduz um som de alarme
    function playAlarmSound() {
        // Cria um elemento de áudio
        let alarmSound = document.getElementById('alarm-sound');
        
        // Se o elemento não existir, cria um novo
        if (!alarmSound) {
            alarmSound = document.createElement('audio');
            alarmSound.id = 'alarm-sound';
            alarmSound.loop = true;
            alarmSound.src = 'https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3';
            document.body.appendChild(alarmSound);
        }
        
        // Reproduz o som
        alarmSound.play().catch(error => {
            console.error('Erro ao reproduzir som de alarme:', error);
        });
    }
    
    // Para o som do alarme
    function stopAlarmSound() {
        const alarmSound = document.getElementById('alarm-sound');
        if (alarmSound) {
            alarmSound.pause();
            alarmSound.currentTime = 0;
        }
    }
    
    // Adiciona zero à esquerda para números menores que 10
    function padZero(num) {
        return num < 10 ? `0${num}` : num;
    }
    
    // Verifica os alarmes a cada 10 segundos para maior precisão
    setInterval(checkAlarms, 10000);
    
    // Verifica os alarmes imediatamente ao carregar a página
    checkAlarms();
    
    // Registra que o sistema de alarmes foi inicializado
    console.log('Sistema de alarmes inicializado com', alarms.length, 'alarmes configurados');
});