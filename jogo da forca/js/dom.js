const dom = {
    gameContainer: document.getElementById('game-container'),
    adminContainer: document.getElementById('admin-container'),
    btnAdmin: document.getElementById('btn-admin'),
    btnBack: document.getElementById('btn-back'),
    btnNewGame: document.getElementById('btn-new-game'),
    btnAddWord: document.getElementById('btn-add-word'),
    newWordInput: document.getElementById('new-word'),
    newHintInput: document.getElementById('new-hint'),
    wordList: document.getElementById('word-list'),
    wordElement: document.getElementById('word'),
    hintElement: document.getElementById('hint'),
    wrongLettersElement: document.getElementById('wrong-letters'),
    attemptsElement: document.getElementById('attempts'),
    notification: document.getElementById('notification'),
    notificationMessage: document.getElementById('notification-message'),
    modal: document.getElementById('modal'),
    modalTitle: document.getElementById('modal-title'),
    modalMessage: document.getElementById('modal-message'),
    modalButton: document.getElementById('modal-button'),
    themeToggle: document.getElementById('theme-toggle'),
    languageToggle: document.getElementById('language-toggle'),
    languageMenu: document.createElement('div'),
    hangmanParts: [
        document.getElementById('head'),
        document.getElementById('body'),
        document.getElementById('left-arm'),
        document.getElementById('right-arm'),
        document.getElementById('left-leg'),
        document.getElementById('right-leg')
    ]
};

dom.languageMenu.id = 'language-menu';
dom.languageMenu.className = 'language-menu';
document.body.appendChild(dom.languageMenu);


// hangmanParts
dom.hangmanParts = [
    document.getElementById('head'),
    document.getElementById('body'),
    document.getElementById('left-arm'),
    document.getElementById('right-arm'),
    document.getElementById('left-leg'),
    document.getElementById('right-leg')
];
export default dom;