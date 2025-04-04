function initClock() {
    const timeElement = document.querySelector('#clock-view .time');
    const millisecondsElement = document.querySelector('#clock-view .milliseconds');
    const dateElement = document.querySelector('#clock-view .date');
    const timezoneElement = document.querySelector('#clock-view .timezone');
    
    let use24HourFormat = true;
    let showSeconds = true;
    let currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    function updateClock() {
        const now = new Date();
        
        // Formatação da hora
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
        
        let timeString;
        if (use24HourFormat) {
            timeString = `${hours.toString().padStart(2, '0')}:${minutes}`;
        } else {
            const period = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            timeString = `${hours}:${minutes} ${period}`;
        }
        
        if (showSeconds) {
            timeString += `:${seconds}`;
        }
        
        timeElement.textContent = timeString;
        millisecondsElement.textContent = milliseconds;
        
        // Formatação da data
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            timeZone: currentTimezone
        };
        
        dateElement.textContent = now.toLocaleDateString('pt-BR', options);
        timezoneElement.textContent = `Fuso horário: ${currentTimezone}`;
        
        requestAnimationFrame(updateClock);
    }
    
    // Iniciar o relógio
    updateClock();
    
    // Configurar eventos dos botões
    document.getElementById('toggle-format').addEventListener('click', () => {
        use24HourFormat = !use24HourFormat;
        localStorage.setItem('use24HourFormat', use24HourFormat);
    });
    
    document.getElementById('toggle-seconds').addEventListener('click', () => {
        showSeconds = !showSeconds;
        localStorage.setItem('showSeconds', showSeconds);
    });
    
    // Implementar seleção de fuso horário
    const timezoneSelect = document.getElementById('timezone-select');
    const timezones = Intl.supportedValuesOf('timeZone');
    
    timezones.forEach(timezone => {
        const option = document.createElement('option');
        option.value = timezone;
        option.textContent = timezone;
        if (timezone === currentTimezone) {
            option.selected = true;
        }
        timezoneSelect.appendChild(option);
    });
    
    // Salvar configurações de fuso horário
    document.getElementById('save-timezone').addEventListener('click', () => {
        currentTimezone = timezoneSelect.value;
        localStorage.setItem('timezone', currentTimezone);
        closeModal('timezone-modal');
    });
}
