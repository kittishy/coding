/**
 * Relógio macOS - Módulo de Alarme
 * Implementa as funcionalidades de criação, edição e controle de alarmes
 */

function initAlarm() {
    // Elementos do DOM
    const alarmsListElement = document.getElementById('alarms-list');
    const addAlarmButton = document.getElementById('add-alarm');
    const alarmModal = document.getElementById('alarm-modal');
    const saveAlarmButton = document.getElementById('save-alarm');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    
    // Configurações do alarme
    const alarmHoursInput = document.getElementById('alarm-hours');
    const alarmMinutesInput = document.getElementById('alarm-minutes');
    const alarmNameInput = document.getElementById('alarm-name');
    const alarmSoundSelect = document.getElementById('alarm-sound');
    const weekdayCheckboxes = document.querySelectorAll('.weekdays-select input[type="checkbox"]');
    
    // Variáveis de estado
    let alarms = [];
    let editingAlarmId = null;
    let checkInterval = null;
    
    // Carregar alarmes do localStorage
    function loadAlarms() {
        const savedAlarms = localStorage.getItem('alarms');
        if (savedAlarms) {
            alarms = JSON.parse(savedAlarms);
            renderAlarmsList();
        }
    }
    
    // Salvar alarmes no localStorage
    function saveAlarms() {
        localStorage.setItem('alarms', JSON.stringify(alarms));
    }
    
    // Renderizar lista de alarmes
    function renderAlarmsList() {
        if (alarms.length === 0) {
            alarmsListElement.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bell"></i>
                    <p>Nenhum alarme configurado</p>
                </div>
            `;
            return;
        }
        
        alarmsListElement.innerHTML = '';
        
        // Ordenar alarmes por hora
        alarms.sort((a, b) => {
            if (a.hours === b.hours) {
                return a.minutes - b.minutes;
            }
            return a.hours - b.hours;
        });
        
        alarms.forEach(alarm => {
            const alarmElement = document.createElement('div');
            alarmElement.className = 'alarm-item';
            alarmElement.dataset.id = alarm.id;
            
            // Formatar hora do alarme
            const hours = alarm.hours.toString().padStart(2, '0');
            const minutes = alarm.minutes.toString().padStart(2, '0');
            const timeString = `${hours}:${minutes}`;
            
            // Formatar dias da semana
            let daysText = '';
            if (alarm.days.length === 7) {
                daysText = 'Todos os dias';
            } else if (alarm.days.length === 0) {
                daysText = 'Uma vez';
            } else if (JSON.stringify(alarm.days) === JSON.stringify([1, 2, 3, 4, 5])) {
                daysText = 'Dias de semana';
            } else if (JSON.stringify(alarm.days) === JSON.stringify([0, 6])) {
                daysText = 'Fins de semana';
            } else {
                const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                daysText = alarm.days.map(day => dayNames[day]).join(', ');
            }
            
            alarmElement.innerHTML = `
                <div class="alarm-time">${timeString}</div>
                <div class="alarm-details">
                    <div class="alarm-name">${alarm.name}</div>
                    <div class="alarm-days">${daysText}</div>
                </div>
                <div class="alarm-actions">
                    <label class="switch">
                        <input type="checkbox" ${alarm.active ? 'checked' : ''}>
                        <span class="slider round"></span>
                    </label>
                    <button class="edit-alarm-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-alarm-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            alarmsListElement.appendChild(alarmElement);
            
            // Event listeners para botões de cada alarme
            const toggleSwitch = alarmElement.querySelector('input[type="checkbox"]');
            toggleSwitch.addEventListener('change', () => toggleAlarm(alarm.id, toggleSwitch.checked));
            
            const editButton = alarmElement.querySelector('.edit-alarm-btn');
            editButton.addEventListener('click', () => openEditAlarmModal(alarm.id));
            
            const deleteButton = alarmElement.querySelector('.delete-alarm-btn');
            deleteButton.addEventListener('click', () => deleteAlarm(alarm.id));
        });
    }
    
    // Adicionar novo alarme
    function addAlarm(alarmData) {
        const newAlarm = {
            id: Date.now().toString(),
            name: alarmData.name || 'Alarme',
            hours: alarmData.hours,
            minutes: alarmData.minutes,
            days: alarmData.days || [],
            sound: alarmData.sound || 'alarm.mp3',
            active: true
        };
        
        alarms.push(newAlarm);
        saveAlarms();
        renderAlarmsList();
        startAlarmCheck();
        
        // Mostrar notificação
        showNotification(`Alarme definido para ${newAlarm.hours.toString().padStart(2, '0')}:${newAlarm.minutes.toString().padStart(2, '0')}`);
    }
    
    // Editar alarme existente
    function editAlarm(id, alarmData) {
        const index = alarms.findIndex(alarm => alarm.id === id);
        if (index !== -1) {
            alarms[index] = {
                ...alarms[index],
                name: alarmData.name || alarms[index].name,
                hours: alarmData.hours,
                minutes: alarmData.minutes,
                days: alarmData.days,
                sound: alarmData.sound
            };
            
            saveAlarms();
            renderAlarmsList();
            
            // Mostrar notificação
            showNotification('Alarme atualizado com sucesso');
        }
    }
    
    // Deletar alarme
    function deleteAlarm(id) {
        if (confirm('Tem certeza que deseja excluir este alarme?')) {
            alarms = alarms.filter(alarm => alarm.id !== id);
            saveAlarms();
            renderAlarmsList();
            
            if (alarms.length === 0) {
                stopAlarmCheck();
            }
            
            // Mostrar notificação
            showNotification('Alarme excluído com sucesso');
        }
    }
    
    // Ativar/Desativar alarme
    function toggleAlarm(id, active) {
        const index = alarms.findIndex(alarm => alarm.id === id);
        if (index !== -1) {
            alarms[index].active = active;
            saveAlarms();
            
            // Mostrar notificação
            const message = active ? 'Alarme ativado' : 'Alarme desativado';
            showNotification(message);
            
            if (active && !checkInterval) {
                startAlarmCheck();
            } else if (!active && !alarms.some(alarm => alarm.active)) {
                stopAlarmCheck();
            }
        }
    }
    
    // Abrir modal para edição de alarme
    function openEditAlarmModal(id) {
        const alarm = alarms.find(alarm => alarm.id === id);
        if (alarm) {
            editingAlarmId = id;
            
            // Preencher campos com valores do alarme
            alarmHoursInput.value = alarm.hours;
            alarmMinutesInput.value = alarm.minutes;
            alarmNameInput.value = alarm.name;
            alarmSoundSelect.value = alarm.sound;
            
            // Marcar dias da semana
            weekdayCheckboxes.forEach(checkbox => {
                checkbox.checked = alarm.days.includes(parseInt(checkbox.value));
            });
            
            // Abrir modal
            alarmModal.style.display = 'flex';
        }
    }
    
    // Verificar alarmes ativos
    function checkAlarms() {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentDay = now.getDay(); // 0-6 (Dom-Sáb)
        
        alarms.forEach(alarm => {
            if (alarm.active && 
                alarm.hours === currentHour && 
                alarm.minutes === currentMinute && 
                (alarm.days.length === 0 || alarm.days.includes(currentDay))) {
                
                triggerAlarm(alarm);
                
                // Se o alarme não é recorrente (sem dias selecionados), desativá-lo após disparar
                if (alarm.days.length === 0) {
                    toggleAlarm(alarm.id, false);
                }
            }
        });
    }
    
    // Disparar alarme
    function triggerAlarm(alarm) {
        // Criar elemento de áudio e reproduzir
        const audio = new Audio(`assets/sounds/${alarm.sound}`);
        audio.loop = true;
        audio.play();
        
        // Criar modal de alarme
        const alarmAlertModal = document.createElement('div');
        alarmAlertModal.className = 'modal alarm-alert-modal';
        alarmAlertModal.style.display = 'flex';
        
        alarmAlertModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${alarm.name}</h3>
                </div>
                <div class="modal-body">
                    <div class="alarm-icon">
                        <i class="fas fa-bell fa-bounce"></i>
                    </div>
                    <div class="alarm-time">
                        ${alarm.hours.toString().padStart(2, '0')}:${alarm.minutes.toString().padStart(2, '0')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary stop-alarm">Parar</button>
                    <button class="btn btn-secondary snooze-alarm">Soneca (5 min)</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(alarmAlertModal);
        
        // Evento para botão parar
        const stopButton = alarmAlertModal.querySelector('.stop-alarm');
        stopButton.addEventListener('click', () => {
            audio.pause();
            alarmAlertModal.remove();
        });
        
        // Evento para botão soneca
        const snoozeButton = alarmAlertModal.querySelector('.snooze-alarm');
        snoozeButton.addEventListener('click', () => {
            audio.pause();
            alarmAlertModal.remove();
            
            // Criar alarme de soneca (5 minutos depois)
            const snoozeTime = new Date();
            snoozeTime.setMinutes(snoozeTime.getMinutes() + 5);
            
            addAlarm({
                name: `${alarm.name} (Soneca)`,
                hours: snoozeTime.getHours(),
                minutes: snoozeTime.getMinutes(),
                days: [],
                sound: alarm.sound
            });
        });
    }
    
    // Mostrar notificação
    function showNotification(message) {
        const notificationContainer = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        notificationContainer.appendChild(notification);
        
        // Reproduzir som de notificação
        const audio = new Audio('assets/sounds/notification.mp3');
        audio.play();
        
        // Remover notificação após alguns segundos
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // Iniciar verificação de alarmes
    function startAlarmCheck() {
        if (!checkInterval) {
            checkInterval = setInterval(checkAlarms, 60000); // Verificar a cada minuto
        }
    }
    
    // Parar verificação de alarmes
    function stopAlarmCheck() {
        if (checkInterval) {
            clearInterval(checkInterval);
            checkInterval = null;
        }
    }
    
    // Event Listeners
    
    // Abrir modal para adicionar alarme
    addAlarmButton.addEventListener('click', () => {
        // Resetar campos do modal
        editingAlarmId = null;
        alarmHoursInput.value = new Date().getHours();
        alarmMinutesInput.value = 0;
        alarmNameInput.value = 'Alarme';
        alarmSoundSelect.value = 'alarm.mp3';
        
        // Desmarcar todos os checkboxes
        weekdayCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Exibir modal
        alarmModal.style.display = 'flex';
    });
    
    // Salvar alarme
    saveAlarmButton.addEventListener('click', () => {
        // Validar campos
        const hours = parseInt(alarmHoursInput.value, 10);
        const minutes = parseInt(alarmMinutesInput.value, 10);
        
        if (isNaN(hours) || hours < 0 || hours > 23 || isNaN(minutes) || minutes < 0 || minutes > 59) {
            alert('Por favor, insira um horário válido.');
            return;
        }
        
        // Obter dias selecionados
        const selectedDays = [];
        weekdayCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                selectedDays.push(parseInt(checkbox.value, 10));
            }
        });
        
        const alarmData = {
            name: alarmNameInput.value.trim(),
            hours: hours,
            minutes: minutes,
            days: selectedDays,
            sound: alarmSoundSelect.value
        };
        
        if (editingAlarmId) {
            editAlarm(editingAlarmId, alarmData);
        } else {
            addAlarm(alarmData);
        }
        
        // Fechar modal
        alarmModal.style.display = 'none';
    });
    
    // Fechar modais
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
    loadAlarms();
    if (alarms.some(alarm => alarm.active)) {
        startAlarmCheck();
    }
    
    // Verificar imediatamente
    checkAlarms();
    
    // Exportar funções para uso externo se necessário
    return {
        addAlarm,
        editAlarm,
        deleteAlarm,
        toggleAlarm
    };
}
