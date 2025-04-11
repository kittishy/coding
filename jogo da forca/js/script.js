// Elementos do DOM
const gameContainer = document.getElementById('game-container');
const adminContainer = document.getElementById('admin-container');
const btnAdmin = document.getElementById('btn-admin');
const btnBack = document.getElementById('btn-back');
const btnNewGame = document.getElementById('btn-new-game');
const btnAddWord = document.getElementById('btn-add-word');
const newWordInput = document.getElementById('new-word');
const newHintInput = document.getElementById('new-hint');
const wordList = document.getElementById('word-list');
const wordElement = document.getElementById('word');
const hintElement = document.getElementById('hint');
const wrongLettersElement = document.getElementById('wrong-letters');
const attemptsElement = document.getElementById('attempts');
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notification-message');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalButton = document.getElementById('modal-button');
const themeToggle = document.getElementById('theme-toggle');
const languageToggle = document.getElementById('language-toggle');
const languageMenu = document.createElement('div');
languageMenu.id = 'language-menu';
languageMenu.className = 'language-menu';
document.body.appendChild(languageMenu);

// Partes da forca
const hangmanParts = [
    document.getElementById('head'),
    document.getElementById('body'),
    document.getElementById('left-arm'),
    document.getElementById('right-arm'),
    document.getElementById('left-leg'),
    document.getElementById('right-leg')
];

// Variáveis do jogo
let words = [];
let selectedWord = '';
let selectedHint = '';
let correctLetters = [];
let wrongLetters = [];
let maxAttempts = 6;
let gameOver = false;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadWordsFromLocalStorage();
    loadThemePreference();
    loadLanguagePreference();
    setupEventListeners();
    showGameScreen();
    startNewGame();
});

// Função para carregar preferência de tema
function loadThemePreference() {
    const savedTheme = localStorage.getItem('hangmanTheme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }
}

// Função para alternar tema
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('hangmanTheme', newTheme);
    
    updateThemeIcon(newTheme);
}

// Função para carregar preferência de idioma
function loadLanguagePreference() {
    const savedLanguage = localStorage.getItem('hangmanLanguage') || 'pt-br';
    document.documentElement.lang = savedLanguage;
    updateInterfaceLanguage(savedLanguage);
}

// Função para alternar menu de idioma
function toggleLanguageMenu() {
    const menu = document.getElementById('language-menu');
    menu.classList.toggle('active');
    
    if (menu.classList.contains('active')) {
        renderLanguageMenu();
    }
}

// Função para renderizar menu de idiomas
function renderLanguageMenu() {
    const menu = document.getElementById('language-menu');
    menu.innerHTML = '';
    
    const languages = ['pt-br', 'en', 'es', 'fr', 'de'];
    const languageNames = {
        'pt-br': 'Português (BR)',
        'en': 'English',
        'es': 'Español',
        'fr': 'Français',
        'de': 'Deutsch'
    };
    
    languages.forEach(lang => {
        const option = document.createElement('div');
        option.className = 'language-option';
        option.textContent = languageNames[lang];
        option.addEventListener('click', () => {
            changeLanguage(lang);
            menu.classList.remove('active');
        });
        menu.appendChild(option);
    });
}

// Função para alterar idioma
function changeLanguage(lang) {
    document.documentElement.lang = lang;
    localStorage.setItem('hangmanLanguage', lang);
    updateInterfaceLanguage(lang);
}

// Função para atualizar interface com novo idioma
function updateInterfaceLanguage(lang) {
    const t = getTranslations(lang);
    
    // Atualizar textos estáticos
    document.querySelector('title').textContent = t.gameTitle;
    btnAdmin.textContent = t.customizeGame;
    btnNewGame.textContent = t.newGame;
    btnAddWord.textContent = t.addWord;
    btnBack.textContent = t.customizeGame;
    
    // Atualizar placeholders
    newWordInput.placeholder = t.wordPlaceholder;
    newHintInput.placeholder = t.hintPlaceholder;
    
    // Atualizar elementos dinâmicos
    if (hintElement) hintElement.textContent = selectedHint;
    if (attemptsElement) attemptsElement.textContent = maxAttempts - wrongLetters.length;
}

// Atualizar ícone do botão de tema
function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

// Funções de inicialização
function loadWordsFromLocalStorage() {
    const storedWords = localStorage.getItem('hangmanWords');
    if (storedWords) {
        words = JSON.parse(storedWords);
    } else {
        // Palavras padrão caso não haja palavras salvas
        words = [
            { word: 'JAVASCRIPT', hint: 'Linguagem de programação para web' },
            { word: 'BRASIL', hint: 'País da América do Sul' },
            { word: 'ELEFANTE', hint: 'Animal de grande porte com tromba' },
            { word: 'GUITARRA', hint: 'Instrumento musical de cordas' },
            { word: 'CHOCOLATE', hint: 'Doce feito de cacau' },
            { word: 'PYTHON', hint: 'Linguagem de programação para IA' },
            { word: 'AMAZONIA', hint: 'Maior bioma brasileiro' },
            { word: 'PIANO', hint: 'Instrumento musical de teclas' },
            { word: 'ABACAXI', hint: 'Fruta tropical doce' },
            { word: 'FUTEBOL', hint: 'Esporte mais popular do Brasil' }
        ];
        saveWordsToLocalStorage();
    }
}

function setupEventListeners() {
    // Navegação entre telas
    btnAdmin.addEventListener('click', showAdminScreen);
    btnBack.addEventListener('click', showGameScreen);
    btnNewGame.addEventListener('click', startNewGame);
    
    // Administração de palavras
    btnAddWord.addEventListener('click', addNewWord);
    
    // Alternância de tema e idioma
    themeToggle.addEventListener('click', toggleTheme);
    languageToggle.addEventListener('click', toggleLanguageMenu);
    
    // Fechar menu de idioma ao clicar fora
    document.addEventListener('click', (e) => {
        if (!languageToggle.contains(e.target) && !languageMenu.contains(e.target)) {
            languageMenu.classList.remove('active');
        }
    });
    
    // Teclado virtual
    document.querySelectorAll('.key').forEach(key => {
        key.addEventListener('click', () => {
            if (!gameOver && !key.classList.contains('disabled')) {
                const letter = key.textContent;
                handleGuess(letter);
            }
        });
    });
    
    // Teclado físico
    document.addEventListener('keydown', (e) => {
        if (!gameOver && gameContainer.classList.contains('active')) {
            const key = e.key.toUpperCase();
            if (/^[A-Z]$/.test(key)) {
                handleGuess(key);
            }
        }
    });
    
    // Modal
    modalButton.addEventListener('click', hideModal);
}

// Funções de navegação
function showGameScreen() {
    adminContainer.classList.remove('active');
    gameContainer.classList.add('active');
}

function showAdminScreen() {
    gameContainer.classList.remove('active');
    adminContainer.classList.add('active');
    renderWordList();
    newWordInput.value = '';
    newHintInput.value = '';
    btnAddWord.textContent = 'Adicionar Palavra';
}

// Funções do jogo
function startNewGame() {
    if (words.length === 0) {
        showModal('Sem palavras', 'Não há palavras cadastradas. Adicione palavras na área de administração.', 'Entendi');
        return;
    }
    
    // Resetar variáveis do jogo
    const randomIndex = Math.floor(Math.random() * words.length);
    selectedWord = words[randomIndex].word.toUpperCase();
    selectedHint = words[randomIndex].hint;
    correctLetters = [];
    wrongLetters = [];
    gameOver = false;
    
    // Resetar interface
    updateWordDisplay();
    updateWrongLetters();
    updateHangman();
    resetKeyboard();
    
    // Atualizar informações
    hintElement.textContent = selectedHint;
    attemptsElement.textContent = maxAttempts;
}

function handleGuess(letter) {
    if (correctLetters.includes(letter) || wrongLetters.includes(letter)) {
        showNotification('Você já tentou esta letra!', true);
        return;
    }
    
    if (selectedWord.includes(letter)) {
        correctLetters.push(letter);
        updateWordDisplay();
        
        // Verificar vitória
        const wordLetters = selectedWord.split('').filter((value, index, self) => {
            return self.indexOf(value) === index;
        });
        
        if (wordLetters.every(letter => correctLetters.includes(letter))) {
            gameOver = true;
            showModal('Parabéns!', `Você venceu! A palavra era: ${selectedWord}`, 'Novo Jogo');
        }
    } else {
        wrongLetters.push(letter);
        updateWrongLetters();
        updateHangman();
        
        // Verificar derrota
        if (wrongLetters.length >= maxAttempts) {
            gameOver = true;
            showModal('Que pena!', `Você perdeu! A palavra era: ${selectedWord}`, 'Tentar Novamente');
        }
    }
    
    // Atualizar teclado
    updateKeyboard(letter, selectedWord.includes(letter));
}

function updateWordDisplay() {
    wordElement.innerHTML = '';
    
    selectedWord.split('').forEach(letter => {
        const letterElement = document.createElement('div');
        letterElement.classList.add('letter');
        
        if (correctLetters.includes(letter)) {
            letterElement.textContent = letter;
            letterElement.classList.add('visible');
            letterElement.classList.add('correct');
        }
        
        wordElement.appendChild(letterElement);
    });
}

function updateWrongLetters() {
    wrongLettersElement.innerHTML = '';
    attemptsElement.textContent = maxAttempts - wrongLetters.length;
    
    wrongLetters.forEach(letter => {
        const letterElement = document.createElement('div');
        letterElement.classList.add('wrong-letter');
        letterElement.textContent = letter;
        wrongLettersElement.appendChild(letterElement);
    });
}

function updateHangman() {
    // Esconder todas as partes
    hangmanParts.forEach(part => part.classList.add('hidden'));
    
    // Mostrar partes de acordo com o número de erros
    for (let i = 0; i < wrongLetters.length; i++) {
        if (hangmanParts[i]) {
            hangmanParts[i].classList.remove('hidden');
        }
    }
}

function resetKeyboard() {
    document.querySelectorAll('.key').forEach(key => {
        key.classList.remove('correct', 'wrong', 'disabled');
    });
}

function updateKeyboard(letter, isCorrect) {
    document.querySelectorAll('.key').forEach(key => {
        if (key.textContent === letter) {
            key.classList.add('disabled');
            key.classList.add(isCorrect ? 'correct' : 'wrong');
        }
    });
}

// Funções de administração
let editingIndex = -1;

function addNewWord() {
    const word = newWordInput.value.trim().toUpperCase();
    const hint = newHintInput.value.trim();
    
    if (word === '' || hint === '') {
        showNotification('Preencha todos os campos!', true);
        return;
    }
    
    if (word.length < 3) {
        showNotification('A palavra deve ter pelo menos 3 letras!', true);
        return;
    }
    
    if (!/^[A-ZÀ-ÖØ-Þ]+$/.test(word)) {
        showNotification('A palavra deve conter apenas letras!', true);
        return;
    }
    
    // Verificar se a palavra já existe
    const isEditing = editingIndex > -1;
    
    if (words.some((item, index) => item.word.toUpperCase() === word && index !== editingIndex)) {
        showNotification('Esta palavra já está cadastrada!', true);
        return;
    }
    
    // Adicionar/Editar palavra
    if (isEditing) {
        words[editingIndex] = { word, hint };
        editingIndex = -1;
    btnAddWord.textContent = 'Adicionar Palavra';
    } else {
        words.push({ word, hint });
    }
    saveWordsToLocalStorage();
    renderWordList();
    
    // Limpar campos
    newWordInput.value = '';
    newHintInput.value = '';
    
    showNotification('Palavra adicionada com sucesso!');
}

function startEditWord(index) {
    editingIndex = index;
    const wordObj = words[index];
    newWordInput.value = wordObj.word;
    newHintInput.value = wordObj.hint;
    btnAddWord.textContent = 'Atualizar Palavra';
}

function deleteWord(index) {
    words.splice(index, 1);
    saveWordsToLocalStorage();
    renderWordList();
    showNotification('Palavra removida com sucesso!');
}

function renderWordList() {
    wordList.innerHTML = '';
    
    if (words.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.textContent = 'Nenhuma palavra cadastrada.';
        emptyMessage.style.padding = '15px 0';
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.color = '#666';
        wordList.appendChild(emptyMessage);
        return;
    }
    
    words.forEach((item, index) => {
        const wordItem = document.createElement('div');
        wordItem.classList.add('word-item');
        
        const wordText = document.createElement('div');
        wordText.classList.add('word-text');
        wordText.textContent = item.word;
        
        const hintText = document.createElement('div');
        hintText.classList.add('hint-text');
        hintText.textContent = item.hint;
        
        const wordActions = document.createElement('div');
        wordActions.classList.add('word-actions');
        
        const editButton = document.createElement('button');
        editButton.classList.add('btn-edit');
        editButton.innerHTML = '<i class="fas fa-pencil-alt"></i>';
        editButton.addEventListener('click', () => startEditWord(index));
    
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('btn-delete');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.addEventListener('click', () => deleteWord(index));
        
        wordActions.appendChild(editButton);
        wordActions.appendChild(deleteButton);
        wordItem.appendChild(wordText);
        wordItem.appendChild(hintText);
        wordItem.appendChild(wordActions);
        
        wordList.appendChild(wordItem);
    });
}

function saveWordsToLocalStorage() {
    localStorage.setItem('hangmanWords', JSON.stringify(words));
}

// Funções de UI
function showNotification(message, isError = false) {
    notificationMessage.textContent = message;
    notification.classList.add('show');
    
    if (isError) {
        notification.classList.add('error');
    } else {
        notification.classList.remove('error');
    }
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function showModal(title, message, buttonText) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalButton.textContent = buttonText;
    modal.classList.add('show');
}

function hideModal() {
    modal.classList.remove('show');
    
    // Se o jogo acabou, iniciar um novo jogo
    if (gameOver) {
        startNewGame();
    }
}