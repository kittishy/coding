/**
 * Relógio macOS - Módulo Principal
 * Integra todas as funcionalidades e adiciona recursos extras
 */

// Configurações globais do aplicativo
const APP_CONFIG = {
    version: '1.0.0',
    name: 'Relógio macOS',
    animations: true,
    sounds: true,
    notifications: true,
    autoSave: true,
    // Adicione mais configurações conforme necessário
};

// Inicialização principal do aplicativo
function initApp() {
    console.log(`Inicializando ${APP_CONFIG.name} v${APP_CONFIG.version}`);
    
    // Carregar configurações salvas
    loadAppConfig();
    
    // Inicializar componentes da UI
    initUIComponents();
    
    // Inicializar todas as funcionalidades
    initAllFeatures();
    
    // Configurar eventos globais
    setupGlobalEvents();
    
    // Adicionar funcionalidades extras
    enhanceFeatures();
    
    // Mostrar notificação de boas-vindas
    if (APP_CONFIG.notifications) {
        showNotification(`Bem-vindo ao ${APP_CONFIG.name}`, 'Todas as funcionalidades estão prontas!');
    }
}

// Carregar configurações do localStorage
function loadAppConfig() {
    const savedConfig = localStorage.getItem('app-config');
    if (savedConfig) {
        try {
            const parsedConfig = JSON.parse(savedConfig);
            Object.assign(APP_CONFIG, parsedConfig);
            console.log('Configurações carregadas com sucesso');
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
        }
    }
}

// Salvar configurações no localStorage
function saveAppConfig() {
    if (APP_CONFIG.autoSave) {
        localStorage.setItem('app-config', JSON.stringify(APP_CONFIG));
        console.log('Configurações salvas com sucesso');
    }
}

// Inicializar componentes da UI
function initUIComponents() {
    // Tornar o container arrastável
    makeElementDraggable(document.getElementById('clock-container'));
    
    // Adicionar efeitos de glassmorphism
    applyGlassmorphism();
    
    // Configurar navegação entre views
    setupNavigation();
    
    // Configurar controles da barra de título
    setupTitleBarControls();
    
    // Adicionar animações de transição
    if (APP_CONFIG.animations) {
        document.body.classList.add('enable-animations');
    }
}

// Inicializar todas as funcionalidades
function initAllFeatures() {
    // Funcionalidades principais
    initClock();
    initStopwatch();
    initTimer();
    initAlarm();
    initPomodoro();
    initCalendar();
    initThemeSwitcher();
    
    // Tentar inicializar o clima se o módulo existir
    if (typeof initWeather === 'function') {
        initWeather();
    }
}

// Configurar eventos globais
function setupGlobalEvents() {
    // Atalhos de teclado globais
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Sincronizar dados entre abas
    window.addEventListener('storage', handleStorageChange);
    
    // Salvar estado ao fechar
    window.addEventListener('beforeunload', () => {
        saveAppConfig();
    });
    
    // Detectar modo offline/online
    window.addEventListener('online', () => {
        showNotification('Conexão restaurada', 'Você está online novamente');
    });
    
    window.addEventListener('offline', () => {
        showNotification('Sem conexão', 'Você está offline', 'warning');
    });
}

// Aplicar efeito de glassmorphism aos elementos
function applyGlassmorphism() {
    const container = document.querySelector('.container');
    container.classList.add('glassmorphism');
    
    // Adicionar efeito de brilho ao passar o mouse
    container.addEventListener('mousemove', (e) => {
        if (!APP_CONFIG.animations) return;
        
        const { left, top, width, height } = container.getBoundingClientRect();
        const x = (e.clientX - left) / width;
        const y = (e.clientY - top) / height;
        
        container.style.setProperty('--mouse-x', x.toFixed(2));
        container.style.setProperty('--mouse-y', y.toFixed(2));
    });
}

// Configurar navegação entre views
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.view');
    
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Desativar botão ativo anterior
            document.querySelector('.nav-btn.active').classList.remove('active');
            // Ativar botão clicado
            button.classList.add('active');
            
            // Esconder view ativa anterior
            const activeView = document.querySelector('.view.active');
            activeView.classList.remove('active');
            
            // Mostrar view correspondente com animação
            const viewId = button.getAttribute('data-view') + '-view';
            const targetView = document.getElementById(viewId);
            
            // Aplicar animação de transição
            if (APP_CONFIG.animations) {
                activeView.classList.add('fade-out');
                setTimeout(() => {
                    activeView.classList.remove('fade-out');
                    targetView.classList.add('active', 'fade-in');
                    setTimeout(() => {
                        targetView.classList.remove('fade-in');
                    }, 300);
                }, 300);
            } else {
                targetView.classList.add('active');
            }
            
            // Reproduzir som de navegação
            if (APP_CONFIG.sounds) {
                const clickSound = new Audio('assets/sounds/click.mp3');
                clickSound.volume = 0.5;
                clickSound.play();
            }
        });
    });
}

// Configurar controles da barra de título
function setupTitleBarControls() {
    const container = document.getElementById('clock-container');
    
    document.querySelector('.control.close').addEventListener('click', () => {
        // Em uma aplicação real, isso fecharia a app
        // Para fins de demo, vamos apenas esconder com animação
        container.classList.add('closing');
        setTimeout(() => {
            container.classList.add('minimized');
            container.classList.remove('closing');
        }, 300);
    });
    
    document.querySelector('.control.minimize').addEventListener('click', () => {
        container.classList.toggle('minimized');
    });
    
    document.querySelector('.control.maximize').addEventListener('click', () => {
        container.classList.toggle('maximized');
    });
}

// Tratar atalhos de teclado
function handleKeyboardShortcuts(e) {
    // Alt+1 até Alt+6 para navegar entre as views
    if (e.altKey && e.key >= '1' && e.key <= '6') {
        const index = parseInt(e.key) - 1;
        const navButtons = document.querySelectorAll('.nav-btn');
        if (navButtons[index]) {
            navButtons[index].click();
        }
    }
    
    // Ctrl+, para abrir configurações
    if (e.ctrlKey && e.key === ',') {
        openSettingsModal();
    }
    
    // Esc para fechar modais abertos
    if (e.key === 'Escape') {
        closeAllModals();
    }
}

// Tratar mudanças no localStorage (para sincronização entre abas)
function handleStorageChange(e) {
    if (e.key === 'app-config') {
        loadAppConfig();
    }
}

// Adicionar funcionalidades extras aos módulos existentes
function enhanceFeatures() {
    // Adicionar widget de clima ao relógio se o módulo existir
    if (typeof initWeather === 'function') {
        addWeatherWidget();
    }
    
    // Adicionar suporte a múltiplos fusos horários
    enhanceClockWithMultipleTimezones();
    
    // Adicionar estatísticas ao Pomodoro
    enhancePomodoroWithStats();
    
    // Adicionar integração de calendário com alarmes
    integrateCalendarWithAlarms();
    
    // Adicionar modo de foco
    addFocusMode();
}

// Adicionar widget de clima ao relógio
function addWeatherWidget() {
    const clockView = document.getElementById('clock-view');
    const clockOptions = clockView.querySelector('.clock-options');
    
    // Adicionar botão para mostrar/esconder widget de clima
    const weatherButton = document.createElement('button');
    weatherButton.className = 'option-btn';
    weatherButton.innerHTML = `
        <i class="fas fa-cloud-sun"></i>
        <span>Clima</span>
    `;
    
    weatherButton.addEventListener('click', () => {
        const weatherWidget = document.querySelector('.weather-widget');
        if (weatherWidget) {
            weatherWidget.classList.toggle('visible');
        }
    });
    
    clockOptions.appendChild(weatherButton);
}

// Adicionar suporte a múltiplos fusos horários
function enhanceClockWithMultipleTimezones() {
    const clockView = document.getElementById('clock-view');
    const clockDisplay = clockView.querySelector('.clock-display');
    
    // Criar container para fusos horários adicionais
    const additionalTimezones = document.createElement('div');
    additionalTimezones.className = 'additional-timezones';
    additionalTimezones.innerHTML = `
        <h3>Fusos Horários</h3>
        <div class="timezone-list" id="timezone-list">
            <!-- Fusos horários serão adicionados aqui -->
        </div>
        <button id="add-timezone" class="option-btn">
            <i class="fas fa-plus"></i>
            <span>Adicionar</span>
        </button>
    `;
    
    clockDisplay.after(additionalTimezones);
    
    // Implementar lógica para adicionar/remover fusos horários
    document.getElementById('add-timezone').addEventListener('click', () => {
        // Abrir modal de seleção de fuso horário
        const timezoneModal = document.getElementById('timezone-modal');
        if (timezoneModal) {
            openModal('timezone-modal');
        }
    });
}

// Adicionar estatísticas ao Pomodoro
function enhancePomodoroWithStats() {
    const pomodoroView = document.getElementById('pomodoro-view');
    const pomodoroDisplay = pomodoroView.querySelector('.pomodoro-display');
    
    // Criar container para estatísticas
    const pomodoroStats = document.createElement('div');
    pomodoroStats.className = 'pomodoro-stats';
    pomodoroStats.innerHTML = `
        <h3>Estatísticas</h3>
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-value" id="pomodoro-total-today">0</div>
                <div class="stat-label">Pomodoros Hoje</div>
            </div>
            <div class="stat-item">
                <div class="stat-value" id="pomodoro-total-week">0</div>
                <div class="stat-label">Pomodoros Semana</div>
            </div>
            <div class="stat-item">
                <div class="stat-value" id="pomodoro-streak">0</div>
                <div class="stat-label">Sequência</div>
            </div>
            <div class="stat-item">
                <div class="stat-value" id="pomodoro-focus-time">0h</div>
                <div class="stat-label">Tempo Focado</div>
            </div>
        </div>
    `;
    
    // Adicionar após os controles do pomodoro
    const pomodoroControls = pomodoroView.querySelector('.pomodoro-controls');
    pomodoroControls.after(pomodoroStats);
}

// Integrar calendário com alarmes
function integrateCalendarWithAlarms() {
    // Adicionar opção para criar alarme a partir de evento
    const eventsListElement = document.getElementById('events-list');
    if (!eventsListElement) return;
    
    // Observar mudanças na lista de eventos
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                // Adicionar botão de alarme a novos eventos
                const eventItems = eventsListElement.querySelectorAll('.event-item');
                eventItems.forEach((eventItem) => {
                    if (!eventItem.querySelector('.event-alarm-btn')) {
                        const eventActions = eventItem.querySelector('.event-actions');
                        if (eventActions) {
                            const alarmBtn = document.createElement('button');
                            alarmBtn.className = 'event-alarm-btn';
                            alarmBtn.innerHTML = '<i class="fas fa-bell"></i>';
                            alarmBtn.title = 'Criar alarme para este evento';
                            
                            alarmBtn.addEventListener('click', (e) => {
                                e.stopPropagation();
                                // Lógica para criar alarme a partir do evento
                                const eventTitle = eventItem.querySelector('.event-title').textContent;
                                const eventTime = eventItem.querySelector('.event-time').textContent;
                                
                                // Abrir modal de alarme com dados pré-preenchidos
                                createAlarmFromEvent(eventTitle, eventTime);
                            });
                            
                            eventActions.appendChild(alarmBtn);
                        }
                    }
                });
            }
        });
    });
    
    // Iniciar observação
    observer.observe(eventsListElement, { childList: true, subtree: true });
}

// Criar alarme a partir de evento do calendário
function createAlarmFromEvent(title, timeString) {
    // Implementar lógica para preencher o modal de alarme com os dados do evento
    const alarmModal = document.getElementById('alarm-modal');
    if (!alarmModal) return;
    
    // Preencher campos do modal
    document.getElementById('alarm-name').value = title;
    
    // Extrair hora e minuto do timeString (formato: HH:MM)
    const timeParts = timeString.split(':');
    if (timeParts.length === 2) {
        document.getElementById('alarm-hours').value = timeParts[0];
        document.getElementById('alarm-minutes').value = timeParts[1];
    }
    
    // Abrir modal
    openModal('alarm-modal');
}

// Adicionar modo de foco
function addFocusMode() {
    // Adicionar botão de modo de foco na barra de título
    const titlebarMenu = document.querySelector('.titlebar-menu');
    
    const focusModeButton = document.createElement('div');
    focusModeButton.className = 'focus-mode-toggle';
    focusModeButton.innerHTML = '<i class="fas fa-eye"></i>';
    focusModeButton.title = 'Modo de Foco';
    
    focusModeButton.addEventListener('click', toggleFocusMode);
    
    titlebarMenu.insertBefore(focusModeButton, titlebarMenu.firstChild);
}

// Alternar modo de foco
function toggleFocusMode() {
    const container = document.querySelector('.container');
    container.classList.toggle('focus-mode');
    
    const focusModeButton = document.querySelector('.focus-mode-toggle i');
    
    if (container.classList.contains('focus-mode')) {
        focusModeButton.className = 'fas fa-eye-slash';
        showNotification('Modo de Foco ativado', 'Interface simplificada para maior concentração');
    } else {
        focusModeButton.className = 'fas fa-eye';
        showNotification('Modo de Foco desativado', 'Interface completa restaurada');
    }
}

// Abrir modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // Adicionar classe para exibir o modal com animação
    modal.classList.add('active');
    
    // Reproduzir som de abertura
    if (APP_CONFIG.sounds) {
        const openSound = new Audio('assets/sounds/click.mp3');
        openSound.volume = 0.3;
        openSound.play();
    }
    
    // Focar no primeiro input do modal
    setTimeout(() => {
        const firstInput = modal.querySelector('input, select, textarea');
        if (firstInput) {
            firstInput.focus();
        }
    }, 300);
}

// Fechar modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // Remover classe para esconder o modal com animação
    modal.classList.remove('active');
    
    // Reproduzir som de fechamento
    if (APP_CONFIG.sounds) {
        const closeSound = new Audio('assets/sounds/click.mp3');
        closeSound.volume = 0.2;
        closeSound.play();
    }
}

// Fechar todos os modais abertos
function closeAllModals() {
    const activeModals = document.querySelectorAll('.modal.active');
    activeModals.forEach(modal => {
        modal.classList.remove('active');
    });
}

// Abrir modal de configurações
function openSettingsModal() {
    // Verificar se o modal já existe
    let settingsModal = document.getElementById('settings-modal');
    
    // Criar modal de configurações se não existir
    if (!settingsModal) {
        settingsModal = document.createElement('div');
        settingsModal.className = 'modal';
        settingsModal.id = 'settings-modal';
        
        settingsModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Configurações</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="setting-group">
                        <label for="setting-animations">Animações</label>
                        <input type="checkbox" id="setting-animations" ${APP_CONFIG.animations ? 'checked' : ''}>
                    </div>
                    <div class="setting-group">
                        <label for="setting-sounds">Sons</label>
                        <input type="checkbox" id="setting-sounds" ${APP_CONFIG.sounds ? 'checked' : ''}>
                    </div>
                    <div class="setting-group">
                        <label for="setting-notifications">Notificações</label>
                        <input type="checkbox" id="setting-notifications" ${APP_CONFIG.notifications ? 'checked' : ''}>
                    </div>
                    <div class="setting-group">
                        <label for="setting-autosave">Salvar automaticamente</label>
                        <input type="checkbox" id="setting-autosave" ${APP_CONFIG.autoSave ? 'checked' : ''}>
                    </div>
                    <div class="setting-group">
                        <button id="reset-settings" class="btn btn-secondary">Restaurar Padrões</button>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="save-settings" class="btn btn-primary">Salvar</button>
                    <button class="btn btn-secondary close-modal">Cancelar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(settingsModal);
        
        // Configurar eventos do modal
        settingsModal.querySelector('.close-modal').addEventListener('click', () => {
            closeModal('settings-modal');
        });
        
        settingsModal.querySelector('#save-settings').addEventListener('click', () => {
            // Salvar configurações
            APP_CONFIG.animations = document.getElementById('setting-animations').checked;
            APP_CONFIG.sounds = document.getElementById('setting-sounds').checked;
            APP_CONFIG.notifications = document.getElementById('setting-notifications').checked;
            APP_CONFIG.autoSave = document.getElementById('setting-autosave').checked;
            
            saveAppConfig();
            closeModal('settings-modal');
            
            // Aplicar configurações
            if (APP_CONFIG.animations) {
                document.body.classList.add('enable-animations');
            } else {
                document.body.classList.remove('enable-animations');
            }
            
            showNotification('Configurações salvas', 'Suas preferências foram atualizadas');
        });
        
        settingsModal.querySelector('#reset-settings').addEventListener('click', () => {
            // Restaurar configurações padrão
            APP_CONFIG.animations = true;
            APP_CONFIG.sounds = true;
            APP_CONFIG.notifications = true;
            APP_CONFIG.autoSave = true;
            
            // Atualizar checkboxes
            document.getElementById('setting-animations').checked = true;
            document.getElementById('setting-sounds').checked = true;
            document.getElementById('setting-notifications').checked = true;
            document.getElementById('setting-autosave').checked = true;
            
            showNotification('Configurações restauradas', 'Valores padrão aplicados');
        });
    }
    
    // Abrir modal
    openModal('settings-modal');
}

// Mostrar notificação personalizada
function showNotification(title, message, type = 'info') {
    if (!APP_CONFIG.notifications) return;
    
    const notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) return;
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${type === 'info' ? 'fa-info-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    notificationContainer.appendChild(notification);
    
    // Adicionar classe para animar entrada
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Configurar botão de fechar
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        notification.classList.add('hide');
        
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Reproduzir som de notificação
    if (APP_CONFIG.sounds) {
        const notificationSound = new Audio('assets/sounds/notification.mp3');
        notificationSound.volume = 0.4;
        notificationSound.play();
    }
    
    // Remover automaticamente após alguns segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            notification.classList.add('hide');
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Inicializar o aplicativo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initApp);