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
const upTo10 = [7, 10, 11, 14, 16, 31, 32, 26, 21, 22, 23, 24];
const upTo15 = [7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 19, 31, 32, 20, 26, 30, 27, 21, 22, 23, 24];
const upTo20 = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 29, 30, 31, 32];
const upToInf= [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 29, 30, 31, 32, 28];

// Fixed values
const maxChar   = allCharacters.length; // need to make it so the maximum amount of characters is dependent on the list length
const minChar   = 8;
const wolfRatio = 4;

//BEGINNING OF THE PROGRAM
// Create a container div
const container = document.createElement('div');
document.body.appendChild(container);

// Create a heading
const heading       = document.createElement('h1');
heading.textContent = `Escreva o número de jogadores`; // UI text
container.appendChild(heading);

// Create input field for number of players
const numPlayersInput       = document.createElement('input');
numPlayersInput.type        = 'number';
numPlayersInput.min         = minChar;
numPlayersInput.placeholder = `Insira um número`; // UI text
numPlayersInput.id          = 'numPlayers';
container.appendChild(numPlayersInput);

// Create send button
const confirmButton            = document.createElement('button');
confirmButton.textContent      = `Confirmar`; // UI text
confirmButton.addEventListener('click', generateFields);
container.appendChild(confirmButton);

// Create the '+' button (we will append it later)
const addButton                 = document.createElement('button');
addButton.textContent           = `+`; // UI text
addButton.id                    = 'addButton';

// Create the 'Preencher' button (Fill)
const fillButton                = document.createElement('button');
fillButton.textContent          = `Preencher`; // UI text
fillButton.id                   = 'fillButton';

// Create container for additional input fields
const fieldsDiv = document.createElement('div');
fieldsDiv.id    = 'numberFields';

// Create message div for error messages
const messageDiv    = document.createElement('div');
messageDiv.id       = 'message';

// Function to generate additional input fields
function generateFields() {
    let totalPlayers = parseInt(numPlayersInput.value);

    // Clear previous messages and fields
    messageDiv.textContent = '';
    fieldsDiv.innerHTML = '';

    if (isNaN(totalPlayers) || totalPlayers < 8) {
        messageDiv.textContent = `Tens que ter no mínimo 8 jogadores para jogar.`; // UI text
        container.appendChild(messageDiv);
    } else {
        // Remove numPlayersInput, confirmButton, and heading
        numPlayersInput.remove();
        confirmButton.remove();
        heading.remove();

        // Append the '+' and 'Preencher' buttons above the fields
        container.appendChild(addButton);
        container.appendChild(fillButton);

        // Append the fieldsDiv
        container.appendChild(fieldsDiv);

        // Append the messageDiv below the fieldsDiv
        container.appendChild(messageDiv);

        // Function to determine available numbers based on the number of players
        function getAvailableNumbers(playerCount) {
            const mandatoryNumbers = [1, 2, 3, 4, 5];
            let additionalNumbers = [];

            if (playerCount <= 10) {
                additionalNumbers = [7, 10, 11, 14, 16, 31, 32, 26, 21, 22, 23, 24];
            } else if (playerCount <= 15) {
                additionalNumbers = [7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 19, 31, 32, 20, 26, 30, 27, 21, 22, 23, 24];
            } else if (playerCount <= 20) {
                additionalNumbers = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 29, 30, 31, 32];
            } else {
                additionalNumbers = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 29, 30, 31, 32, 28];
            }

            let availableNumbers = mandatoryNumbers.concat(additionalNumbers);

            // Allowed counts for numbers that can appear multiple times
            const allowedCounts = {
                15: 2,
                28: 3
            };

            // Total count of numbers considering allowed counts
            let totalAvailableCount = availableNumbers.length;

            for (let number in allowedCounts) {
                if (availableNumbers.includes(parseInt(number))) {
                    totalAvailableCount += allowedCounts[number] - 1; // Since it's already counted once
                }
            }

            // Calculate extra players beyond available numbers
            let extraPlayers = playerCount - totalAvailableCount;
            let extraZeros = 0;
            let extraOnes = 0;
            if (extraPlayers > 0) {
                for (let i = 0; i < extraPlayers; i++) {
                    if ((i + 1) % 4 === 0) {
                        extraOnes++;
                    } else {
                        extraZeros++;
                    }
                }
            }

            // Return available numbers and counts of extra ones and zeros
            return {
                numbers: availableNumbers,
                allowedCounts: allowedCounts,
                extraOnes: extraOnes,
                extraZeros: extraZeros
            };
        }

        // Initialize available numbers and counts
        let { numbers: availableNumbers, allowedCounts, extraOnes, extraZeros } = getAvailableNumbers(totalPlayers);

        // Function to add a select field
        function addSelectField() {
            const select = document.createElement('select');

            // Empty option
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = '';
            select.appendChild(emptyOption);

            // Event listener for changes
            select.addEventListener('change', function () {
                updateSelectOptions();
                validateSelections();
            });

            // Add comma before select if not the first one
            if (fieldsDiv.children.length > 0) {
                fieldsDiv.appendChild(document.createTextNode(', '));
            }

            fieldsDiv.appendChild(select);

            updateSelectOptions();
            validateSelections();
        }

        // Function to update options in all select fields
        function updateSelectOptions() {
            const selects = fieldsDiv.querySelectorAll('select');
            const selectedValues = Array.from(selects).map(select => select.value);

            const playerCount = selects.length;

            // Update available numbers and counts in case total players changed
            ({ numbers: availableNumbers, allowedCounts, extraOnes, extraZeros } = getAvailableNumbers(playerCount));

            // Build a map of number counts
            let counts = {};
            selectedValues.forEach(value => {
                if (value) {
                    counts[value] = (counts[value] || 0) + 1;
                }
            });

            selects.forEach(select => {
                const currentValue = select.value;
                // Clear all options
                select.innerHTML = '';

                // Empty option
                const emptyOption = document.createElement('option');
                emptyOption.value = '';
                emptyOption.textContent = '';
                select.appendChild(emptyOption);

                // Calculate allowed counts for each number
                let numberOptions = {};

                availableNumbers.forEach(number => {
                    let countAllowed = allowedCounts[number] || 1;

                    // Adjust count for numbers that can appear multiple times
                    if (number == 15 || number == 28) {
                        countAllowed = allowedCounts[number];
                    }

                    // Adjust counts for extra zeros and ones
                    if (number == 0) {
                        countAllowed = extraZeros;
                    }
                    if (number == 1) {
                        countAllowed = 1 + extraOnes; // Mandatory 1 plus extra ones
                    }

                    let countSelected = counts[number] || 0;

                    if (number == currentValue) {
                        // Temporarily reduce countSelected if it's the current value
                        countSelected--;
                    }

                    if (countSelected < countAllowed) {
                        numberOptions[number] = true;
                    }
                });

                // Only add zeros and extra ones if necessary
                if (Object.keys(numberOptions).length < playerCount) {
                    // Add zeros and ones if we don't have enough numbers
                    if (extraZeros > 0) numberOptions[0] = true;
                    if (extraOnes > 0) numberOptions[1] = true;
                }

                // Add options to select
                Object.keys(numberOptions).forEach(number => {
                    const option = document.createElement('option');
                    option.value = number;
                    option.textContent = number;
                    select.appendChild(option);
                });

                // Restore the current value
                select.value = currentValue;
            });
        }

        // Validation function
        function validateSelections() {
            const selects = fieldsDiv.querySelectorAll('select');
            const selectedValues = Array.from(selects).map(select => parseInt(select.value)).filter(value => !isNaN(value));

            const errors = [];

            // Check mandatory numbers 1-5
            for (let i = 1; i <= 5; i++) {
                if (!selectedValues.includes(i)) {
                    errors.push(`O número ${i} é obrigatório.`); // UI text
                }
            }

            // Check occurrences of 15 and 28
            const count15 = selectedValues.filter(value => value === 15).length;
            if (count15 > 0 && count15 < 2) {
                errors.push(`O número 15 deve aparecer duas vezes.`); // UI text
            }

            const count28 = selectedValues.filter(value => value === 28).length;
            if (count28 > 0 && count28 < 3) {
                errors.push(`O número 28 deve aparecer três vezes.`); // UI text
            }

            // Check for duplicates (excluding numbers that can appear multiple times)
            const counts = {};
            selectedValues.forEach(value => {
                let allowedCount = allowedCounts[value] || 1;
                if (value !== 15 && value !== 28 && value !== 0 && value !== 1) {
                    counts[value] = (counts[value] || 0) + 1;
                    if (counts[value] > allowedCount) {
                        errors.push(`O número ${value} só pode aparecer ${allowedCount} vez.`); // UI text
                    }
                }
            });

            // Display errors on separate lines
            if (errors.length > 0) {
                messageDiv.innerHTML = errors.join('<br>');
            } else {
                messageDiv.innerHTML = '';
            }
        }

        // Function to fill empty select fields with random valid numbers
        function fillEmptyFields() {
            const selects = Array.from(fieldsDiv.querySelectorAll('select'));
            const selectedValues = selects.map(select => select.value);

            const playerCount = selects.length;

            // Update available numbers and counts
            ({ numbers: availableNumbers, allowedCounts, extraOnes, extraZeros } = getAvailableNumbers(playerCount));

            // Build counts of selected numbers
            let counts = {};
            selectedValues.forEach(value => {
                if (value) {
                    counts[value] = (counts[value] || 0) + 1;
                }
            });

            // Build a list of numbers to assign
            let numbersToAssign = [];

            // Mandatory numbers 1-5
            for (let i = 1; i <= 5; i++) {
                if (!selectedValues.includes(i.toString())) {
                    numbersToAssign.push(i);
                }
            }

            // Numbers that can appear multiple times
            [15, 28].forEach(number => {
                let requiredCount = allowedCounts[number];
                let selectedCount = counts[number] || 0;
                for (let i = selectedCount; i < requiredCount; i++) {
                    numbersToAssign.push(number);
                }
            });

            // Remaining numbers pool, filtered by current selection counts
            let remainingNumbers = availableNumbers.filter(number => {
                let allowedCount = allowedCounts[number] || 1;
                let selectedCount = counts[number] || 0;
                return selectedCount < allowedCount;
            });

            // Shuffle the remaining numbers to ensure randomness
            remainingNumbers.sort(() => Math.random() - 0.5);

            // Fill the numbersToAssign array until it matches the number of empty fields
            while (numbersToAssign.length < selects.filter(select => !select.value).length) {
                // If remaining numbers are available, add them randomly to numbersToAssign
                if (remainingNumbers.length > 0) {
                    numbersToAssign.push(remainingNumbers.pop());
                } else {
                    // Fill with extra zeros or ones if needed
                    if (extraZeros > 0) {
                        numbersToAssign.push(0);
                        extraZeros--;
                    } else if (extraOnes > 0) {
                        numbersToAssign.push(1);
                        extraOnes--;
                    } else {
                        break; // No more valid numbers to assign
                    }
                }
            }

            // Shuffle the list again to ensure randomness
            numbersToAssign.sort(() => Math.random() - 0.5);

            // Assign numbers to empty selects
            selects.forEach(select => {
                if (!select.value && numbersToAssign.length > 0) {
                    let number = numbersToAssign.pop();
                    select.value = number;
                    counts[number] = (counts[number] || 0) + 1;
                }
            });

            updateSelectOptions();
            validateSelections();
        }

        // Add initial select fields
        for (let i = 1; i <= totalPlayers; i++) {
            addSelectField();
        }

        // Event listener for '+' button
        addButton.addEventListener('click', function () {
            totalPlayers++;
            addSelectField();
            updateSelectOptions();
        });

        // Event listener for 'Preencher' button
        fillButton.addEventListener('click', function () {
            fillEmptyFields();
        });
    }
}