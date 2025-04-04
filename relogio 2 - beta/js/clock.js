/**
 * Controle do Relógio Analógico e Digital
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do relógio analógico
    const hourHand = document.querySelector('.hour-hand');
    const minuteHand = document.querySelector('.minute-hand');
    const secondHand = document.querySelector('.second-hand');
    
    // Elementos do relógio digital
    const digitalTime = document.querySelector('.digital-clock .time');
    const digitalDate = document.querySelector('.digital-clock .date');
    const weatherDisplay = document.querySelector('.digital-clock .weather span');
    
    // Nomes dos dias da semana e meses em português
    const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    // Função para atualizar o relógio
    function updateClock() {
        const now = new Date();
        
        const seconds = now.getSeconds();
        const minutes = now.getMinutes();
        const hours = now.getHours();
        
        // Atualiza o relógio analógico apenas se os elementos existirem
        if (hourHand && minuteHand && secondHand) {
            // Calcula os ângulos dos ponteiros
            const hoursFor12h = hours % 12; // Converte para formato 12h para o relógio analógico
            const secondDegrees = (seconds / 60) * 360;
            const minuteDegrees = ((minutes + seconds / 60) / 60) * 360;
            const hourDegrees = ((hoursFor12h + minutes / 60) / 12) * 360;
            
            // Aplica as rotações aos ponteiros
            secondHand.style.transform = `rotate(${secondDegrees}deg)`;
            minuteHand.style.transform = `rotate(${minuteDegrees}deg)`;
            hourHand.style.transform = `rotate(${hourDegrees}deg)`;
        }
        
        // Atualiza o relógio digital
        const timeString = formatTime(hours, minutes, seconds);
        digitalTime.textContent = timeString;
        
        // Atualiza a data
        const day = now.getDate();
        const weekday = weekdays[now.getDay()];
        const month = months[now.getMonth()];
        digitalDate.textContent = `${weekday}, ${day} de ${month}`;
    }
    
    // Formata a hora para o formato HH:MM:SS
    function formatTime(hours, minutes, seconds) {
        // Usa as horas já fornecidas (no formato 24h)
        return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
    }
    
    // Adiciona zero à esquerda para números menores que 10
    function padZero(num) {
        return num < 10 ? `0${num}` : num;
    }
    
    // Simula dados de clima (em uma aplicação real, isso viria de uma API de clima)
    function simulateWeather() {
        const temperatures = [18, 20, 22, 24, 25, 27, 30];
        const randomTemp = temperatures[Math.floor(Math.random() * temperatures.length)];
        weatherDisplay.textContent = `${randomTemp}°C`;
    }
    
    // Inicializa o relógio e atualiza a cada segundo
    updateClock();
    simulateWeather();
    setInterval(updateClock, 1000);
});