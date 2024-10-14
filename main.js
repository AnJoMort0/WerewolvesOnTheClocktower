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
        [n] Puder juntar jogadores manualmente (+ trocar personagens)
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
const mandatory = [1, 2, 3, 4, 5]
const upTo10 = [7, 10, 11, 14, 16, 31, 32, 26, 21, 22, 23, 24];
const upTo15 = [7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 19, 31, 32, 20, 26, 30, 27, 21, 22, 23, 24];
const upTo20 = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 29, 30, 31, 32];
const upToInf= [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 29, 30, 31, 32, 28];

// Fixed values
const maxChar   = allCharacters.length;
const minChar   = 8;
const wolfRatio = 3;

//BEGINNING OF THE PROGRAM
document.addEventListener('DOMContentLoaded', () => {
    // Create a container for player input
    const playerInputContainer = document.createElement('div');
    playerInputContainer.id = 'player-input-container';
    
    // Create label for the player input
    const playerInputLabel = document.createElement('label');
    playerInputLabel.setAttribute('for', 'player-count');
    playerInputLabel.textContent = `Número de Jogadores: `;
    
    // Create input field for number of players
    const playerInput = document.createElement('input');
    playerInput.type = 'number';
    playerInput.id = 'player-count';
    playerInput.min = '8';
    playerInput.placeholder = `Insira o número de jogadores (mínimo 8)`; 
    
    // Create confirm button
    const confirmButton = document.createElement('button');
    confirmButton.textContent = `Confirmar`;
    confirmButton.addEventListener('click', generateRandomCharacters);
    
    // Append label, input, and button to the container
    playerInputContainer.appendChild(playerInputLabel);
    playerInputContainer.appendChild(playerInput);
    playerInputContainer.appendChild(confirmButton);
  
    // Append the container to the body element
    document.body.appendChild(playerInputContainer);
});

function generateRandomCharacters() {
    const playerCount = parseInt(document.getElementById('player-count').value);
    if (isNaN(playerCount) || playerCount < minChar) {
        alert(`Número inválido de jogadores. Insira um número igual ou maior a ${minChar}`);
        return;
    }

    let availablePool = [];
    if (playerCount <= 10) {
        availablePool = [...upTo10];
    } else if (playerCount <= 15) {
        availablePool = [...upTo15];
    } else if (playerCount <= 20) {
        availablePool = [...upTo20];
    } else {
        availablePool = [...upToInf];
    }

    const nonMandatoryCount = playerCount - mandatory.length;
    while (availablePool.length < nonMandatoryCount) {
        availablePool.push(0);
        if (availablePool.length % wolfRatio === 0) {
            availablePool.push(1);
        }
    }

    const selectedCharacters = [];
    for (let i = 0; i < nonMandatoryCount; i++) {
        const randomIndex = Math.floor(Math.random() * availablePool.length);
        selectedCharacters.push(availablePool[randomIndex]);
        availablePool.splice(randomIndex, 1);
    }

    if (selectedCharacters.includes(15)) {
        const indexToReplace = selectedCharacters.findIndex(num => num === 0) !== -1 ? selectedCharacters.findIndex(num => num === 0) : selectedCharacters.findIndex(num => num !== 15);
        if (indexToReplace !== -1) {
            selectedCharacters[indexToReplace] = 152;
        }
    }

    if (selectedCharacters.includes(28)) {
        let replaceCount = 0;
        for (let i = 0; i < selectedCharacters.length && replaceCount < 2; i++) {
            if (selectedCharacters[i] === 0 || (selectedCharacters[i] !== 15 && selectedCharacters[i] !== 152)) {
                selectedCharacters[i] = replaceCount === 0 ? 282 : 283;
                replaceCount++;
            }
        }
    }

    const finalCharacters = [...mandatory, ...selectedCharacters];

    // Create a new array that includes mandatory, respective upTo array, and 0
    const dropdownOptions = [...mandatory, ...availablePool, 0];

    // Shuffle final characters
    for (let i = finalCharacters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [finalCharacters[i], finalCharacters[j]] = [finalCharacters[j], finalCharacters[i]];
    }

    // Clear current input elements
    document.body.innerHTML = '';

    // Create container for displaying the final characters
    const resultContainer = document.createElement('div');
    resultContainer.id = 'result-container';

    // Display each character in a drop-down menu with the character value
    finalCharacters.forEach(character => {
        const characterSelect = document.createElement('select');
        characterSelect.classList.add('character-select');

        // Add an empty option
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = '';
        characterSelect.appendChild(emptyOption);

        // Add the character as the selected option
        const characterOption = document.createElement('option');
        characterOption.value = character;
        characterOption.textContent = character;
        characterOption.selected = true;
        characterSelect.appendChild(characterOption);

        // Add all options from the new dropdownOptions array
        dropdownOptions.forEach(optionValue => {
            if (optionValue !== character) {
                const option = document.createElement('option');
                option.value = optionValue;
                option.textContent = optionValue;
                characterSelect.appendChild(option);
            }
        });

        resultContainer.appendChild(characterSelect);
    });

    // Append result container to body
    document.body.appendChild(resultContainer);

    console.assert(finalCharacters.length === playerCount, 'The final character array length does not match the player count.');
}

//==================================================================================================//
//==================================================================================================//