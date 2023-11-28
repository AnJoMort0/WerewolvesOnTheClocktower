// Function to generate and display the random list
function generateAndDisplay() {
  // Get input and result container elements
  const playerCountInput = document.getElementById('playerCount');
  const resultContainer = document.getElementById('result-container');
  const messagesContainer = document.getElementById('messages-container');

  // Remove the existing result container content
  resultContainer.innerHTML = '';

  // Remove the existing messages container if it exists
  if (messagesContainer) {
    messagesContainer.parentNode.removeChild(messagesContainer);
  }

  // Create a new messages container
  const newMessagesContainer = document.createElement('div');
  newMessagesContainer.id = 'messages-container';
  document.body.appendChild(newMessagesContainer);

  // Parse player count from input
  const playerCount = parseInt(playerCountInput.value);

  // Check if the input is empty
  if (isNaN(playerCount) || playerCount <= 0) {
    newMessagesContainer.innerHTML = "Please add the number of players!";
    return;
  }

  // Generate random list
  const result = generateRandomList(playerCount, newMessagesContainer);

  // Display the result
  if (result) {
    resultContainer.innerHTML = `<p>Result: ${result.join(', ')}</p>`;

    // Create a table with borders
    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse'; // Set border collapse style

    // Create a single row in the table
    const row = table.insertRow();

    // Track the maximum width for cells
    let maxCellWidth = 0;

    // Populate the row with character names and icons
    result.forEach(number => {
        const cell = row.insertCell();
        cell.style.border = '1px solid black'; // Set cell border
        cell.style.textAlign = 'center'; // Center-align the text

        // Add character icon to the cell
        const icon = document.createElement('img');
        icon.src = `images/${number}_icon.png`;
        icon.alt = 'Character Icon';
        icon.classList.add('character-icon'); // Add a class for styling
        cell.appendChild(icon);

        // Add character name text to the cell
        const characterName = getCharacterName(number);
        const textNode = document.createTextNode(characterName);
        cell.appendChild(textNode);

        // Track the width of the icon
        const iconWidth = icon.clientWidth;
        if (iconWidth > maxCellWidth) {
            maxCellWidth = iconWidth;
        }
    });

    // Set the width for all cells based on the width of the icon
    Array.from(row.cells).forEach(cell => {
        cell.style.width = `${Math.max(maxCellWidth, 200)}px`; // Set a minimum width of 50px
    });

    // Append the table to the result container
    resultContainer.appendChild(table);

    // Generate and append images under the table
    result.forEach(number => {
      const img = document.createElement('img');
      img.src = `images/${number}_pt.png`;
      img.setAttribute('data-image-number', number);
      img.classList.add('generated-image'); // Add a class for styling
      resultContainer.appendChild(img);
    });
  }
}

// Function to toggle the display of images
function toggleImages() {
  const images = document.querySelectorAll('.generated-image'); // Use the added class

  // Toggle the display property of each image
  images.forEach(img => {
    img.style.display = (img.style.display === 'none' || !img.style.display) ? 'block' : 'none';
  });
}

// Function to get the character name based on the number
function getCharacterName(number) {
  switch (number) {
    case 1: return 'Lobisomem';
    case 2: return 'Bruxa Malvada';
    case 3: return 'Cupido';
    case 4: return 'Chaman';
    case 5: return 'Vidente';
    case 6: return 'Chefe da Aldeia';
    case 7: return 'Mestre do Urso';
    case 8: return 'Mestre da Raposa';
    case 9: return 'Mestre do Corvo';
    case 10: return 'Menina';
    case 11: return 'Caçador';
    case 12: return 'Cavaleiro Enferrujado';
    case 13: return 'Idiota';
    case 14: return 'Anjo';
    case 15: return 'Irmã';
    case 16: return 'Juiz';
    case 17: return 'Sonâmbulo';
    case 18: return 'Acusador';
    case 19: return 'Hippie';
    case 20: return 'Marionetista';
    case 21: return 'Cão-Lobo';
    case 22: return 'Ladrão';
    case 23: return 'Criança Selvagem';
    case 24: return 'Lobisomem Branco';
    case 25: return 'Chefe dos Lobisomens';
    case 26: return 'Lobisomem Vampiro';
    case 27: return 'Ankou';
    case 28: return 'Irmão';
    default: return 'Unknown Character';
  }
}

// Function to generate a random list based on player count
function generateRandomList(x, messagesContainer) {
  // Initial result array with fixed numbers
  const result = [1, 2, 3, 4, 5];
  // Array of available numbers
  let availableNumbers = [];

  // Check if messagesContainer is defined
  if (!messagesContainer) {
    console.error('Error: messagesContainer is not defined.');
    return;
  }

  // Set available numbers based on player count
  if (x < 8) {
    messagesContainer.innerHTML = "Not enough players!";
    return;
  } else if (x < 12) {
    availableNumbers = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
  } else if (x < 22) {
    availableNumbers = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27];
  } else if (x < 32) {
    availableNumbers = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28];
  } else {
    messagesContainer.innerHTML = "Too many players!";
    return;
  }

  // Loop to add random numbers to the result array
  while (result.length < x && availableNumbers.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const randomNumber = availableNumbers.splice(randomIndex, 1)[0];

    result.push(randomNumber);

    // Add extra numbers based on specific conditions
    if (randomNumber === 15 && result.length < x - 1) {
      result.push(15);
    }

    if (randomNumber === 28 && result.length < x - 2) {
      result.push(28, 28);
    }
  }

  // Shuffle the final result array
  shuffleArray(result);
  return result;
}

// Function to shuffle an array
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
