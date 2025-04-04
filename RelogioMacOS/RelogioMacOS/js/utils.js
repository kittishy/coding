/**
 * Relógio macOS - Módulo de Utilidades
 * Implementa funções utilitárias usadas por múltiplos componentes
 */

/**
 * Torna um elemento arrastável (drag and drop)
 * @param {HTMLElement} element - O elemento a ser tornado arrastável
 */
function makeElementDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    // Elemento que serve como "alça" para arrastar (a barra de título)
    const dragHandle = element.querySelector('.titlebar');
    
    if (dragHandle) {
        dragHandle.onmousedown = dragMouseDown;
    } else {
        // Se não houver barra de título, o elemento inteiro pode ser arrastado
        element.onmousedown = dragMouseDown;
    }
    
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        
        // Não iniciar arrasto se clicar nos controles (fechar, minimizar, maximizar)
        if (e.target.closest('.titlebar-controls') || 
            e.target.closest('.theme-toggle') ||
            e.target.closest('.close-modal')) {
            return;
        }
        
        // Obter posição inicial do mouse
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // Quando o mouse se move durante o arrasto
        document.onmousemove = elementDrag;
        // Quando o botão do mouse é solto
        document.onmouseup = closeDragElement;
    }
    
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        
        // Calcular nova posição
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // Não arrastar além dos limites da tela
        const newTop = element.offsetTop - pos2;
        const newLeft = element.offsetLeft - pos1;
        
        const maxTop = window.innerHeight - element.offsetHeight;
        const maxLeft = window.innerWidth - element.offsetWidth;
        
        // Definir nova posição do elemento
        element.style.top = Math.max(0, Math.min(newTop, maxTop)) + "px";
        element.style.left = Math.max(0, Math.min(newLeft, maxLeft)) + "px";
        
        // Garantir que o elemento seja posicionado absolutamente
        if (element.style.position !== 'absolute' && element.style.position !== 'fixed') {
            element.style.position = 'absolute';
        }
    }
    
    function closeDragElement() {
        // Parar de mover quando o mouse for solto
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

/**
 * Formata uma data para o formato localizado
 * @param {Date} date - A data a ser formatada
 * @param {string} locale - O locale a ser usado (padrão: pt-BR)
 * @param {Object} options - Opções de formatação
 * @returns {string} Data formatada
 */
function formatDate(date, locale = 'pt-BR', options = {}) {
    const defaultOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    return date.toLocaleDateString(locale, mergedOptions);
}

/**
 * Formata uma hora no formato HH:MM:SS
 * @param {number} hours - Horas (0-23)
 * @param {number} minutes - Minutos (0-59)
 * @param {number} seconds - Segundos (0-59)
 * @param {boolean} use24HourFormat - Se deve usar formato 24h (true) ou 12h (false)
 * @returns {string} Hora formatada
 */
function formatTime(hours, minutes, seconds, use24HourFormat = true) {
    if (use24HourFormat) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${period}`;
    }
}

/**
 * Reproduz um som
 * @param {string} soundFile - Caminho para o arquivo de som
 * @param {Object} options - Opções de reprodução (loop, volume)
 * @returns {HTMLAudioElement} O elemento de áudio criado
 */
function playSound(soundFile, options = {}) {
    const audio = new Audio(soundFile);
    
    if (options.loop !== undefined) {
        audio.loop = options.loop;
    }
    
    if (options.volume !== undefined) {
        audio.volume = options.volume;
    }
    
    audio.play().catch(error => {
        console.warn('Não foi possível reproduzir o som:', error);
    });
    
    return audio;
}

/**
 * Mostra uma notificação na interface
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo de notificação (info, success, warning, error)
 * @param {number} duration - Duração em ms (padrão: 3000ms)
 */
function showNotification(message, type = 'info', duration = 3000) {
    const notificationContainer = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notificationContainer.appendChild(notification);
    
    // Adicionar som com base no tipo de notificação
    let soundFile;
    switch (type) {
        case 'success':
            soundFile = 'assets/sounds/notification.mp3';
            break;
        case 'warning':
        case 'error':
            soundFile = 'assets/sounds/alarm.mp3';
            break;
        default:
            soundFile = 'assets/sounds/click.mp3';
    }
    
    playSound(soundFile, { volume: 0.5 });
    
    // Remover notificação após o tempo especificado
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);
}

/**
 * Tenta mostrar uma notificação do sistema
 * @param {string} title - Título da notificação
 * @param {string} body - Corpo da notificação
 * @param {string} icon - Ícone a ser exibido (URL)
 * @returns {Promise<boolean>} Indica se a notificação foi exibida
 */
async function showSystemNotification(title, body, icon) {
    // Verificar se o navegador suporta notificações
    if (!('Notification' in window)) {
        return false;
    }
    
    // Verificar se já temos permissão
    if (Notification.permission === 'granted') {
        const notification = new Notification(title, { body, icon });
        return true;
    } 
    
    // Solicitar permissão se ainda não foi negada
    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const notification = new Notification(title, { body, icon });
            return true;
        }
    }
    
    return false;
}

/**
 * Salva dados no localStorage com tratamento de erros
 * @param {string} key - Chave para o armazenamento
 * @param {any} value - Valor a ser armazenado (será convertido para JSON)
 * @returns {boolean} Indica se a operação foi bem-sucedida
 */
function saveToLocalStorage(key, value) {
    try {
        const serializedValue = JSON.stringify(value);
        localStorage.setItem(key, serializedValue);
        return true;
    } catch (error) {
        console.error('Erro ao salvar no localStorage:', error);
        return false;
    }
}

/**
 * Carrega dados do localStorage com tratamento de erros
 * @param {string} key - Chave para buscar do armazenamento
 * @param {any} defaultValue - Valor padrão caso a chave não exista
 * @returns {any} O valor carregado ou o valor padrão
 */
function loadFromLocalStorage(key, defaultValue = null) {
    try {
        const serializedValue = localStorage.getItem(key);
        if (serializedValue === null) {
            return defaultValue;
        }
        return JSON.parse(serializedValue);
    } catch (error) {
        console.error('Erro ao carregar do localStorage:', error);
        return defaultValue;
    }
}

/**
 * Obtém uma lista de fusos horários disponíveis
 * @returns {string[]} Lista de fusos horários
 */
function getAvailableTimezones() {
    // Se Intl.supportedValuesOf estiver disponível (browsers modernos)
    if (typeof Intl !== 'undefined' && Intl.supportedValuesOf) {
        try {
            return Intl.supportedValuesOf('timeZone');
        } catch (e) {
            console.warn('Intl.supportedValuesOf não suportado, usando lista padrão', e);
        }
    }
    
    // Lista padrão de fusos horários comuns
    return [
        'America/Sao_Paulo',
        'America/New_York',
        'America/Chicago',
        'America/Denver',
        'America/Los_Angeles',
        'Europe/London',
        'Europe/Paris',
        'Europe/Berlin',
        'Asia/Tokyo',
        'Asia/Shanghai',
        'Australia/Sydney',
        'Pacific/Auckland'
    ];
}

/**
 * Detecta o tema do sistema (claro ou escuro)
 * @returns {string} 'dark' ou 'light'
 */
function detectSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}

/**
 * Gera um ID único
 * @returns {string} ID único
 */
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
/**
 * Gera uma cor aleatória
 * @returns {string} Cor em hexadecimal
 */
function generateRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}