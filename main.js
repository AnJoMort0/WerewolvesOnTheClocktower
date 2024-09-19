// script.js

// Create and append elements to the document body

// Create a container div
const container = document.createElement('div');
document.body.appendChild(container);

// Create a heading
const heading = document.createElement('h1');
heading.textContent = `Escreva o número de jogadores`; // UI text
container.appendChild(heading);

// Create input field for number of players
const numPlayersInput = document.createElement('input');
numPlayersInput.type = 'number';
numPlayersInput.min = '8';
numPlayersInput.placeholder = `Insira um número`; // UI text
numPlayersInput.id = 'numPlayers';
container.appendChild(numPlayersInput);

// Create send button
const sendButton = document.createElement('button');
sendButton.textContent = `Enviar`; // UI text
sendButton.addEventListener('click', generateFields);
container.appendChild(sendButton);

// Create the '+' button (we will append it later)
const addButton = document.createElement('button');
addButton.textContent = `+`; // UI text
addButton.id = 'addButton';

// Create container for additional input fields
const fieldsDiv = document.createElement('div');
fieldsDiv.id = 'numberFields';

// Create message div for error messages
const messageDiv = document.createElement('div');
messageDiv.id = 'message';

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
        // Remove numPlayersInput, sendButton, and heading
        numPlayersInput.remove();
        sendButton.remove();
        heading.remove();

        // Append the '+' button above the fields
        container.appendChild(addButton);

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

            // Calculate extra players beyond available numbers
            let extraPlayers = playerCount - availableNumbers.length;
            let extraZeros = 0;
            let extraOnes = 0;
            if (extraPlayers > 0) {
                for (let i = 0; i < extraPlayers; i++) {
                    if ((i + 1) % 4 === 0) {
                        availableNumbers.push(1);
                        extraOnes++;
                    } else {
                        availableNumbers.push(0);
                        extraZeros++;
                    }
                }
            }

            // Return available numbers and counts of extra ones and zeros
            return {
                numbers: availableNumbers,
                extraOnes: extraOnes,
                extraZeros: extraZeros
            };
        }

        // Initialize available numbers and counts
        let { numbers: availableNumbers, extraOnes, extraZeros } = getAvailableNumbers(totalPlayers);

        // Function to add a select field
        function addSelectField() {
            const select = document.createElement('select');

            // Empty option
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = '';
            select.appendChild(emptyOption);

            // Event listener for changes
            select.addEventListener('change', function() {
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
            ({ numbers: availableNumbers, extraOnes, extraZeros } = getAvailableNumbers(playerCount));

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

                availableNumbers.forEach(number => {
                    const option = document.createElement('option');
                    option.value = number;
                    option.textContent = number;

                    let countAllowed = 1;
                    if (number == 15) {
                        countAllowed = 2; // 15 can appear twice
                    } else if (number == 28) {
                        countAllowed = 3; // 28 can appear three times
                    } else if (number == 0) {
                        // zeros can appear multiple times as per the extra zeros
                        countAllowed = extraZeros;
                    } else if (number == 1) {
                        // ones can appear once (mandatory) plus extra ones
                        countAllowed = 1 + extraOnes;
                    }

                    let countSelected = counts[number] || 0;

                    if (number == currentValue) {
                        // Temporarily reduce countSelected if it's the current value
                        countSelected--;
                    }

                    if (countSelected < countAllowed) {
                        select.appendChild(option);
                    }
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

            // Check occurrences of 15 and 28, but only if the user has selected them
            const count15 = selectedValues.filter(value => value === 15).length;
            if (count15 > 0 && count15 < 2) {
                errors.push(`O número 15 deve aparecer duas vezes.`); // UI text
            }

            const count28 = selectedValues.filter(value => value === 28).length;
            if (count28 > 0 && count28 < 3) {
                errors.push(`O número 28 deve aparecer três vezes.`); // UI text
            }

            // Check for duplicates (excluding 15, 28, and 0)
            const counts = {};
            selectedValues.forEach(value => {
                if (value !== 15 && value !== 28 && value !== 0) {
                    counts[value] = (counts[value] || 0) + 1;
                }
            });

            for (const [number, count] of Object.entries(counts)) {
                let allowedCount = 1;
                if (number == 1) {
                    allowedCount = 1 + extraOnes; // Mandatory 1 plus extra ones
                }
                if (count > allowedCount) {
                    errors.push(`O número ${number} só pode aparecer ${allowedCount} vezes.`); // UI text
                }
            }

            // Display errors on separate lines
            if (errors.length > 0) {
                messageDiv.innerHTML = errors.join('<br>');
            } else {
                messageDiv.innerHTML = '';
            }
        }

        // Add initial select fields
        for (let i = 1; i <= totalPlayers; i++) {
            addSelectField();
        }

        // Event listener for '+' button
        addButton.addEventListener('click', function() {
            totalPlayers++;
            addSelectField();
            updateSelectOptions();
        });
    }
}