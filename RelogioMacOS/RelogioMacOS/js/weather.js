/**
 * Relógio macOS - Módulo de Previsão do Tempo
 * Implementa widget de previsão do tempo usando a API OpenWeatherMap
 */

function initWeather() {
    // Elementos do DOM (Precisam ser adicionados ao HTML)
    // Você precisa adicionar um <div class="view" id="weather-view"> ao HTML
    const weatherDisplayElement = document.querySelector('#clock-view .weather-widget') || createWeatherWidget();
    
    // Configurações
    const API_KEY = ''; // Adicione sua chave da API OpenWeatherMap aqui
    const DEFAULT_CITY = 'Taquara,Rio de Janeiro,BR';
    const UPDATE_INTERVAL = 30 * 60 * 1000; // 30 minutos em milissegundos
    
    // Variáveis de estado
    let weatherData = null;
    let useCelsius = true;
    let currentCity = '';
    let updateTimer = null;
    
    // Criar widget do tempo (caso não exista no HTML)
    function createWeatherWidget() {
        // Criar widget dentro da visualização do relógio
        const clockView = document.getElementById('clock-view');
        const weatherWidget = document.createElement('div');
        weatherWidget.className = 'weather-widget';
        weatherWidget.innerHTML = `
            <div class="weather-current">
                <div class="weather-icon">
                    <i class="fas fa-cloud-sun"></i>
                </div>
                <div class="weather-temp">--°C</div>
                <div class="weather-desc">Carregando...</div>
            </div>
            <div class="weather-details">
                <div class="weather-location">Localização</div>
                <div class="weather-feels-like">Sensação: --°C</div>
                <div class="weather-humidity">Umidade: --%</div>
                <div class="weather-wind">Vento: -- km/h</div>
            </div>
            <div class="weather-controls">
                <button id="weather-refresh" class="option-btn">
                    <i class="fas fa-sync"></i>
                    <span>Atualizar</span>
                </button>
                <button id="weather-units" class="option-btn">
                    <i class="fas fa-thermometer-half"></i>
                    <span>°C / °F</span>
                </button>
                <button id="weather-location" class="option-btn">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>Localização</span>
                </button>
            </div>
        `;
        
        // Inserir após o display do relógio
        const clockDisplay = clockView.querySelector('.clock-display');
        clockView.insertBefore(weatherWidget, clockDisplay.nextSibling);
        
        return weatherWidget;
    }
    
    // Carregar configurações do localStorage
    function loadSettings() {
        const savedSettings = localStorage.getItem('weather-settings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            currentCity = settings.city || DEFAULT_CITY;
            useCelsius = settings.useCelsius !== undefined ? settings.useCelsius : true;
        } else {
            currentCity = DEFAULT_CITY;
            useCelsius = true;
        }
    }
    
    // Salvar configurações no localStorage
    function saveSettings() {
        const settings = {
            city: currentCity,
            useCelsius: useCelsius
        };
        localStorage.setItem('weather-settings', JSON.stringify(settings));
    }
    
    // Buscar dados da API de previsão do tempo
    async function fetchWeatherData() {
        // Verificar se a API_KEY está configurada
        if (!API_KEY) {
            showError('Chave de API não configurada. Obtenha uma em openweathermap.org');
            return;
        }
        
        try {
            // Exibir indicador de carregamento
            setLoadingState();
            
            // Buscar dados da API
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&appid=${API_KEY}&units=metric&lang=pt_br`);
            
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            weatherData = data;
            
            // Atualizar interface
            updateWeatherDisplay();
            
            // Programar próxima atualização
            scheduleNextUpdate();
            
            // Salvar cidade atual
            saveSettings();
            
            return data;
        } catch (error) {
            showError(`Erro ao buscar dados meteorológicos: ${error.message}`);
            console.error('Erro de previsão do tempo:', error);
        }
    }
    
    // Atualizar a exibição do clima
    function updateWeatherDisplay() {
        if (!weatherData) return;
        
        const iconElement = weatherDisplayElement.querySelector('.weather-icon i');
        const tempElement = weatherDisplayElement.querySelector('.weather-temp');
        const descElement = weatherDisplayElement.querySelector('.weather-desc');
        const locationElement = weatherDisplayElement.querySelector('.weather-location');
        const feelsLikeElement = weatherDisplayElement.querySelector('.weather-feels-like');
        const humidityElement = weatherDisplayElement.querySelector('.weather-humidity');
        const windElement = weatherDisplayElement.querySelector('.weather-wind');
        
        // Converter temperatura se necessário
        const temp = useCelsius ? weatherData.main.temp : celsiusToFahrenheit(weatherData.main.temp);
        const feelsLike = useCelsius ? weatherData.main.feels_like : celsiusToFahrenheit(weatherData.main.feels_like);
        const unit = useCelsius ? '°C' : '°F';
        
        // Atualizar valores
        tempElement.textContent = `${Math.round(temp)}${unit}`;
        descElement.textContent = weatherData.weather[0].description;
        locationElement.textContent = `${weatherData.name}, ${weatherData.sys.country}`;
        feelsLikeElement.textContent = `Sensação: ${Math.round(feelsLike)}${unit}`;
        humidityElement.textContent = `Umidade: ${weatherData.main.humidity}%`;
        windElement.textContent = `Vento: ${Math.round(weatherData.wind.speed * 3.6)} km/h`; // Converter m/s para km/h
        
        // Definir ícone com base na condição climática
        const weatherId = weatherData.weather[0].id;
        const isDay = isItDaytime(weatherData.sys.sunrise, weatherData.sys.sunset);
        
        iconElement.className = getWeatherIcon(weatherId, isDay);
    }
    
    // Verificar se é dia ou noite
    function isItDaytime(sunrise, sunset) {
        const now = Math.floor(Date.now() / 1000); // Timestamp atual em segundos
        return now >= sunrise && now < sunset;
    }
    
    // Obter ícone baseado na condição climática
    function getWeatherIcon(weatherId, isDay) {
        // Grupos de condições climáticas conforme a API OpenWeatherMap
        if (weatherId >= 200 && weatherId < 300) {
            return 'fas fa-bolt'; // Tempestade
        } else if (weatherId >= 300 && weatherId < 400) {
            return 'fas fa-cloud-rain'; // Chuvisco
        } else if (weatherId >= 500 && weatherId < 600) {
            return 'fas fa-cloud-showers-heavy'; // Chuva
        } else if (weatherId >= 600 && weatherId < 700) {
            return 'fas fa-snowflake'; // Neve
        } else if (weatherId >= 700 && weatherId < 800) {
            return 'fas fa-smog'; // Névoa, fumaça, etc.
        } else if (weatherId === 800) {
            return isDay ? 'fas fa-sun' : 'fas fa-moon'; // Céu limpo
        } else if (weatherId >= 801 && weatherId <= 803) {
            return isDay ? 'fas fa-cloud-sun' : 'fas fa-cloud-moon'; // Parcialmente nublado
        } else {
            return 'fas fa-cloud'; // Nublado
        }
    }
    
    // Converter Celsius para Fahrenheit
    function celsiusToFahrenheit(celsius) {
        return (celsius * 9/5) + 32;
    }
    
    // Alternar entre Celsius e Fahrenheit
    function toggleTemperatureUnit() {
        useCelsius = !useCelsius;
        updateWeatherDisplay();
        saveSettings();
        
        // Mostrar notificação
        showNotification(`Temperatura em ${useCelsius ? 'Celsius' : 'Fahrenheit'}`);
    }
    
    // Programar próxima atualização
    function scheduleNextUpdate() {
        if (updateTimer) {
            clearTimeout(updateTimer);
        }
        
        updateTimer = setTimeout(fetchWeatherData, UPDATE_INTERVAL);
    }
    
    // Mostrar indicador de carregamento
    function setLoadingState() {
        const tempElement = weatherDisplayElement.querySelector('.weather-temp');
        const descElement = weatherDisplayElement.querySelector('.weather-desc');
        
        tempElement.textContent = '--°';
        descElement.textContent = 'Carregando...';
    }
    
    // Mostrar erro
    function showError(message) {
        const descElement = weatherDisplayElement.querySelector('.weather-desc');
        descElement.textContent = 'Erro ao carregar';
        
        // Mostrar notificação com detalhes do erro
        showNotification(message, 'error');
    }
    
    // Exibir modal para alterar localização
    function showLocationModal() {
        // Criar modal se não existir
        let locationModal = document.getElementById('weather-location-modal');
        
        if (!locationModal) {
            locationModal = document.createElement('div');
            locationModal.id = 'weather-location-modal';
            locationModal.className = 'modal';
            locationModal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Alterar Localização</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="city-input">Cidade (formato: cidade,estado,país)</label>
                            <input type="text" id="city-input" placeholder="Ex: Taquara,Rio de Janeiro,BR">
                            <small>Use o código do país de 2 letras (BR, US, etc.)</small>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="save-location" class="btn btn-primary">Salvar</button>
                        <button class="btn btn-secondary close-modal">Cancelar</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(locationModal);
            
            // Configurar eventos do modal
            const closeButtons = locationModal.querySelectorAll('.close-modal');
            closeButtons.forEach(button => {
                button.addEventListener('click', () => {
                    locationModal.style.display = 'none';
                });
            });
            
            const saveButton = locationModal.querySelector('#save-location');
            saveButton.addEventListener('click', () => {
                const cityInput = document.getElementById('city-input');
                const newCity = cityInput.value.trim();
                
                if (newCity) {
                    currentCity = newCity;
                    fetchWeatherData();
                    locationModal.style.display = 'none';
                } else {
                    alert('Por favor, insira uma localização válida.');
                }
            });
            
            // Fechar modal ao clicar fora
            locationModal.addEventListener('click', (e) => {
                if (e.target === locationModal) {
                    locationModal.style.display = 'none';
                }
            });
        }
        
        // Preencher o campo com a cidade atual
        const cityInput = document.getElementById('city-input');
        cityInput.value = currentCity;
        
        // Exibir modal
        locationModal.style.display = 'flex';
    }
    
    // Mostrar notificação
    function showNotification(message, type = 'info') {
        const notificationContainer = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
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
    
    // Inicializar módulo
    function init() {
        // Carregar configurações salvas
        loadSettings();
        
        // Configurar botões
        const refreshButton = document.getElementById('weather-refresh');
        const unitsButton = document.getElementById('weather-units');
        const locationButton = document.getElementById('weather-location');
        
        if (refreshButton) {
            refreshButton.addEventListener('click', fetchWeatherData);
        }
        
        if (unitsButton) {
            unitsButton.addEventListener('click', toggleTemperatureUnit);
        }
        
        if (locationButton) {
            locationButton.addEventListener('click', showLocationModal);
        }
        
        // Buscar dados do tempo iniciais
        fetchWeatherData();
    }
    
    // Inicializar quando o DOM estiver pronto
    init();
    
    // Exportar funções para uso externo
    return {
        refresh: fetchWeatherData,
        toggleUnits: toggleTemperatureUnit,
        setCity: (city) => {
            currentCity = city;
            fetchWeatherData();
        }
    };
}
// Exportar funções para uso externo