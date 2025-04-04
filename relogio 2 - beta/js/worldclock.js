/**
 * Controle de Relógio Mundial
 * Baseado no design Samsung OneUI
 */

document.addEventListener('DOMContentLoaded', function() {
    // Verifica se a seção de relógio mundial já existe, se não, cria
    let worldClockSection = document.getElementById('worldclock-section');
    if (!worldClockSection) {
        createWorldClockSection();
        addWorldClockNavButton();
    }
    
    // Array para armazenar os fusos horários adicionados
    let worldClocks = [];
    
    // Carrega os fusos horários do localStorage
    loadWorldClocksFromStorage();
    
    // Renderiza os fusos horários e inicia a atualização
    renderWorldClocks();
    setInterval(updateWorldClocks, 1000);
    
    // Função para carregar fusos horários do localStorage
    function loadWorldClocksFromStorage() {
        try {
            const savedClocks = localStorage.getItem('worldClocks');
            if (savedClocks) {
                worldClocks = JSON.parse(savedClocks);
            } else {
                // Adiciona alguns fusos horários padrão se não houver nenhum salvo
                worldClocks = [
                    { id: 1, city: 'Londres', timezone: 'Europe/London', offset: 0 },
                    { id: 2, city: 'Nova York', timezone: 'America/New_York', offset: -5 },
                    { id: 3, city: 'Tóquio', timezone: 'Asia/Tokyo', offset: 9 }
                ];
                saveWorldClocksToStorage();
            }
        } catch (error) {
            console.error('Erro ao carregar fusos horários:', error);
            worldClocks = [];
        }
    }
    
    // Função para salvar fusos horários no localStorage
    function saveWorldClocksToStorage() {
        localStorage.setItem('worldClocks', JSON.stringify(worldClocks));
    }
    
    // Cria a seção de relógio mundial
    function createWorldClockSection() {
        const main = document.querySelector('main');
        
        worldClockSection = document.createElement('section');
        worldClockSection.className = 'clock-section hidden';
        worldClockSection.id = 'worldclock-section';
        
        worldClockSection.innerHTML = `
            <div class="worldclock">
                <h2>Horários Mundiais</h2>
                <div class="worldclock-list"></div>
                <div class="no-worldclocks">Nenhum fuso horário adicionado</div>
                <button class="add-worldclock-btn">
                    <i class="fas fa-plus"></i> Adicionar Cidade
                </button>
            </div>
        `;
        
        main.appendChild(worldClockSection);
        
        // Adiciona evento para o botão de adicionar cidade
        const addWorldClockBtn = worldClockSection.querySelector('.add-worldclock-btn');
        addWorldClockBtn.addEventListener('click', openWorldClockModal);
        
        // Cria o modal para adicionar cidades
        createWorldClockModal();
    }
    
    // Adiciona botão de navegação para o relógio mundial
    function addWorldClockNavButton() {
        const nav = document.querySelector('.bottom-nav');
        const worldClockBtn = document.createElement('button');
        worldClockBtn.className = 'nav-btn';
        worldClockBtn.dataset.section = 'worldclock-section';
        worldClockBtn.innerHTML = `
            <i class="fas fa-globe"></i>
            <span>Mundial</span>
        `;
        
        // Insere o botão antes do último item (alarmes)
        const alarmBtn = nav.querySelector('[data-section="alarm-section"]');
        nav.insertBefore(worldClockBtn, alarmBtn);
        
        // Adiciona evento de clique
        worldClockBtn.addEventListener('click', function() {
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
            
            // Exibe a seção de relógio mundial
            document.getElementById('worldclock-section').classList.remove('hidden');
            
            // Salva a última seção visualizada no localStorage
            localStorage.setItem('lastSection', 'worldclock-section');
        });
    }
    
    // Cria o modal para adicionar cidades
    function createWorldClockModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'worldclock-modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Adicionar Cidade</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="city-search">
                        <input type="text" id="city-search" placeholder="Pesquisar cidade...">
                    </div>
                    <div class="city-list">
                        <div class="city-item" data-city="Londres" data-timezone="Europe/London" data-offset="0">
                            <span class="city-name">Londres</span>
                            <span class="city-time">GMT+0</span>
                        </div>
                        <div class="city-item" data-city="Nova York" data-timezone="America/New_York" data-offset="-5">
                            <span class="city-name">Nova York</span>
                            <span class="city-time">GMT-5</span>
                        </div>
                        <div class="city-item" data-city="Tóquio" data-timezone="Asia/Tokyo" data-offset="9">
                            <span class="city-name">Tóquio</span>
                            <span class="city-time">GMT+9</span>
                        </div>
                        <div class="city-item" data-city="Paris" data-timezone="Europe/Paris" data-offset="1">
                            <span class="city-name">Paris</span>
                            <span class="city-time">GMT+1</span>
                        </div>
                        <div class="city-item" data-city="Sydney" data-timezone="Australia/Sydney" data-offset="10">
                            <span class="city-name">Sydney</span>
                            <span class="city-time">GMT+10</span>
                        </div>
                        <div class="city-item" data-city="Rio de Janeiro" data-timezone="America/Sao_Paulo" data-offset="-3">
                            <span class="city-name">Rio de Janeiro</span>
                            <span class="city-time">GMT-3</span>
                        </div>
                        <div class="city-item" data-city="Dubai" data-timezone="Asia/Dubai" data-offset="4">
                            <span class="city-name">Dubai</span>
                            <span class="city-time">GMT+4</span>
                        </div>
                        <div class="city-item" data-city="Los Angeles" data-timezone="America/Los_Angeles" data-offset="-8">
                            <span class="city-name">Los Angeles</span>
                            <span class="city-time">GMT-8</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Adiciona eventos para o modal
        const closeModalBtn = modal.querySelector('.close-modal');
        closeModalBtn.addEventListener('click', closeWorldClockModal);
        
        // Adiciona evento para pesquisa de cidades
        const citySearchInput = modal.querySelector('#city-search');
        citySearchInput.addEventListener('input', filterCities);
        
        // Adiciona evento para seleção de cidades
        const cityItems = modal.querySelectorAll('.city-item');
        cityItems.forEach(item => {
            item.addEventListener('click', function() {
                addWorldClock(this.dataset.city, this.dataset.timezone, parseInt(this.dataset.offset));
                closeWorldClockModal();
            });
        });
        
        // Fecha o modal ao clicar fora dele
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeWorldClockModal();
            }
        });
    }
    
    // Abre o modal para adicionar cidade
    function openWorldClockModal() {
        const modal = document.getElementById('worldclock-modal');
        modal.style.display = 'block';
        modal.classList.add('show');
        
        // Limpa a pesquisa
        const citySearchInput = modal.querySelector('#city-search');
        citySearchInput.value = '';
        
        // Mostra todas as cidades
        const cityItems = modal.querySelectorAll('.city-item');
        cityItems.forEach(item => {
            item.style.display = 'flex';
        });
    }
    
    // Fecha o modal
    function closeWorldClockModal() {
        const modal = document.getElementById('worldclock-modal');
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300); // Tempo da animação
    }
    
    // Filtra as cidades com base na pesquisa
    function filterCities() {
        const searchText = this.value.toLowerCase();
        const cityItems = document.querySelectorAll('.city-item');
        
        cityItems.forEach(item => {
            const cityName = item.querySelector('.city-name').textContent.toLowerCase();
            if (cityName.includes(searchText)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    // Adiciona um novo fuso horário
    function addWorldClock(city, timezone, offset) {
        // Verifica se a cidade já existe
        const exists = worldClocks.some(clock => clock.city === city);
        if (exists) {
            alert('Esta cidade já foi adicionada!');
            return;
        }
        
        // Cria um novo fuso horário
        const newClock = {
            id: Date.now(),
            city,
            timezone,
            offset
        };
        
        // Adiciona à lista
        worldClocks.push(newClock);
        
        // Salva no localStorage
        saveWorldClocksToStorage();
        
        // Atualiza a interface
        renderWorldClocks();
    }
    
    // Renderiza os fusos horários
    function renderWorldClocks() {
        const worldClockList = document.querySelector('.worldclock-list');
        const noWorldClocksMessage = document.querySelector('.no-worldclocks');
        
        // Limpa a lista atual
        worldClockList.innerHTML = '';
        
        // Exibe a mensagem de "nenhum fuso horário" se não houver fusos
        if (worldClocks.length === 0) {
            noWorldClocksMessage.style.display = 'block';
            return;
        }
        
        // Oculta a mensagem de "nenhum fuso horário"
        noWorldClocksMessage.style.display = 'none';
        
        // Adiciona cada fuso horário à lista
        worldClocks.forEach(clock => {
            const clockItem = document.createElement('div');
            clockItem.className = 'worldclock-item';
            clockItem.dataset.id = clock.id;
            
            // Calcula o horário atual na cidade
            const localTime = calculateLocalTime(clock.offset);
            
            // Calcula a diferença de horário
            const now = new Date();
            const localOffset = -now.getTimezoneOffset() / 60; // Offset local em horas
            const diffHours = clock.offset - localOffset;
            const diffText = diffHours === 0 ? 'Mesmo horário' : 
                             diffHours > 0 ? `${Math.abs(diffHours)} horas à frente` : 
                             `${Math.abs(diffHours)} horas atrás`;
            
            // Cria o HTML do item
            clockItem.innerHTML = `
                <div class="worldclock-info">
                    <div class="worldclock-city">${clock.city}</div>
                    <div class="worldclock-diff">${diffText}</div>
                </div>
                <div class="worldclock-time">${localTime}</div>
                <button class="delete-worldclock"><i class="fas fa-times"></i></button>
            `;
            
            worldClockList.appendChild(clockItem);
            
            // Adiciona evento para o botão de excluir
            const deleteBtn = clockItem.querySelector('.delete-worldclock');
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation(); // Evita a propagação do evento
                deleteWorldClock(clock.id);
            });
        });
    }
    
    // Atualiza os horários dos fusos horários
    function updateWorldClocks() {
        worldClocks.forEach(clock => {
            const clockItem = document.querySelector(`.worldclock-item[data-id="${clock.id}"]`);
            if (clockItem) {
                const timeElement = clockItem.querySelector('.worldclock-time');
                timeElement.textContent = calculateLocalTime(clock.offset);
            }
        });
    }
    
    // Calcula o horário local com base no offset
    function calculateLocalTime(offset) {
        const now = new Date();
        
        // Calcula o horário UTC
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        
        // Cria uma nova data com o offset fornecido
        const localTime = new Date(utc + (3600000 * offset));
        
        // Formata a hora
        const hours = localTime.getHours();
        const minutes = localTime.getMinutes();
        return `${padZero(hours)}:${padZero(minutes)}`;
    }
    
    // Exclui um fuso horário
    function deleteWorldClock(id) {
        // Confirma a exclusão
        if (confirm('Tem certeza que deseja remover esta cidade?')) {
            worldClocks = worldClocks.filter(clock => clock.id !== id);
            saveWorldClocksToStorage();
            renderWorldClocks();
        }
    }
    
    // Adiciona zero à esquerda para números menores que 10
    function padZero(num) {
        return num < 10 ? `0${num}` : num;
    }
});