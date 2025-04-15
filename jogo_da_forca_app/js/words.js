// Palavras para o jogo da forca em diferentes idiomas

const wordsByLanguage = {
    'pt-br': [
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
    ],
    'en': [
        { word: 'JAVASCRIPT', hint: 'Programming language for the web' },
        { word: 'BRAZIL', hint: 'Country in South America' },
        { word: 'ELEPHANT', hint: 'Large animal with a trunk' },
        { word: 'GUITAR', hint: 'String musical instrument' },
        { word: 'CHOCOLATE', hint: 'Sweet made from cocoa' },
        { word: 'PYTHON', hint: 'Programming language for AI' },
        { word: 'AMAZON', hint: 'Largest rainforest in the world' },
        { word: 'PIANO', hint: 'Musical instrument with keys' },
        { word: 'PINEAPPLE', hint: 'Sweet tropical fruit' },
        { word: 'SOCCER', hint: 'Popular sport played with a ball' }
    ],
    'es': [
        { word: 'JAVASCRIPT', hint: 'Lenguaje de programación para web' },
        { word: 'BRASIL', hint: 'País de América del Sur' },
        { word: 'ELEFANTE', hint: 'Animal grande con trompa' },
        { word: 'GUITARRA', hint: 'Instrumento musical de cuerdas' },
        { word: 'CHOCOLATE', hint: 'Dulce hecho de cacao' },
        { word: 'PYTHON', hint: 'Lenguaje de programación para IA' },
        { word: 'AMAZONIA', hint: 'Mayor selva tropical del mundo' },
        { word: 'PIANO', hint: 'Instrumento musical de teclas' },
        { word: 'PIÑA', hint: 'Fruta tropical dulce' },
        { word: 'FUTBOL', hint: 'Deporte más popular del mundo' }
    ],
    'fr': [
        { word: 'JAVASCRIPT', hint: 'Langage de programmation pour le web' },
        { word: 'BRESIL', hint: 'Pays d\'Amérique du Sud' },
        { word: 'ELEPHANT', hint: 'Grand animal avec une trompe' },
        { word: 'GUITARE', hint: 'Instrument de musique à cordes' },
        { word: 'CHOCOLAT', hint: 'Douceur faite de cacao' },
        { word: 'PYTHON', hint: 'Langage de programmation pour l\'IA' },
        { word: 'AMAZONIE', hint: 'Plus grande forêt tropicale du monde' },
        { word: 'PIANO', hint: 'Instrument de musique à touches' },
        { word: 'ANANAS', hint: 'Fruit tropical sucré' },
        { word: 'FOOTBALL', hint: 'Sport le plus populaire au monde' }
    ],
    'de': [
        { word: 'JAVASCRIPT', hint: 'Programmiersprache für das Web' },
        { word: 'BRASILIEN', hint: 'Land in Südamerika' },
        { word: 'ELEFANT', hint: 'Großes Tier mit Rüssel' },
        { word: 'GITARRE', hint: 'Saiteninstrument' },
        { word: 'SCHOKOLADE', hint: 'Süßigkeit aus Kakao' },
        { word: 'PYTHON', hint: 'Programmiersprache für KI' },
        { word: 'AMAZONAS', hint: 'Größter Regenwald der Welt' },
        { word: 'KLAVIER', hint: 'Musikinstrument mit Tasten' },
        { word: 'ANANAS', hint: 'Süße tropische Frucht' },
        { word: 'FUSSBALL', hint: 'Beliebteste Sportart der Welt' }
    ]
};

// Função para obter palavras no idioma especificado
export function getWordsByLanguage(lang) {
    return wordsByLanguage[lang] || wordsByLanguage['pt-br'];
}

// Função para adicionar uma palavra em um idioma específico
export function addWordToLanguage(lang, word, hint) {
    if (!wordsByLanguage[lang]) {
        wordsByLanguage[lang] = [];
    }
    
    wordsByLanguage[lang].push({ word, hint });
    return wordsByLanguage[lang];
}

// Função para remover uma palavra em um idioma específico
export function removeWordFromLanguage(lang, index) {
    if (wordsByLanguage[lang] && index >= 0 && index < wordsByLanguage[lang].length) {
        wordsByLanguage[lang].splice(index, 1);
    }
    return wordsByLanguage[lang] || [];
}

// Função para atualizar uma palavra em um idioma específico
export function updateWordInLanguage(lang, index, word, hint) {
    if (wordsByLanguage[lang] && index >= 0 && index < wordsByLanguage[lang].length) {
        wordsByLanguage[lang][index] = { word, hint };
    }
    return wordsByLanguage[lang] || [];
}

// Função para salvar palavras no localStorage
export function saveWordsToLocalStorage() {
    localStorage.setItem('hangmanWordsByLanguage', JSON.stringify(wordsByLanguage));
}

// Função para carregar palavras do localStorage
export function loadWordsFromLocalStorage() {
    const storedWords = localStorage.getItem('hangmanWordsByLanguage');
    if (storedWords) {
        const parsedWords = JSON.parse(storedWords);
        // Atualizar o objeto wordsByLanguage com os dados armazenados
        Object.keys(parsedWords).forEach(lang => {
            wordsByLanguage[lang] = parsedWords[lang];
        });
    }
    return wordsByLanguage;
}