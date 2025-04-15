document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const themeButton = document.getElementById('theme-toggle');
    const languageSelect = document.getElementById('language-select');
    const loginContainer = document.querySelector('.login-container');

    // Fade-in Animation
    loginContainer.style.opacity = 0;
    loginContainer.style.transition = 'opacity 0.5s ease-in-out';
    setTimeout(() => {
        loginContainer.style.opacity = 1;
    }, 100);

    // Theme Change
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        body.classList.add(currentTheme);
    }

    themeButton.addEventListener('click', () => {
        body.classList.toggle('dark-theme');
        const newTheme = body.classList.contains('dark-theme') ? 'dark-theme' : '';
        localStorage.setItem('theme', newTheme);
    });

    // Language Change
    const translations = {
        'pt': {
            'welcome': 'Bem-vindo ao Jogo da Forca',
            'username': 'Nome de Usuário',
            'password': 'Senha',
            'login': 'Entrar',
            'createAccount': 'Criar Conta'
        },
        'en': {
            'welcome': 'Welcome to the Hangman Game',
            'username': 'Username',
            'password': 'Password',
            'login': 'Login',
            'createAccount': 'Create Account'
        },
        'es': {
            'welcome': 'Bienvenido al Juego del Ahorcado',
            'username': 'Nombre de Usuario',
            'password': 'Contraseña',
            'login': 'Iniciar Sesión',
            'createAccount': 'Crear Cuenta'
        },
        'fr': {
            'welcome': 'Bienvenue dans le Jeu du Pendu',
            'username': 'Nom d\'utilisateur',
            'password': 'Mot de passe',
            'login': 'Se Connecter',
            'createAccount': 'Créer un Compte'
        }
    };

    function updateTexts(lang) {
        document.getElementById('page-title').textContent = translations[lang]['welcome'];
        document.querySelector('label[for="username"]').textContent = translations[lang]['username'];
        document.querySelector('label[for="password"]').textContent = translations[lang]['password'];
        document.getElementById('login-button').textContent = translations[lang]['login'];
        document.getElementById('create-account').textContent = translations[lang]['createAccount'];
    }

    languageSelect.addEventListener('change', (event) => {
        const lang = event.target.value;
        updateTexts(lang);
        localStorage.setItem('lang', lang);
    });
        
    const currentLang = localStorage.getItem('lang');
    if(currentLang){
        languageSelect.value = currentLang;
        updateTexts(currentLang);
    } else{
        updateTexts('en');
    }
});