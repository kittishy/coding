/**
 * Relógio macOS - Módulo de Calendário
 * Implementa as funcionalidades de exibição de calendário e gerenciamento de eventos
 */

function initCalendar() {
    // Elementos do DOM
    const calendarGridElement = document.querySelector('.calendar-grid');
    const currentMonthElement = document.getElementById('current-month');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const selectedDateElement = document.getElementById('selected-date');
    const eventsListElement = document.getElementById('events-list');
    const addEventButton = document.getElementById('add-event');
    const eventModal = document.getElementById('event-modal');
    const saveEventButton = document.getElementById('save-event');
    
    // Elementos do formulário de evento
    const eventTitleInput = document.getElementById('event-title');
    const eventDateInput = document.getElementById('event-date');
    const eventTimeInput = document.getElementById('event-time');
    const eventDescriptionInput = document.getElementById('event-description');
    const eventColorInput = document.getElementById('event-color');
    
    // Variáveis de estado
    let currentDate = new Date();
    let selectedDate = new Date();
    let events = [];
    let editingEventId = null;
    
    // Carregar eventos do localStorage
    function loadEvents() {
        const savedEvents = localStorage.getItem('calendar-events');
        if (savedEvents) {
            events = JSON.parse(savedEvents);
            renderEvents();
        }
    }
    
    // Salvar eventos no localStorage
    function saveEvents() {
        localStorage.setItem('calendar-events', JSON.stringify(events));
    }
    
    // Renderizar calendário para mês atual
    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Atualizar título do mês
        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        currentMonthElement.textContent = `${monthNames[month]} ${year}`;
        
        // Limpar grid de dias anteriores, mantendo os cabeçalhos dos dias da semana
        const dayElements = calendarGridElement.querySelectorAll('.day');
        dayElements.forEach(day => day.remove());
        
        // Obter primeiro dia do mês
        const firstDay = new Date(year, month, 1);
        // Obter último dia do mês
        const lastDay = new Date(year, month + 1, 0);
        
        // Obter dia da semana do primeiro dia (0 = Domingo, 6 = Sábado)
        const firstDayOfWeek = firstDay.getDay();
        
        // Obter número de dias no mês
        const daysInMonth = lastDay.getDate();
        
        // Obter dias do mês anterior para preencher o início do calendário
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        
        // Adicionar dias do mês anterior (esmaecidos)
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const dayElement = createDayElement(prevMonthLastDay - i, true, new Date(year, month - 1, prevMonthLastDay - i));
            calendarGridElement.appendChild(dayElement);
        }
        
        // Adicionar dias do mês atual
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = isSameDay(date, new Date());
            const isSelected = isSameDay(date, selectedDate);
            
            const dayElement = createDayElement(day, false, date);
            
            if (isToday) {
                dayElement.classList.add('today');
            }
            
            if (isSelected) {
                dayElement.classList.add('selected');
            }
            
            // Verificar se tem eventos neste dia
            const hasEvents = events.some(event => isSameDay(new Date(event.date), date));
            if (hasEvents) {
                dayElement.classList.add('has-events');
            }
            
            calendarGridElement.appendChild(dayElement);
        }
        
        // Calcular quantas células já foram preenchidas
        const filledCells = firstDayOfWeek + daysInMonth;
        // Calcular quantas células ainda precisam ser preenchidas para completar a grade (7x6)
        const remainingCells = 42 - filledCells;
        
        // Adicionar dias do próximo mês (esmaecidos)
        for (let day = 1; day <= remainingCells; day++) {
            const dayElement = createDayElement(day, true, new Date(year, month + 1, day));
            calendarGridElement.appendChild(dayElement);
        }
    }
    
    // Criar elemento de dia para o calendário
    function createDayElement(day, isOtherMonth, date) {
        const dayElement = document.createElement('div');
        dayElement.className = 'day';
        dayElement.textContent = day;
        
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }
        
        // Adicionar evento de clique
        dayElement.addEventListener('click', () => {
            // Remover classe selected de todos os dias
            const selectedDays = calendarGridElement.querySelectorAll('.day.selected');
            selectedDays.forEach(day => day.classList.remove('selected'));
            
            // Adicionar classe selected ao dia clicado
            dayElement.classList.add('selected');
            
            // Atualizar data selecionada
            selectedDate = new Date(date);
            
            // Atualizar texto da data selecionada
            updateSelectedDateText();
            
            // Renderizar eventos do dia selecionado
            renderEvents();
        });
        
        return dayElement;
    }
    
    // Formatar data selecionada
    function updateSelectedDateText() {
        // Formatando como DD/MM/YYYY
        const day = selectedDate.getDate().toString().padStart(2, '0');
        const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
        const year = selectedDate.getFullYear();
        
        selectedDateElement.textContent = `${day}/${month}/${year}`;
        
        // Atualizar também o campo de data no modal de evento
        eventDateInput.value = `${year}-${month}-${day}`;
    }
    
    // Verificar se duas datas são o mesmo dia
    function isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }
    
    // Renderizar eventos para o dia selecionado
    function renderEvents() {
        // Filtrar eventos para o dia selecionado
        const dayEvents = events.filter(event => isSameDay(new Date(event.date), selectedDate));
        
        if (dayEvents.length === 0) {
            eventsListElement.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-day"></i>
                    <p>Nenhum evento para este dia</p>
                </div>
            `;
            return;
        }
        
        // Ordenar eventos por hora
        dayEvents.sort((a, b) => {
            if (a.time < b.time) return -1;
            if (a.time > b.time) return 1;
            return 0;
        });
        
        // Limpar lista de eventos
        eventsListElement.innerHTML = '';
        
        // Adicionar cada evento à lista
        dayEvents.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'event-item';
            eventElement.dataset.id = event.id;
            
            // Formatar hora do evento
            let timeString = 'Todo o dia';
            if (event.time) {
                const [hours, minutes] = event.time.split(':');
                timeString = `${hours}:${minutes}`;
            }
            
            eventElement.innerHTML = `
                <div class="event-color" style="background-color: ${event.color}"></div>
                <div class="event-details">
                    <div class="event-title">${event.title}</div>
                    <div class="event-time">${timeString}</div>
                    ${event.description ? `<div class="event-description">${event.description}</div>` : ''}
                </div>
                <div class="event-actions">
                    <button class="edit-event-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-event-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            eventsListElement.appendChild(eventElement);
            
            // Adicionar eventos aos botões
            const editButton = eventElement.querySelector('.edit-event-btn');
            editButton.addEventListener('click', () => openEditEventModal(event.id));
            
            const deleteButton = eventElement.querySelector('.delete-event-btn');
            deleteButton.addEventListener('click', () => deleteEvent(event.id));
        });
    }
    
    // Adicionar novo evento
    function addEvent(eventData) {
        const newEvent = {
            id: Date.now().toString(),
            title: eventData.title,
            date: eventData.date,
            time: eventData.time,
            description: eventData.description,
            color: eventData.color
        };
        
        events.push(newEvent);
        saveEvents();
        
        // Se o evento for para o dia selecionado, atualizar a visualização
        if (isSameDay(new Date(newEvent.date), selectedDate)) {
            renderEvents();
        }
        
        // Atualizar o calendário para mostrar indicadores de evento
        renderCalendar();
        
        // Mostrar notificação
        showNotification('Evento adicionado com sucesso');
    }
    
    // Editar evento existente
    function editEvent(id, eventData) {
        const index = events.findIndex(event => event.id === id);
        if (index !== -1) {
            const oldDate = new Date(events[index].date);
            
            events[index] = {
                ...events[index],
                title: eventData.title,
                date: eventData.date,
                time: eventData.time,
                description: eventData.description,
                color: eventData.color
            };
            
            saveEvents();
            
            // Renderizar eventos e calendário
            renderEvents();
            renderCalendar();
            
            // Mostrar notificação
            showNotification('Evento atualizado com sucesso');
        }
    }
    
    // Deletar evento
    function deleteEvent(id) {
        if (confirm('Tem certeza que deseja excluir este evento?')) {
            events = events.filter(event => event.id !== id);
            saveEvents();
            
            // Atualizar visualização
            renderEvents();
            renderCalendar();
            
            // Mostrar notificação
            showNotification('Evento excluído com sucesso');
        }
    }
    
    // Abrir modal para edição de evento
    function openEditEventModal(id) {
        const event = events.find(event => event.id === id);
        if (event) {
            editingEventId = id;
            
            // Preencher campos com valores do evento
            eventTitleInput.value = event.title;
            eventDateInput.value = event.date;
            eventTimeInput.value = event.time || '';
            eventDescriptionInput.value = event.description || '';
            eventColorInput.value = event.color;
            
            // Abrir modal
            eventModal.style.display = 'flex';
        }
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
    
    // Event Listeners
    
    // Navegação para mês anterior
    prevMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    
    // Navegação para próximo mês
    nextMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    
    // Abrir modal para adicionar evento
    addEventButton.addEventListener('click', () => {
        // Resetar campos do modal
        editingEventId = null;
        eventTitleInput.value = '';
        
        // Preencher a data com a data selecionada
        const day = selectedDate.getDate().toString().padStart(2, '0');
        const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
        const year = selectedDate.getFullYear();
        eventDateInput.value = `${year}-${month}-${day}`;
        
        eventTimeInput.value = '';
        eventDescriptionInput.value = '';
        eventColorInput.value = '#FF6347';
        
        // Exibir modal
        eventModal.style.display = 'flex';
    });
    
    // Salvar evento
    saveEventButton.addEventListener('click', () => {
        // Validar campos
        if (!eventTitleInput.value.trim()) {
            alert('Por favor, informe um título para o evento.');
            return;
        }
        
        if (!eventDateInput.value) {
            alert('Por favor, informe uma data para o evento.');
            return;
        }
        
        const eventData = {
            title: eventTitleInput.value.trim(),
            date: eventDateInput.value,
            time: eventTimeInput.value,
            description: eventDescriptionInput.value.trim(),
            color: eventColorInput.value
        };
        
        if (editingEventId) {
            editEvent(editingEventId, eventData);
        } else {
            addEvent(eventData);
        }
        
        // Fechar modal
        eventModal.style.display = 'none';
    });
    
    // Fechar modais
    const closeModalButtons = document.querySelectorAll('.close-modal');
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
    updateSelectedDateText();
    loadEvents();
    renderCalendar();
    renderEvents();
    
    // Exportar funções para uso externo se necessário
    return {
        addEvent,
        editEvent,
        deleteEvent,
        navigateToMonth: (year, month) => {
            currentDate = new Date(year, month);
            renderCalendar();
        }
    };
}
