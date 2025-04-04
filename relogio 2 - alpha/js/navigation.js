/**
 * Controle de Navegação entre as Seções do Relógio
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elementos de navegação
    const navButtons = document.querySelectorAll('.nav-btn');
    const clockSections = document.querySelectorAll('.clock-section');
    
    // Oculta o relógio analógico permanentemente
    const analogClock = document.getElementById('analog-clock-section');
    if (analogClock) {
        analogClock.style.display = 'none';
        analogClock.classList.add('hidden');
    }
    
    // Adiciona eventos para os botões de navegação
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove a classe 'active' de todos os botões
            navButtons.forEach(btn => btn.classList.remove('active'));
            
            // Adiciona a classe 'active' ao botão clicado
            this.classList.add('active');
            
            // Obtém o ID da seção a ser exibida
            const sectionId = this.dataset.section;
            
            // Se o botão clicado é para o relógio analógico, mostra o digital em vez disso
            if (sectionId === 'analog-clock-section') {
                // Oculta todas as seções
                clockSections.forEach(section => {
                    section.classList.add('hidden');
                });
                // Mostra o relógio digital
                document.getElementById('digital-clock-section').classList.remove('hidden');
                // Salva a seção digital no localStorage
                localStorage.setItem('lastSection', 'digital-clock-section');
                return;
            }
            
            // Oculta todas as seções
            clockSections.forEach(section => {
                section.classList.add('hidden');
            });
            
            // Exibe a seção selecionada
            document.getElementById(sectionId).classList.remove('hidden');
            
            // Salva a última seção visualizada no localStorage
            localStorage.setItem('lastSection', sectionId);
        });
    });
    
    // Carrega a última seção visualizada (se houver)
    const lastSection = localStorage.getItem('lastSection');
    if (lastSection) {
        // Encontra o botão correspondente à última seção
        const lastSectionButton = document.querySelector(`.nav-btn[data-section="${lastSection}"]`);
        
        // Se o botão existir, simula um clique nele
        if (lastSectionButton) {
            lastSectionButton.click();
        }
    }
    
    // Adiciona eventos para o modal de alarme
    const alarmModal = document.getElementById('alarm-modal');
    
    // Fecha o modal ao clicar fora dele
    window.addEventListener('click', function(event) {
        if (event.target === alarmModal) {
            alarmModal.classList.remove('show');
        }
    });
    
    // Impede que cliques dentro do modal fechem o modal
    const modalContent = document.querySelector('.modal-content');
    modalContent.addEventListener('click', function(event) {
        event.stopPropagation();
    });
});