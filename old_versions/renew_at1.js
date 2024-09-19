//==================================================================================================//
//==================================================================================================//

//Werewolves on the Clocktower Guide Companion
//by AnJoMorto

//Planned updates:
  //Automate in script the characters with neighbours (yes or no bear, fox)
  //Testdrive observations
    /**
        [ ] Saber quem foi roubado.
        [ ] Lista dos mortos da última noite
        [v] Saber quem é mau.
        [ ] Vitória. (Não esquecer Chefe Aldeia e Lobisomem -> pop-up
        [v] 5min
        [v] Vidente vê todos os mortos
        [ ] Indicar quem é o pai da criança + automatico
        [v] Meter as equipas mais comprehensive
        [v] A Raposa só começa na segunda noite
        [v] Fazer o Juiz ser Ankou dos bons
        [v] Ação para o fantasma do cupido
        [ ] Puder juntar jogadores manualmente (+ trocar personagens)
        [ ] Namorados automático (inclui Cúpido envenenado)
        [ ] Bode Expiatório automático 
        [ ] Forma mais fácil de mostrar cartas a Vidente (clicar no logo/nome + na lista dos mortos) + Alerta no Guião 
        [ ] Botão para Hover Result Numbers para só mostrar um de cada vez
        [ ] Juntar um "Alert" quando tenho que avisar alguém que foi envenenado
        [ ] Imunidade do Hippie automática (e também do Inimigo)
        [ ] Morto com o caçador automático 
        [v] Serial Killer: Pode matar durante o dia 1×
     */
  //Add player names to the script when necessary (second night friends)
  //Hover the numbers in the result and see the characters name
  //Link to the rule Docs Document for now : https://docs.google.com/document/d/1aV9II9br_8ln4zrA7wgHRByBLqyb8EzkOqc2ltHGCes/edit?usp=sharing
  //Automate Round turning and add built-in timer for the day after the script (+ play sound when timer start/over)
  //Later
    //New characters
    //Drunk character (togglable)
    //FR language
    //EN language
  
//Known bugs (order of importance):
  //Bonus Werewolfs have the text "Aldeão Triste"
  //If I regenerate multiple times whitout reloading the page, the number count is not accurate anymore

//==================================================================================================//
//==================================================================================================//

//Character lists
/*
0 - Aldeão Triste
1 - Lobisomem
2 - Bruxa Malvada
3 - Cupido
4 - Chaman
5 - Vidente
6 - Chefe da Aldeia
7 - Mestre do Urso
8 - Mestre da Raposa
9 - Mestre do Corvo
10 - Menina
11 - Caçador
12 - Cavaleiro Enferrujado
13 - Idiota
14 - Anjo
15 - Irmãs (2x)
16 - Juíz
17 - Sonâmbulo
18 - Acusador
19 - Hippie
20 - Marionetista
21 - Cão-Lobo
22 - Ladrão
23 - Criança Selvagem
24 - Lobisomem Branco
25 - Chefe dos Lobisomens
26 - Lobisomem Vampiro
27 - Ankou
28 - Irmãos (3x)
29 - Ator
30 - Lobisomem Vidente
31 - Paranoico
32 - Pirômano
*/

// Constants for character groups
const goodCharacters          = [0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 152, 16, 17, 18, 19, 20, 29, 31, 32, 28, 282, 283]; // all the folk characters
const flexibleCharacters      = [21, 22, 23, 24]; // all the choosing characters
const badCharacters           = [1, 2, 25, 26, 30, 27]; // all the wolves and allies
const allCharacters           = [...goodCharacters, ...flexibleCharacters, ...badCharacters]; // everyone

const availableFakeCharacters       = [6, 7, 8, 9, 10, 11, 12, 14, 16, 17, 18, 19, 20, 29, 31, 32]; // all characters that can be proposed as fake characters
const availableAllies               = [2, 27, 21, 22]; // all non-wolf bad characters
const availablePoisonableCharacters = [3, 13, 15, 20, 21, 23, 28]; // all characters whose poison status need to be informed to the person
const availablePlayableCharacters   = []; // all characters that can be played by the actor

// Character Balancing depending on Player count
const upTo10 = [7, 10, 11, 14, 16, 31, 32, 26, 21, 22, 23, 24];
const upTo15 = [7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 19, 31, 32, 20, 26, 30, 27, 21, 22, 23, 24];
const upTo20 = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 29, 30, 31, 32];
const upToInf= [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 29, 30, 31, 32, 28];

// Fixed values
const maxChar = allCharacters.length; // need to make it so the maximum amount of characters is dependent on the list length
const wolfRatio = 4;

//==================================================================================================//

// Function to initialize the UI and generate initial elements
function initializeUI() {
    const mainContent = document.getElementById('mainContent');

    const label = document.createElement('label');
    label.setAttribute('for', 'player-count');
    label.textContent = 'Número de Jogadores:';
    mainContent.appendChild(label);

    const input = document.createElement('input');
    input.type = 'number';
    input.id = 'player-count';
    input.min = 8;
    input.placeholder = 'Insira o número de jogadores';
    mainContent.appendChild(input);

    const button = document.createElement('button');
    button.id = 'confirmBtn';
    button.textContent = 'Confirmar';
    mainContent.appendChild(button);

    const resultContainer = document.createElement('div');
    resultContainer.id = 'result-container';
    mainContent.appendChild(resultContainer);

    button.addEventListener('click', generateAndDisplay);
}

// Function to generate and display the player list and additional elements
function generateAndDisplay() {
    const playerCountInput = document.getElementById('player-count');
    const resultContainer = document.getElementById('result-container');
    const playerCount = parseInt(playerCountInput.value);

    if (isNaN(playerCount) || playerCount < 8) {
        resultContainer.innerHTML = "Por favor insira um número válido de jogadores (mínimo 8).";
        return;
    }

    const result = generatePlayerNumbers(playerCount);
    displayResult(resultContainer, result);
}

// Function to generate the shuffled list based on the number of players
function generatePlayerNumbers(numPlayers) {
    let chosenArray = [];
    if (numPlayers <= 10) {
        chosenArray = upTo10;
    } else if (numPlayers <= 15) {
        chosenArray = upTo15;
    } else if (numPlayers <= 20) {
        chosenArray = upTo20;
    } else {
        chosenArray = upToInf;
    }

    const combinedArray = [1, 2, 3, 4, 5].concat(chosenArray);
    const shuffledArray = shuffleArray(combinedArray);

    return shuffledArray.slice(0, numPlayers);
}

// Function to display the result in the UI
function displayResult(container, result) {
    container.innerHTML = `<p>Resultado: ${result.join(', ')}</p>`;

    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';

    const playersRow = table.insertRow();
    playersRow.insertCell().appendChild(document.createTextNode('Jogadores'));
    const charactersRow = table.insertRow();
    charactersRow.insertCell().appendChild(document.createTextNode('Personagens'));
    const poisonedRow = table.insertRow();
    poisonedRow.insertCell().appendChild(document.createTextNode('Envenenado'));
    const deadRow = table.insertRow();
    deadRow.insertCell().appendChild(document.createTextNode('Morto'));
    const doneRow = table.insertRow();
    doneRow.insertCell().appendChild(document.createTextNode('Acabou'));
    const notesRow = table.insertRow();
    notesRow.insertCell().appendChild(document.createTextNode('Anotações'));

    result.forEach(number => {
        const playerCell = playersRow.insertCell();
        const playerNameInput = document.createElement('input');
        playerNameInput.type = 'text';
        playerNameInput.id = `player-name-${number}`;
        playerCell.appendChild(playerNameInput);

        const characterCell = charactersRow.insertCell();
        characterCell.classList.add('character-cell');
        const icon = document.createElement('img');
        icon.src = getCharacterIconPath(number);
        icon.classList.add('character-icon');
        characterCell.appendChild(icon);
        const characterName = getCharacterName(number);
        const nameContainer = document.createElement('span');
        nameContainer.textContent = characterName;
        nameContainer.classList.add('default');
        characterCell.appendChild(nameContainer);

        const poisonedCell = poisonedRow.insertCell();
        const poisonedRadio = document.createElement('input');
        poisonedRadio.type = 'radio';
        poisonedRadio.name = 'poisoned';
        poisonedRadio.value = number;
        poisonedCell.appendChild(poisonedRadio);

        const deadCell = deadRow.insertCell();
        const deadSwitch = document.createElement('input');
        deadSwitch.type = 'checkbox';
        deadSwitch.value = number;
        deadCell.appendChild(deadSwitch);

        const doneCell = doneRow.insertCell();
        const doneSwitch = document.createElement('input');
        doneSwitch.type = 'checkbox';
        doneSwitch.value = number;
        doneCell.appendChild(doneSwitch);

        const notesTextAreaCell = notesRow.insertCell();
        const notesTextArea = document.createElement('textarea');
        notesTextArea.rows = 3;
        notesTextArea.id = `notes-${number}`;
        notesTextAreaCell.appendChild(notesTextArea);
    });

    container.appendChild(table);

    addEventListeners();
}

// Function to get the character icon path based on the number
function getCharacterIconPath(number) {
    const numberString = String(number);
    if (numberString.startsWith('0')) {
        const x = numberString.substring(1);
        return x % wolfRatio === 0 ? `images/1_icon.png` : `images/0_icon.png`;
    }
    return `images/${numberString}_icon.png`;
}

// Function to get the character name based on the number
function getCharacterName(number) {
    const characterNames = {
        1: 'Lobisomem',
        2: 'Bruxa Malvada',
        3: 'Cupido',
        4: 'Chaman',
        5: 'Vidente',
        6: 'Chefe da Aldeia',
        7: 'Mestre do Urso',
        8: 'Mestre da Raposa',
        9: 'Mestre do Corvo',
        10: 'Menina',
        11: 'Caçador',
        12: 'Cavaleiro Enferrujado',
        13: 'Idiota',
        14: 'Anjo',
        15: 'Irmã',
        16: 'Juiz',
        17: 'Sonâmbulo',
        18: 'Acusador',
        19: 'Hippie',
        20: 'Marionetista',
        21: 'Cão-Lobo',
        22: 'Ladrão',
        23: 'Criança Selvagem',
        24: 'Lobisomem Branco',
        25: 'Chefe dos Lobisomens',
        26: 'Lobisomem Vampiro',
        27: 'Ankou',
        28: 'Irmão',
        29: 'Ator',
        30: 'Lobisomem Vidente',
        31: 'Paranoico',
        32: 'Pirômano',
        152: 'Irmã',
        282: 'Irmão',
        283: 'Irmão'
    };
    return characterNames[number] || 'Aldeão Triste';
}

// Function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Function to add event listeners for poisoned and dead statuses
function addEventListeners() {
    const poisonedRadios = document.querySelectorAll('input[name="poisoned"]');
    const deadSwitches = document.querySelectorAll('input[type="checkbox"]');

    poisonedRadios.forEach(radio => {
        radio.addEventListener('change', handlePoisonedChange);
    });

    deadSwitches.forEach(switchElem => {
        switchElem.addEventListener('change', handleDeadChange);
    });
}

// Function to handle poisoned status change
function handlePoisonedChange(event) {
    const characterNumber = event.target.value;
    const characterNameElement = document.getElementById(`character-name-${characterNumber}`);
    const characterIconElement = document.getElementById(`character-icon-${characterNumber}`);

    document.querySelectorAll('.poisoned-character').forEach(el => el.classList.remove('poisoned-character'));
    document.querySelectorAll('.poisoned-icon').forEach(el => el.classList.remove('poisoned-icon'));

    if (event.target.checked) {
        characterNameElement.classList.add('poisoned-character');
        characterIconElement.classList.add('poisoned-icon');
    }
}

// Function to handle dead status change
function handleDeadChange(event) {
    const characterNumber = event.target.value;
    const characterNameElement = document.getElementById(`character-name-${characterNumber}`);
    const characterIconElement = document.getElementById(`character-icon-${characterNumber}`);

    if (event.target.checked) {
        characterNameElement.classList.add('dead-character');
        characterIconElement.classList.add('dead-character');
    } else {
        characterNameElement.classList.remove('dead-character');
        characterIconElement.classList.remove('dead-character');
    }
}

// Initialize the UI when the DOM content is loaded
document.addEventListener('DOMContentLoaded', initializeUI);