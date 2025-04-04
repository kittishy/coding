/**
 * Relógio macOS - Módulo de Alternância de Tema
 * Implementa a troca entre temas claro e escuro com persistência de preferências
 */

function initThemeSwitcher() {
    // Elementos do DOM
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    
    // Verificar se há um tema salvo no localStorage
    const savedTheme = localStorage.getItem('theme');
    
    // Verificar preferência do sistema para modo escuro
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Função para definir tema escuro
    function setDarkTheme() {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        themeIcon.className = 'fas fa-sun'; // Trocar para ícone de sol
        localStorage.setItem('theme', 'dark');
    }
    
    // Função para definir tema claro
    function setLightTheme() {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        themeIcon.className = 'fas fa-moon'; // Trocar para ícone de lua
        localStorage.setItem('theme', 'light');
    }
    
    // Inicializar tema baseado na preferência salva ou sistema
    function initTheme() {
        if (savedTheme === 'dark') {
            setDarkTheme();
        } else if (savedTheme === 'light') {
            setLightTheme();
        } else if (prefersDarkScheme.matches) {
            // Se não há tema salvo mas o sistema usa modo escuro
            setDarkTheme();
        } else {
            // Padrão é tema claro
            setLightTheme();
        }
    }
    
    // Alternar entre temas
    function toggleTheme() {
        if (body.classList.contains('dark-theme')) {
            setLightTheme();
            showNotification('Tema claro ativado');
        } else {
            setDarkTheme();
            showNotification('Tema escuro ativado');
        }
        
        // Reproduzir som de clique
        const clickSound = new Audio('assets/sounds/click.mp3');
        clickSound.play();
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
    themeToggle.addEventListener('click', toggleTheme);
    
    // Listener para mudanças na preferência do sistema
    prefersDarkScheme.addEventListener('change', (event) => {
        if (!localStorage.getItem('theme')) {
            // Apenas mudar automaticamente se o usuário não definiu um tema
            if (event.matches) {
                setDarkTheme();
            } else {
                setLightTheme();
            }
        }
    });
    
    // Atalho de teclado (Alt+T)
    document.addEventListener('keydown', (e) => {
        if (e.altKey && e.key === 't') {
            toggleTheme();
            e.preventDefault();
        }
    });
    
    // Inicializar tema
    initTheme();
    
    // Exportar funções para uso externo se necessário
    return {
        setDarkTheme,
        setLightTheme,
        toggleTheme
    };
}
