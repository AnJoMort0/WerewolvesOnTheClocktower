//Werewolves on thr Clocktower Guide Companion
//by AnJoMorto

// Function to generate and display the random list
function generateAndDisplay() {
  // Get input and result container elements
  const playerCountInput = document.getElementById('playerCount');
  const resultContainer = document.getElementById('result-container');
  const messagesContainer = document.getElementById('messages-container');

  // Clear existing result content
  resultContainer.innerHTML = '';

  // Remove existing messages container if it exists
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

  //Remove the result from the fake characters list
  const availableFakeCharacters = [6, 7, 8, 9, 10, 11, 12, 14, 16, 17, 18, 19, 20];
  const fakeCharacters = availableFakeCharacters.filter(element => !result.includes(element));
  console.log(fakeCharacters);

  // Display the result
  if (result) {
    resultContainer.innerHTML = `<p>Result: ${result.join(', ')}</p>`;

    // Create a table for characters, poisoned, dead, players, and notes rows
    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';

    // Create rows for players, characters, poisoned, dead, and notes
    const playersRow = table.insertRow();
    const charactersRow = table.insertRow();
    const poisonedRow = table.insertRow();
    poisonedRow.insertCell().appendChild(document.createTextNode('Poisoned'));
    const deadRow = table.insertRow();
    deadRow.insertCell().appendChild(document.createTextNode('Dead'));
    const notesRow = table.insertRow();
    const notesCell = notesRow.insertCell();
    notesCell.appendChild(document.createTextNode('Notes'));

    let maxCellWidth = 0;

    // Add "Players" text to the first cell of the players row
    const playersCell = playersRow.insertCell();
    playersCell.appendChild(document.createTextNode('Players'));

    // Populate players row with text boxes for player names
    result.forEach((number, index) => {
      const playerCell = playersRow.insertCell();
      const playerNameInput = document.createElement('input');
      playerNameInput.type = 'text';
      playerNameInput.id = `player-name-${number}`;
      playerCell.appendChild(playerNameInput);
    });

    // Add "Characters" text to the first cell of the characters row
    const charactersCell = charactersRow.insertCell();
    charactersCell.appendChild(document.createTextNode('Characters'));

    // Populate rows with character names, icons, radio buttons, and toggle switches
    result.forEach(number => {
      const characterCell = charactersRow.insertCell();
      const poisonedCell = poisonedRow.insertCell();
      const deadCell = deadRow.insertCell();

      characterCell.classList.add('character-cell');
      poisonedCell.classList.add('toggle-cell');
      deadCell.classList.add('toggle-cell');

      // Add character icon to the cell
      const icon = document.createElement('img');
      icon.src = `images/${number}_icon.png`;
      icon.alt = 'Character Icon';
      icon.classList.add('character-icon');
      icon.id = `character-icon-${number}`;
      characterCell.appendChild(icon);

      // Add character name text to the cell
      const characterName = getCharacterName(number);
      const nameContainer = document.createElement('span');
      nameContainer.appendChild(document.createTextNode(characterName));
      nameContainer.id = `character-name-${number}`;
      characterCell.appendChild(nameContainer);

      // Create radio button for the poisoned row
      const poisonedRadio = document.createElement('input');
      poisonedRadio.type = 'radio';
      poisonedRadio.name = `poisoned`;
      poisonedRadio.value = number;
      poisonedRadio.id = `poisoned-radio-${number}`;
      poisonedCell.appendChild(poisonedRadio);

      // Create toggle switch for the dead row
      const deadSwitch = document.createElement('input');
      deadSwitch.type = 'checkbox';
      deadSwitch.value = number;
      deadSwitch.id = `dead-switch-${number}`;
      deadCell.appendChild(deadSwitch);

      // Track the width of the icon
      const iconHeight = icon.clientHeight;
      const iconWidth = icon.clientWidth;
      if (iconWidth > maxCellWidth) {
        maxCellWidth = iconWidth;
      }
      // Adjust the height of the character cell based on the icon height
      characterCell.style.height = `${Math.max(iconHeight, 100)}px`; // Set a minimum height of 100px for character cells
      characterCell.setAttribute('data-character', number); // Set data-character attribute
      poisonedCell.setAttribute('data-character', number); // Set data-character attribute
      deadCell.setAttribute('data-character', number); // Set data-character attribute
    });

    // Set the width for all character cells based on the width of the icon
    Array.from(charactersRow.cells).forEach(cell => {
      cell.style.width = `${Math.max(maxCellWidth, 200)}px`; // Set a minimum width of 200px for character cells
    });

    // Populate notes row with text areas for notes
    result.forEach(number => {
      const notesTextAreaCell = notesRow.insertCell();
      const notesTextArea = document.createElement('textarea');
      notesTextArea.rows = 4; // Set the number of rows as needed
      notesTextArea.id = `notes-${number}`;
      notesTextAreaCell.appendChild(notesTextArea);
    });

    // Append the rows to the table
    resultContainer.appendChild(table);

    // Generate and append images under the table
    result.forEach(number => {
      const img = document.createElement('img');
      img.src = `images/${number}_pt.png`;
      img.setAttribute('data-image-number', number);
      img.classList.add('generated-image');
      img.id = `generated-image-${number}`;
      resultContainer.appendChild(img);
    });
  }

  // Add a section for the night preparation information
  const nightPrepSection = document.createElement('div');
  nightPrepSection.id = 'night-preparation-section';

  // Add title
  const title = document.createElement('h2');
  title.textContent = 'Noite de preparação';
  nightPrepSection.appendChild(title);

  const emptyLine = document.createElement('p');
  emptyLine.textContent = '&nbsp';

  // Add paragraphs based on characters in the result
  if (result.includes(15)) {
    const paragraph = document.createElement('p');
    paragraph.id = '15_fn_txt';
    paragraph.textContent = 'Irmãs acordam para se conhecerem.';
    nightPrepSection.appendChild(paragraph);
    nightPrepSection.appendChild(emptyLine);
  }

  if (result.includes(28)) {
    const paragraph = document.createElement('p');
    paragraph.id = '28_fn_txt';
    paragraph.textContent = 'Irmãos acordam para se conhecerem.';
    nightPrepSection.appendChild(paragraph);
    nightPrepSection.appendChild(emptyLine);
  }

  if (result.includes(18)) {
    const paragraph = document.createElement('p');
    paragraph.id = '18_fn_txt';
    paragraph.textContent = 'Acusador acorda e escolhe um Bode Expiatório.';
    nightPrepSection.appendChild(paragraph);
    nightPrepSection.appendChild(emptyLine);
  }

  if (result.includes(3)) {
    const paragraph = document.createElement('p');
    paragraph.id = '3_fn_txt';
    paragraph.textContent = 'Cupido acorda e aponta para dois jogadores que se tornaram namorados. O cupido adormece e os namorados serão agora tocados e podem acordar para ver quem é seu amado.';
    nightPrepSection.appendChild(paragraph);
    nightPrepSection.appendChild(emptyLine);
  }

  if (result.includes(23)) {
    const paragraph = document.createElement('p');
    paragraph.id = '23_fn_txt';
    paragraph.textContent = 'Criança Selvagem acorda e aponta para o jogador que ela escolhe como pai adotivo.';
    nightPrepSection.appendChild(paragraph);
    nightPrepSection.appendChild(emptyLine);
  }

  if (result.includes(25)) {
    const paragraph = document.createElement('p');
    paragraph.id = '25_fn_txt';
    const fakeCharactersText = fakeCharacters.map(number => `${number}. ${getCharacterName(number)}`).join(', ');
    paragraph.textContent = `Chefe dos Lobisomens acorda e o Moderador mostra-lhe as personagens falsas: ${fakeCharactersText}`;
    nightPrepSection.appendChild(paragraph);
    nightPrepSection.appendChild(emptyLine);
  }

  if (result.includes(2)) {
    const paragraph = document.createElement('p');
    paragraph.id = '2_fn_txt';
    paragraph.textContent = 'Bruxa Malvada acorda e aponta para quem quer envenenar. Se for necessário o Moderador toca na cabeça do jogador envenenado. (Cupido, Idiota, Irmã, Marionestista, Cão-Lobo, Criança Selvagem, Irmão).';
    nightPrepSection.appendChild(paragraph);
    nightPrepSection.appendChild(emptyLine);
  }

  if (result.includes(8)) {
    const paragraph = document.createElement('p');
    paragraph.id = '8_fn_txt';
    paragraph.textContent = 'Mestre da Raposa acorda e aponta para um jogador, e é-lhe indicado por um polegar para cima se esse jogador os seus vizinhos são maus.';
    nightPrepSection.appendChild(paragraph);
    nightPrepSection.appendChild(emptyLine);
  }

  if (result.includes(7)) {
    const paragraph = document.createElement('p');
    paragraph.id = '7_fn_txt';
    paragraph.textContent = 'Urso rosna/não rosna.';
    nightPrepSection.appendChild(paragraph);
    nightPrepSection.appendChild(emptyLine);
  }

  // Add the night preparation section to the result container
  resultContainer.appendChild(nightPrepSection);

  // Add event listeners for radio buttons and toggle switches
  addEventListeners();
}

// Function to add event listeners for radio buttons and toggle switches
function addEventListeners() {
  const poisonedRadios = document.querySelectorAll('input[type="radio"]');
  const deadSwitches = document.querySelectorAll('input[type="checkbox"]');

  poisonedRadios.forEach(radio => {
    radio.addEventListener('change', handlePoisonedChange);
  });

  deadSwitches.forEach(switchElem => {
    switchElem.addEventListener('change', handleDeadChange);
  });
}

// Function to handle changes in the poisoned radio buttons
function handlePoisonedChange(event) {
  const characterNumber = event.target.value;
  const characterNameElement = document.getElementById(`character-name-${characterNumber}`);
  const characterIconElement = document.getElementById(`character-icon-${characterNumber}`);

  // Remove the .poisoned-character style from all elements in the page
  const allPoisonedElements = document.querySelectorAll('.poisoned-character');
  const allPoisonedIcon = document.querySelectorAll('.poisoned-icon');
  allPoisonedElements.forEach(element => element.classList.remove('poisoned-character'));
  allPoisonedIcon.forEach(element => element.classList.remove('poisoned-icon'));

  if (event.target.checked) {
    // If the poisoned button is checked, apply the .poisoned-character style
    characterNameElement.classList.remove('default');
    characterNameElement.classList.add('poisoned-character');
    characterIconElement.classList.add('poisoned-icon');
  }
  // Handle the change if needed
}

// Function to handle changes in the dead toggle switches
function handleDeadChange(event) {
  const characterNumber = event.target.value;
  const characterNameElement = document.getElementById(`character-name-${characterNumber}`);
  const characterIconElement = document.getElementById(`character-icon-${characterNumber}`);

  if (event.target.checked) {
    // If the dead switch is checked, apply the .dead-character style
    characterNameElement.classList.remove('default');
    characterNameElement.classList.add('dead-character');
    characterIconElement.classList.add('dead-character');
  } else {
    // If the dead switch is unchecked, apply the .default style
    characterNameElement.classList.remove('dead-character');
    characterIconElement.classList.remove('dead-character');
    characterNameElement.classList.add('default');
  }
  // Handle the change if needed
}

// Function to toggle the display of images
function toggleImages() {
  const images = document.querySelectorAll('.generated-image');

  // Toggle the display property of each image
  images.forEach(img => {
    img.style.display = (img.style.display === 'none' || !img.style.display) ? 'block' : 'none';
  });
}

// Function to get the character name based on the number
function getCharacterName(number) {
  switch (number) {
    // Long switch statement for each character number
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

    case 152: return 'Irmã';
    case 282: return 'Irmão';
    case 283: return 'Irmão';

    default: return 'Unknown Character';
  }
}

// Function to generate a random list based on player count
function generateRandomList(x, messagesContainer) {
  const result = [1, 2, 3, 4, 5];
  let availableNumbers = [];

  if (!messagesContainer) {
    console.error('Error: messagesContainer is not defined.');
    return;
  }

  if (x < 8) {
    messagesContainer.innerHTML = "Not enough players!";
    return;
  } else if (x < 10) {
    availableNumbers = [6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24];
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

  while (result.length < x && availableNumbers.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const randomNumber = availableNumbers.splice(randomIndex, 1)[0];

    if (randomNumber != 15 && randomNumber != 28) {
      result.push(randomNumber);
    } else if (randomNumber === 15 && result.length < x - 2) {
      result.push(15, 152);
    } else if (randomNumber === 28 && result.length < x - 3) {
      result.push(28, 282, 283);
    }
  }

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