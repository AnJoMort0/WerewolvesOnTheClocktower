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

// Create message div for error messages
const messageDiv = document.createElement('div');
messageDiv.id = 'message';
container.appendChild(messageDiv);

// Create container for additional input fields
const fieldsDiv = document.createElement('div');
fieldsDiv.id = 'numberFields';
container.appendChild(fieldsDiv);

// Function to generate additional input fields
function generateFields() {
    const numPlayers = parseInt(numPlayersInput.value);

    // Clear previous messages and fields
    messageDiv.textContent = '';
    fieldsDiv.innerHTML = '';

    if (isNaN(numPlayers) || numPlayers < 8) {
        messageDiv.textContent = `Tens que ter no mínimo 8 jogadores para jogar.`; // UI text
    } else {
        // Remove numPlayersInput and sendButton
        numPlayersInput.remove();
        sendButton.remove();

        // Function to add an input field
        function addInputField() {
            const input = document.createElement('input');
            input.type = 'text'; // Changed type to 'text' for dynamic sizing
            input.value = ''; // No placeholder or value

            // Set initial width
            input.style.width = '1ch';

            // Adjust width based on content
            input.addEventListener('input', function() {
                // Set the width based on the length of the content
                this.style.width = ((this.value.length + 1) * 1) + 'ch';
            });

            // Add comma before input if not the first one
            if (fieldsDiv.children.length > 0) {
                fieldsDiv.appendChild(document.createTextNode(', '));
            }

            fieldsDiv.appendChild(input);
        }

        // Add initial input fields
        for (let i = 1; i <= numPlayers; i++) {
            addInputField();
        }

        // Create the '+' button
        const addButton = document.createElement('button');
        addButton.textContent = `+`; // UI text
        addButton.id = 'addButton';

        // Add the '+' button to the container
        container.appendChild(addButton);

        // Event listener for '+' button
        addButton.addEventListener('click', function() {
            addInputField();
        });
    }
}