/**
 * Controle de Alarmes
 * Versão 2.0 - Redesenhado com base no Samsung OneUI
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
    
    // Sons disponíveis para alarmes
    const alarmSounds = [
        { id: 'default', name: 'Som padrão', url: 'https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3' },
        { id: 'morning', name: 'Bom dia', url: 'https://assets.mixkit.co/sfx/preview/mixkit-alarm-tone-996.mp3' },
        { id: 'gentle', name: 'Suave', url: 'https://assets.mixkit.co/sfx/preview/mixkit-classic-alarm-995.mp3' },
        { id: 'nature', name: 'Natureza', url: 'https://assets.mixkit.co/sfx/preview/mixkit-birds-in-forest-loop-1242.mp3' },
        { id: 'energetic', name: 'Energético', url: 'https://assets.mixkit.co/sfx/preview/mixkit-scanning-sci-fi-alarm-905.mp3' }
    ];
    
    // Adiciona seletor de som ao modal
    const soundSelector = document.createElement('div');
    soundSelector.className = 'sound-selector';
    soundSelector.innerHTML = `
        <label for="alarm-sound">Som do alarme</label>
        <select id="alarm-sound" class="alarm-sound-select">
            ${alarmSounds.map(sound => `<option value="${sound.id}">${sound.name}</option>`).join('')}
        </select>
        <button class="test-sound-btn">Testar</button>
    `;
    
    // Insere o seletor de som no modal antes do footer
    const modalBody = document.querySelector('.modal-body');
    modalBody.appendChild(soundSelector);
    
    // Adiciona evento para testar o som
    const testSoundBtn = document.querySelector('.test-sound-btn');
    const soundSelect = document.getElementById('alarm-sound');
    
    testSoundBtn.addEventListener('click', function() {
        const selectedSoundId = soundSelect.value;
        const sound = alarmSounds.find(s => s.id === selectedSoundId);
        if (sound) {
            playTestSound(sound.url);
        }
    });
    
    // Função para reproduzir som de teste
    function playTestSound(url) {
        const testSound = new Audio(url);
        testSound.volume = 0.5;
        testSound.play().catch(error => {
            console.error('Erro ao reproduzir som de teste:', error);
        });
        
        // Para o som após 3 segundos
        setTimeout(() => {
            testSound.pause();
            testSound.currentTime = 0;
        }, 3000);
    }
    
    // Abre o modal para adicionar um alarme
    function openModal() {
        // Reseta os campos do modal
        const now = new Date();
        alarmHoursInput.value = now.getHours();
        alarmMinutesInput.value = now.getMinutes();
        alarmLabelInput.value = '';
        soundSelect.value = 'default';
        
        // Desativa todos os botões de dia
        dayButtons.forEach(button => button.classList.remove('active'));
        
        // Exibe o modal
        alarmModal.style.display = 'block';
        alarmModal.classList.add('show');
    }
    
    // Fecha o modal
    function closeModal() {
        alarmModal.classList.remove('show');
        setTimeout(() => {
            alarmModal.style.display = 'none';
        }, 300); // Tempo da animação
    }
    
    // Salva um novo alarme
    function saveAlarm() {
        const hours = parseInt(alarmHoursInput.value);
        const minutes = parseInt(alarmMinutesInput.value);
        const label = alarmLabelInput.value.trim() || 'Alarme';
        const soundId = soundSelect.value;
        
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
            soundId,
            enabled: true,
            vibrate: true // Novo campo para vibração
        };
        
        // Adiciona o alarme à lista
        alarms.push(newAlarm);
        
        // Salva os alarmes no localStorage
        saveAlarmsToStorage();
        
        // Atualiza a lista de alarmes
        renderAlarms();
        
        // Fecha o modal
        closeModal();
        
        // Mostra notificação de confirmação
        showToast(`Alarme definido para ${padZero(hours)}:${padZero(minutes)}`);
    }
    
    // Mostra uma notificação toast
    function showToast(message) {
        // Cria o elemento toast se não existir
        let toast = document.querySelector('.toast-notification');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast-notification';
            document.body.appendChild(toast);
        }
        
        // Define a mensagem e exibe o toast
        toast.textContent = message;
        toast.classList.add('show');
        
        // Remove o toast após 3 segundos
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
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
            
            // Encontra o nome do som
            const sound = alarmSounds.find(s => s.id === alarm.soundId) || alarmSounds[0];
            
            // Cria o HTML do item de alarme com estilo OneUI
            alarmItem.innerHTML = `
                <div class="alarm-info">
                    <div class="alarm-time">${formattedTime}</div>
                    <div class="alarm-details">
                        <div class="alarm-label">${alarm.label}</div>
                        <div class="alarm-days">${daysText}</div>
                        <div class="alarm-sound"><i class="fas fa-music"></i> ${sound.name}</div>
                    </div>
                </div>
                <div class="alarm-actions">
                    <label class="switch">
                        <input type="checkbox" ${alarm.enabled ? 'checked' : ''}>
                        <span class="slider round"></span>
                    </label>
                    <button class="edit-alarm"><i class="fas fa-pen"></i></button>
                    <button class="delete-alarm"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            alarmList.appendChild(alarmItem);
            
            // Adiciona evento para o botão de toggle
            const toggleBtn = alarmItem.querySelector('input[type="checkbox"]');
            toggleBtn.addEventListener('change', function() {
                toggleAlarm(alarm.id, this.checked);
            });
            
            // Adiciona evento para o botão de editar
            const editBtn = alarmItem.querySelector('.edit-alarm');
            editBtn.addEventListener('click', function() {
                editAlarm(alarm.id);
            });
            
            // Adiciona evento para o botão de excluir
            const deleteBtn = alarmItem.querySelector('.delete-alarm');
            deleteBtn.addEventListener('click', function() {
                deleteAlarm(alarm.id);
            });
        });
    }
    
    // Edita um alarme existente
    function editAlarm(id) {
        const alarm = alarms.find(a => a.id === id);
        if (!alarm) return;
        
        // Preenche o modal com os dados do alarme
        alarmHoursInput.value = alarm.hours;
        alarmMinutesInput.value = alarm.minutes;
        alarmLabelInput.value = alarm.label;
        soundSelect.value = alarm.soundId || 'default';
        
        // Seleciona os dias corretos
        dayButtons.forEach(button => {
            const day = parseInt(button.dataset.day);
            button.classList.toggle('active', alarm.days.includes(day));
        });
        
        // Modifica o botão salvar para atualizar em vez de criar
        saveAlarmBtn.textContent = 'Atualizar';
        saveAlarmBtn.dataset.editId = id;
        
        // Remove o evento anterior e adiciona o novo
        saveAlarmBtn.removeEventListener('click', saveAlarm);
        saveAlarmBtn.addEventListener('click', function updateAlarmHandler() {
            updateAlarm(id);
            // Restaura o comportamento original
            saveAlarmBtn.textContent = 'Salvar';
            delete saveAlarmBtn.dataset.editId;
            saveAlarmBtn.removeEventListener('click', updateAlarmHandler);
            saveAlarmBtn.addEventListener('click', saveAlarm);
        });
        
        // Exibe o modal
        alarmModal.style.display = 'block';
        alarmModal.classList.add('show');
    }
    
    // Atualiza um alarme existente
    function updateAlarm(id) {
        const alarmIndex = alarms.findIndex(a => a.id === id);
        if (alarmIndex === -1) return;
        
        const hours = parseInt(alarmHoursInput.value);
        const minutes = parseInt(alarmMinutesInput.value);
        const label = alarmLabelInput.value.trim() || 'Alarme';
        const soundId = soundSelect.value;
        
        // Obtém os dias selecionados
        const days = [];
        dayButtons.forEach(button => {
            if (button.classList.contains('active')) {
                days.push(parseInt(button.dataset.day));
            }
        });
        
        // Atualiza o alarme
        alarms[alarmIndex] = {
            ...alarms[alarmIndex],
            hours,
            minutes,
            days,
            label,
            soundId
        };
        
        // Salva os alarmes no localStorage
        saveAlarmsToStorage();
        
        // Atualiza a lista de alarmes
        renderAlarms();
        
        // Fecha o modal
        closeModal();
        
        // Mostra notificação de confirmação
        showToast(`Alarme atualizado para ${padZero(hours)}:${padZero(minutes)}`);
    }
    
    // Alterna o estado de um alarme (ativado/desativado)
    function toggleAlarm(id, enabled) {
        const alarmIndex = alarms.findIndex(alarm => alarm.id === id);
        if (alarmIndex !== -1) {
            alarms[alarmIndex].enabled = enabled;
            saveAlarmsToStorage();
            
            // Mostra notificação
            const status = enabled ? 'ativado' : 'desativado';
            showToast(`Alarme ${status}`);
        }
    }
    
    // Exclui um alarme
    function deleteAlarm(id) {
        // Confirma a exclusão
        if (confirm('Tem certeza que deseja excluir este alarme?')) {
            alarms = alarms.filter(alarm => alarm.id !== id);
            saveAlarmsToStorage();
            renderAlarms();
            showToast('Alarme excluído');
        }
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
                <p class="alarm-label">${alarm.label}</p>
                <p class="alarm-time">${padZero(alarm.hours)}:${padZero(alarm.minutes)}</p>
                <div class="alarm-actions">
                    <button class="snooze-alarm">Soneca (5 min)</button>
                    <button class="dismiss-alarm">Desligar</button>
                </div>
            </div>
        `;
        
        // Adiciona a notificação ao corpo do documento
        document.body.appendChild(notification);
        
        // Reproduz um som de alarme
        const sound = alarmSounds.find(s => s.id === alarm.soundId) || alarmSounds[0];
        playAlarmSound(sound.url);
        
        // Vibra o dispositivo se suportado e habilitado
        if (alarm.vibrate && 'vibrate' in navigator) {
            // Padrão de vibração: 500ms vibra, 200ms pausa, repete
            navigator.vibrate([500, 200, 500, 200, 500]);
        }
        
        // Adiciona evento para o botão de soneca
        const snoozeBtn = notification.querySelector('.snooze-alarm');
        snoozeBtn.addEventListener('click', function() {
            snoozeAlarm(alarm);
            stopAlarmSound();
            document.body.removeChild(notification);
            if ('vibrate' in navigator) {
                navigator.vibrate(0); // Para a vibração
            }
        });
        
        // Adiciona evento para o botão de desligar
        const dismissBtn = notification.querySelector('.dismiss-alarm');
        dismissBtn.addEventListener('click', function() {
            stopAlarmSound();
            document.body.removeChild(notification);
            if ('vibrate' in navigator) {
                navigator.vibrate(0); // Para a vibração
            }
        });
        
        // Remove a notificação após 60 segundos se não for desligada
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
                stopAlarmSound();
                if ('vibrate' in navigator) {
                    navigator.vibrate(0); // Para a vibração
                }
            }
        }, 60000);
    }
    
    // Função de soneca - adiciona um alarme temporário para 5 minutos depois
    function snoozeAlarm(alarm) {
        const now = new Date();
        let snoozeHours = now.getHours();
        let snoozeMinutes = now.getMinutes() + 5;
        
        // Ajusta para o próximo horário válido
        if (snoozeMinutes >= 60) {
            snoozeMinutes -= 60;
            snoozeHours = (snoozeHours + 1) % 24;
        }
        
        // Cria um alarme temporário de soneca
        const snoozeAlarm = {
            id: Date.now(),
            hours: snoozeHours,
            minutes: snoozeMinutes,
            days: [], // Uma vez apenas
            label: `${alarm.label} (Soneca)`,
            soundId: alarm.soundId,
            enabled: true,
            vibrate: alarm.vibrate,
            isSnooze: true // Marca como alarme de soneca
        };
        
        // Adiciona o alarme de soneca
        alarms.push(snoozeAlarm);
        saveAlarmsToStorage();
        renderAlarms();
        
        // Mostra notificação
        showToast(`Soneca definida para ${padZero(snoozeHours)}:${padZero(snoozeMinutes)}`);
    }
    
    // Reproduz um som de alarme
    function playAlarmSound(url) {
        // Cria um elemento de áudio
        let alarmSound = document.getElementById('alarm-sound-player');
        
        // Se o elemento não existir, cria um novo
        if (!alarmSound) {
            alarmSound = document.createElement('audio');
            alarmSound.id = 'alarm-sound-player';
            alarmSound.loop = true;
            document.body.appendChild(alarmSound);
        }
        
        // Define a fonte e reproduz o som
        alarmSound.src = url;
        alarmSound.play().catch(error => {
            console.error('Erro ao reproduzir som de alarme:', error);
        });
    }
    
    // Para o som do alarme
    function stopAlarmSound() {
        const alarmSound = document.getElementById('alarm-sound-player');
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