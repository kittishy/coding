/**
 * Controle de temas do Relógio OneUI
 */

document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.querySelector('.theme-toggle');
    const moonIcon = document.querySelector('.fa-moon');
    const sunIcon = document.querySelector('.fa-sun');
    
    // Verifica se há um tema salvo no localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.className = savedTheme;
        updateIcons(savedTheme === 'dark-theme');
    }
    
    // Alterna entre os temas claro e escuro
    themeToggle.addEventListener('click', function() {
        const isDarkTheme = document.body.classList.contains('light-theme');
        
        if (isDarkTheme) {
            document.body.classList.replace('light-theme', 'dark-theme');
            localStorage.setItem('theme', 'dark-theme');
        } else {
            document.body.classList.replace('dark-theme', 'light-theme');
            localStorage.setItem('theme', 'light-theme');
        }
        
        updateIcons(!isDarkTheme);
    });
    
    // Atualiza os ícones do seletor de tema
    function updateIcons(isDarkTheme) {
        if (isDarkTheme) {
            moonIcon.classList.add('active');
            sunIcon.classList.remove('active');
        } else {
            moonIcon.classList.remove('active');
            sunIcon.classList.add('active');
        }
    }
});