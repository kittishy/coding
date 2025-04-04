/**
 * Controle de Rotina para Dormir/Acordar (Bedtime)
 * Baseado no design Samsung OneUI
 */

document.addEventListener('DOMContentLoaded', function() {
    // Verifica se a seção de bedtime já existe, se não, cria
    let bedtimeSection = document.getElementById('bedtime-section');
    if (!bedtimeSection) {
        createBedtimeSection();
        addBedtimeNavButton();
    }
    
    // Carrega as configurações de bedtime do localStorage
    let bedtimeSettings = {
        enabled: false,
        bedtime: { hours: 23, minutes: 0 },
        wakeup: { hours: 7, minutes: 0 },
        days: [0, 1, 2, 3, 4, 5, 6], // Todos os dias por padrão
        sound: 'peaceful_mind',
        sleepHistory: [] // Histórico de sono
    };
    
    // Sons disponíveis para dormir
    const sleepSounds = [
        { id: 'peaceful_mind', name: 'Peaceful Mind', source: 'YouTube Music' },
        { id: 'rain', name: 'Chuva Relaxante', source: 'Sounds' },
        { id: 'ocean', name: 'Ondas do Oceano', source: 'Sounds' },
        { id: 'white_noise', name: 'Ruído Branco', source: 'Sounds' },
        { id: 'forest', name: 'Floresta Noturna', source: 'Sounds' }
    ];
    
    // Carrega as configurações do localStorage
    loadBedtimeSettings();
    
    // Função para carregar configurações do localStorage
    function loadBedtimeSettings() {
        try {
            const savedSettings = localStorage.getItem('bedtimeSettings');
            if (savedSettings) {
                bedtimeSettings = JSON.parse(savedSettings);
            }
            
            // Gera histórico de sono aleatório se não existir
            if (!bedtimeSettings.sleepHistory || bedtimeSettings.sleepHistory.length === 0) {
                generateRandomSleepHistory();
            }
        } catch (error) {
            console.error('Erro ao carregar configurações de bedtime:', error);
            generateRandomSleepHistory();
        }
    }
    
    // Função para salvar configurações no localStorage
    function saveBedtimeSettings() {
        localStorage.setItem('bedtimeSettings', JSON.stringify(bedtimeSettings));
    }
    
    // Gera histórico de sono aleatório para demonstração
    function generateRandomSleepHistory() {
        bedtimeSettings.sleepHistory = [];
        
        // Gera dados para os últimos 7 dias
        for (let i = 0; i < 7; i++) {
            // Horas de sono entre 5 e 9 horas
            const hoursSlept = 5 + Math.random() * 4;
            // Qualidade entre 60% e 100%
            const quality = Math.floor(60 + Math.random() * 40);
            
            bedtimeSettings.sleepHistory.push({
                date: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)),
                hoursSlept: hoursSlept,
                quality: quality
            });
        }
        
        saveBedtimeSettings();
    }
    
    // Cria a seção de bedtime
    function createBedtimeSection() {
        const main = document.querySelector('main');
        
        bedtimeSection = document.createElement('section');
        bedtimeSection.className = 'clock-section hidden';
        bedtimeSection.id = 'bedtime-section';
        
        bedtimeSection.innerHTML = `
            <div class="bedtime">
                <div class="bedtime-schedule">
                    <div class="bedtime-title">
                        <i class="fas fa-moon"></i> Schedule
                    </div>
                    <div class="bedtime-times">
                        <div class="bedtime-time">
                            <div class="bedtime-time-label">BEDTIME</div>
                            <div class="bedtime-time-value" id="bedtime-value">11:00<span>PM</span></div>
                        </div>
                        <div class="bedtime-time">
                            <div class="bedtime-time-label">WAKE UP</div>
                            <div class="bedtime-time-value" id="wakeup-value">7:00<span>AM</span></div>
                        </div>
                    </div>
                    <div class="bedtime-info" id="bedtime-info">
                        8 hours · Next alarm on Wednesday
                    </div>
                </div>
                
                <div class="bedtime-activity">
                    <div class="bedtime-activity-header">
                        <div class="bedtime-activity-title">Recent bedtime activity</div>
                        <div class="bedtime-activity-actions">
                            <i class="fas fa-ellipsis-v"></i>
                        </div>
                    </div>
                    <div class="bedtime-graph" id="bedtime-graph">
                        <!-- Gráfico de barras será gerado via JavaScript -->
                    </div>
                    <div class="bedtime-graph-labels">
                        <div>Time in phone</div>
                        <div>Time in bed</div>
                    </div>
                </div>
                
                <div class="bedtime-sounds">
                    <div class="bedtime-sounds-title">Sleep sounds</div>
                    <div class="bedtime-sound-item" id="current-sleep-sound">
                        <div class="bedtime-sound-icon">
                            <i class="fas fa-music"></i>
                        </div>
                        <div class="bedtime-sound-info">
                            <div class="bedtime-sound-name">Peaceful Mind</div>
                            <div class="bedtime-sound-source">YouTube Music · Album</div>
                        </div>
                        <div class="bedtime-sound-play">
                            <i class="fas fa-play-circle"></i>
                        </div>
                    </div>
                    <button class="choose-sound-btn" id="choose-sound-btn">Choose another sound</button>
                </div>
            </div>
        `;
        
        main.appendChild(bedtimeSection);
        
        // Inicializa o gráfico e os eventos
        initializeBedtimeUI();
        
        // Cria o modal para escolher sons
        createSoundModal();
    }
    
    // Adiciona botão de navegação para o bedtime
    function addBedtimeNavButton() {
        const nav = document.querySelector('.bottom-nav');
        const bedtimeBtn = document.createElement('button');
        bedtimeBtn.className = 'nav-btn';
        bedtimeBtn.dataset.section = 'bedtime-section';
        bedtimeBtn.innerHTML = `
            <i class="fas fa-bed"></i>
            <span>Bedtime</span>
        `;
        
        // Insere o botão antes do último item (alarmes)
        const alarmBtn = nav.querySelector('[data-section="alarm-section"]');
        nav.insertBefore(bedtimeBtn, alarmBtn);
        
        // Adiciona evento de clique
        bedtimeBtn.addEventListener('click', function() {
            // Remove a classe 'active' de todos os botões
            const navButtons = document.querySelectorAll('.nav-btn');
            navButtons.forEach(btn => btn.classList.remove('active'));
            
            // Adiciona a classe 'active' ao botão clicado
            this.classList.add('active');
            
            // Oculta todas as seções
            const clockSections = document.querySelectorAll('.clock-section');
            clockSections.forEach(section => {
                section.classList.add('hidden');
            });
            
            // Exibe a seção de bedtime
            document.getElementById('bedtime-section').classList.remove('hidden');
            
            // Salva a última seção visualizada no localStorage
            localStorage.setItem('lastSection', 'bedtime-section');
        });
    }
    
    // Inicializa a interface de bedtime
    function initializeBedtimeUI() {
        updateBedtimeDisplay();
        renderSleepGraph();
        updateCurrentSoundDisplay();
        
        // Adiciona eventos para os elementos
        const bedtimeValue = document.getElementById('bedtime-value');
        const wakeupValue = document.getElementById('wakeup-value');
        const chooseSound = document.getElementById('choose-sound-btn');
        const currentSound = document.getElementById('current-sleep-sound');
        
        // Evento para editar horário de dormir
        bedtimeValue.addEventListener('click', function() {
            openTimePickerModal('bedtime');
        });
        
        // Evento para editar horário de acordar
        wakeupValue.addEventListener('click', function() {
            openTimePickerModal('wakeup');
        });
        
        // Evento para escolher som
        chooseSound.addEventListener('click', function() {
            openSoundModal();
        });
        
        // Evento para reproduzir som atual
        const playButton = currentSound.querySelector('.bedtime-sound-play');
        playButton.addEventListener('click', function() {
            playBedtimeSound(bedtimeSettings.sound);
        });
    }
    
    // Atualiza a exibição dos horários de bedtime
    function updateBedtimeDisplay() {
        const bedtimeValue = document.getElementById('bedtime-value');
        const wakeupValue = document.getElementById('wakeup-value');
        const bedtimeInfo = document.getElementById('bedtime-info');
        
        // Formata os horários
        const bedtimeHours = bedtimeSettings.bedtime.hours;
        const bedtimeMinutes = bedtimeSettings.bedtime.minutes;
        const wakeupHours = bedtimeSettings.wakeup.hours;
        const wakeupMinutes = bedtimeSettings.wakeup.minutes;
        
        // Converte para formato 12h para exibição
        const bedtimeHours12 = bedtimeHours % 12 || 12;
        const wakeupHours12 = wakeupHours % 12 || 12;
        const bedtimePeriod = bedtimeHours >= 12 ? 'PM' : 'AM';
        const wakeupPeriod = wakeupHours >= 12 ? 'PM' : 'AM';
        
        bedtimeValue.innerHTML = `${bedtimeHours12}:${padZero(bedtimeMinutes)}<span>${bedtimePeriod}</span>`;
        wakeupValue.innerHTML = `${wakeupHours12}:${padZero(wakeupMinutes)}<span>${wakeupPeriod}</span>`;
        
        // Calcula a duração do sono
        let sleepHours = wakeupHours - bedtimeHours;
        let sleepMinutes = wakeupMinutes - bedtimeMinutes;
        
        if (sleepMinutes < 0) {
            sleepMinutes += 60;
            sleepHours -= 1;
        }
        
        if (sleepHours < 0) {
            sleepHours += 24;
        }
        
        // Encontra o próximo dia com alarme
        const now = new Date();
        const currentDay = now.getDay();
        let nextAlarmDay = -1;
        
        for (let i = 1; i <= 7; i++) {
            const checkDay = (currentDay + i) % 7;
            if (bedtimeSettings.days.includes(checkDay)) {
                nextAlarmDay = checkDay;
                break;
            }
        }
        
        // Nomes dos dias da semana
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const nextAlarmDayName = nextAlarmDay !== -1 ? weekdays[nextAlarmDay] : 'None';
        
        // Atualiza a informação de duração do sono
        bedtimeInfo.textContent = `${sleepHours} hours · Next alarm on ${nextAlarmDayName}`;
    }
    
    // Renderiza o gráfico de sono
    function renderSleepGraph() {
        const graphContainer = document.getElementById('bedtime-graph');
        graphContainer.innerHTML = '';
        
        // Ordena o histórico por data (mais recente primeiro)
        const sortedHistory = [...bedtimeSettings.sleepHistory].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        }).slice(0, 7); // Pega os últimos 7 dias
        
        // Encontra o valor máximo para normalizar as barras
        const maxHours = Math.max(...sortedHistory.map(day => day.hoursSlept), 8);
        
        // Largura de cada barra
        const barWidth = 100 / (sortedHistory.length * 2); // Espaço para barras e espaços
        
        // Adiciona as barras ao gráfico
        sortedHistory.forEach((day, index) => {
            // Altura normalizada (porcentagem da altura máxima)
            const heightPercent = (day.hoursSlept / maxHours) * 100;
            
            // Cria a barra
            const bar = document.createElement('div');
            bar.className = 'bedtime-graph-bar';
            bar.style.height = `${heightPercent}%`;
            bar.style.left = `${index * barWidth * 2 + barWidth/2}%`; // Posiciona com espaço entre barras
            bar.style.width = `${barWidth}%`;
            
            // Cor baseada na qualidade do sono
            if (day.quality >= 80) {
                bar.style.backgroundColor = 'var(--oneui-success)';
            } else if (day.quality >= 60) {
                bar.style.backgroundColor = 'var(--oneui-primary)';
            } else {
                bar.style.backgroundColor = 'var(--oneui-warning)';
            }
            
            // Adiciona tooltip com informações
            const date = new Date(day.date);
            const dateStr = date.toLocaleDateString();
            bar.title = `${dateStr}: ${day.hoursSlept.toFixed(1)} horas, ${day.quality}% qualidade`;
            
            graphContainer.appendChild(bar);
        });
    }
    
    // Atualiza a exibição do som atual
    function updateCurrentSoundDisplay() {
        const currentSoundElement = document.getElementById('current-sleep-sound');
        const soundNameElement = currentSoundElement.querySelector('.bedtime-sound-name');
        const soundSourceElement = currentSoundElement.querySelector('.bedtime-sound-source');
        
        // Encontra o som atual
        const currentSound = sleepSounds.find(sound => sound.id === bedtimeSettings.sound) || sleepSounds[0];
        
        // Atualiza a interface
        soundNameElement.textContent = currentSound.name;
        soundSourceElement.textContent = `${currentSound.source}`;
    }
    
    // Cria o modal para escolher sons
    function createSoundModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'sound-modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Choose Sleep Sound</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="sound-list">
                        ${sleepSounds.map(sound => `
                            <div class="sound-item" data-sound-id="${sound.id}">
                                <div class="sound-item-info">
                                    <div class="sound-item-name">${sound.name}</div>
                                    <div class="sound-item-source">${sound.source}</div>
                                </div>
                                <div class="sound-item-actions">
                                    <button class="play-sound-btn"><i class="fas fa-play"></i></button>
                                    <button class="select-sound-btn"><i class="fas fa-check"></i></button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Adiciona eventos para o modal
        const closeModalBtn = modal.querySelector('.close-modal');
        closeModalBtn.addEventListener('click', closeSoundModal);
        
        // Adiciona eventos para os itens de som
        const soundItems = modal.querySelectorAll('.sound-item');
        soundItems.forEach(item => {
            const soundId = item.dataset.soundId;
            
            // Destaca o som atual
            if (soundId === bedtimeSettings.sound) {
                item.classList.add('selected');
            }
            
            // Botão de reproduzir
            const playBtn = item.querySelector('.play-sound-btn');
            playBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                playBedtimeSound(soundId);
            });
            
            // Botão de selecionar
            const selectBtn = item.querySelector('.select-sound-btn');
            selectBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                selectBedtimeSound(soundId);
            });
            
            // Clique no item também seleciona
            item.addEventListener('click', function() {
                selectBedtimeSound(soundId);
            });
        });
        
        // Fecha o modal ao clicar fora dele
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeSoundModal();
            }
        });
    }
    
    // Abre o modal para escolher som
    function openSoundModal() {
        const modal = document.getElementById('sound-modal');
        modal.style.display = 'block';
        modal.classList.add('show');
    }
    
    // Fecha o modal de sons
    function closeSoundModal() {
        const modal = document.getElementById('sound-modal');
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300); // Tempo da animação
    }
    
    // Seleciona um som de bedtime
    function selectBedtimeSound(soundId) {
        // Atualiza a configuração
        bedtimeSettings.sound = soundId;
        saveBedtimeSettings();
        
        // Atualiza a interface
        updateCurrentSoundDisplay();
        
        // Destaca o som selecionado no modal
        const soundItems = document.querySelectorAll('.sound-item');
        soundItems.forEach(item => {
            item.classList.toggle('selected', item.dataset.soundId === soundId);
        });
        
        // Fecha o modal
        closeSoundModal();
        
        // Mostra notificação
        showToast('Som de dormir atualizado');
    }
    
    // Reproduz um som de bedtime
    function playBedtimeSound(soundId) {
        // Encontra o som
        const sound = sleepSounds.find(s => s.id === soundId);
        if (!sound) return;
        
        // URLs de exemplo para os sons (em uma aplicação real, seriam arquivos locais)
        const soundUrls = {
            'peaceful_mind': 'https://assets.mixkit.co/sfx/preview/mixkit-forest-birds-ambience-1210.mp3',
            'rain': 'https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-2393.mp3',
            'ocean': 'https://assets.mixkit.co/sfx/preview/mixkit-sea-waves-loop-1196.mp3',
            'white_noise': 'https://assets.mixkit.co/sfx/preview/mixkit-static-electric-buzz-1168.mp3',
            'forest': 'https://assets.mixkit.co/sfx/preview/mixkit-night-forest-with-insects-2414.mp3'
        };
        
        // Cria ou obtém o elemento de áudio
        let audioPlayer = document.getElementById('bedtime-sound-player');
        if (!audioPlayer) {
            audioPlayer = document.createElement('audio');
            audioPlayer.id = 'bedtime-sound-player';
            document.body.appendChild(audioPlayer);
        }
        
        // Se já estiver tocando, para
        if (!audioPlayer.paused) {
            audioPlayer.pause();
            audioPlayer.currentTime = 0;
            return;
        }
        
        // Define a fonte e reproduz
        audioPlayer.src = soundUrls[soundId] || soundUrls.peaceful_mind;
        audioPlayer.loop = true;
        audioPlayer.volume = 0.5;
        audioPlayer.play().catch(error => {
            console.error('Erro ao reproduzir som:', error);
        });
        
        // Para o som após 10 segundos (apenas para demonstração)
        setTimeout(() => {
            if (audioPlayer && !audioPlayer.paused) {
                audioPlayer.pause();
                audioPlayer.currentTime = 0;
            }
        }, 10000);
    }
    
    // Abre o modal para escolher horário
    function openTimePickerModal(type) {
        // Cria o modal se não existir
        let timeModal = document.getElementById('time-picker-modal');
        if (!timeModal) {
            timeModal = document.createElement('div');
            timeModal.className = 'modal';
            timeModal.id = 'time-picker-modal';
            
            timeModal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="time-picker-title">Set Time</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="time-picker">
                            <input type="number" id="time-picker-hours" min="0" max="23" value="0">
                            <span>:</span>
                            <input type="number" id="time-picker-minutes" min="0" max="59" value="0">
                        </div>
                        <div class="days-selector">
                            <button class="day-btn" data-day="0">D</button>
                            <button class="day-btn" data-day="1">S</button>
                            <button class="day-btn" data-day="2">T</button>
                            <button class="day-btn" data-day="3">Q</button>
                            <button class="day-btn" data-day="4">Q</button>
                            <button class="day-btn" data-day="5">S</button>
                            <button class="day-btn" data-day="6">S</button>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="save-time">Salvar</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(timeModal);
            
            // Adiciona eventos para o modal
            const closeModalBtn = timeModal.querySelector('.close-modal');
            closeModalBtn.addEventListener('click', closeTimePickerModal);
            
            // Adiciona eventos para os botões de dia
            const dayButtons = timeModal.querySelectorAll('.day-btn');
            dayButtons.forEach(button => {
                button.addEventListener('click', function() {
                    this.classList.toggle('active');
                });
            });
            
            // Fecha o modal ao clicar fora dele
            window.addEventListener('click', function(event) {
                if (event.target === timeModal) {
                    closeTimePickerModal();
                }
            });
        }
        
        // Configura o modal para o tipo específico (bedtime ou wakeup)
        const title = timeModal.querySelector('#time-picker-title');
        const hoursInput = timeModal.querySelector('#time-picker-hours');
        const minutesInput = timeModal.querySelector('#time-picker-minutes');
        const saveBtn = timeModal.querySelector('.save-time');
        const dayButtons = timeModal.querySelectorAll('.day-btn');
        
        // Define o título e valores iniciais
        if (type === 'bedtime') {
            title.textContent = 'Set Bedtime';
            hoursInput.value = bedtimeSettings.bedtime.hours;
            minutesInput.value = bedtimeSettings.bedtime.minutes;
        } else {
            title.textContent = 'Set Wake Up Time';
            hoursInput.value = bedtimeSettings.wakeup.hours;
            minutesInput.value = bedtimeSettings.wakeup.minutes;
        }
        
        // Seleciona os dias ativos
        dayButtons.forEach(button => {
            const day = parseInt(button.dataset.day);
            button.classList.toggle('active', bedtimeSettings.days.includes(day));
        });
        
        // Remove evento anterior e adiciona novo
        saveBtn.removeEventListener('click', saveTimeHandler);
        saveBtn.addEventListener('click', saveTimeHandler);
        
        // Função para salvar o horário
        function saveTimeHandler() {
            const hours = parseInt(hoursInput.value);
            const minutes = parseInt(minutesInput.value);
            
            // Obtém os dias selecionados
            const days = [];
            dayButtons.forEach(button => {
                if (button.classList.contains('active')) {
                    days.push(parseInt(button.dataset.day));
                }
            });
            
            // Atualiza as configurações
            if (type === 'bedtime') {
                bedtimeSettings.bedtime = { hours, minutes };
            } else {
                bedtimeSettings.wakeup = { hours, minutes };
            }
            
            bedtimeSettings.days = days;
            saveBedtimeSettings();
            
            // Atualiza a interface
            updateBedtimeDisplay();
            
            // Fecha o modal
            closeTimePickerModal();
            
            // Mostra notificação
            const timeType = type === 'bedtime' ? 'dormir' : 'acordar';
            showToast(`Horário de ${timeType} atualizado`);
        }
        
        // Exibe o modal
        timeModal.style.display = 'block';
        timeModal.classList.add('show');
    }
    
    // Fecha o modal de escolha de horário
    function closeTimePickerModal() {
        const modal = document.getElementById('time-picker-modal');
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300); // Tempo da animação
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
    
    // Adiciona zero à esquerda para números menores que 10
    function padZero(num) {
        return num < 10 ? `0${num}` : num;
    }
});