//Werewolves on thr Clocktower Guide Companion
//by AnJoMorto

// Function to generate and display the random list
function generateAndDisplay() {
  // Get input and result container elements
  const playerCountInput  = document.getElementById('playerCount');
  const resultContainer   = document.getElementById('result-container');
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
  let result = generateRandomList(playerCount, newMessagesContainer);
  let counter = 1; // Initialize the counter
  result = result.map(value => {
    if (value === 0) {
      // If the value is 0, replace it with the counter and increment the counter
      const newValue = counter.toString().padStart(2, '0');
      counter++;
      return newValue;
    } else {
      // If the value is not 0, keep it as it is
      return value;
    }
  }); 
  shuffleArray(result);
  
  //Other lists important for the script later
    //Remove the result from the fake characters list
    const availableFakeCharacters = [6, 7, 8, 9, 10, 11, 12, 14, 16, 17, 18, 19, 20];
    const fakeCharacters = availableFakeCharacters.filter(element => !result.includes(element));
    shuffleArray(fakeCharacters);
    //Make the list of the important characters to mention if poisoned
    const availablePoisanableCharacters = [3, 13, 15, 20, 21, 23, 28];
    const poisanableCharacters = availablePoisanableCharacters.filter(element => result.includes(element));
    //Make a list of the allies
    const availableAllies = [2, 27, 21, 22];
    const allies = availableAllies.filter(element => result.includes(element));

  // Display the result
  if (result) {
    resultContainer.innerHTML = `<p>Result: ${result.join(', ')}</p>`;

    // Create a table for characters, poisoned, dead, done, players, and notes rows
    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';

    // Create rows for players, characters, poisoned, dead, done, and notes
    const playersRow = table.insertRow();
    const charactersRow = table.insertRow();
    const poisonedRow = table.insertRow();
    poisonedRow.insertCell().appendChild(document.createTextNode('Poisoned'));
    const deadRow = table.insertRow();
    deadRow.insertCell().appendChild(document.createTextNode('Dead'));
    const doneRow = table.insertRow();
    doneRow.insertCell().appendChild(document.createTextNode('Done'))
    const notesRow = table.insertRow();
    const notesCell = notesRow.insertCell();
    notesCell.appendChild(document.createTextNode('Notes'));

    let maxCellWidth = 0;

    // Add "Players" text to the prep cell of the players row
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

    // Add "Characters" text to the prep cell of the characters row
    const charactersCell = charactersRow.insertCell();
    charactersCell.appendChild(document.createTextNode('Characters'));

    // Populate rows with character names, icons, radio buttons, and toggle switches
    result.forEach(number => {
      const characterCell = charactersRow.insertCell();
      const poisonedCell = poisonedRow.insertCell();
      const deadCell = deadRow.insertCell();
      const doneCell = doneRow.insertCell();

      characterCell.classList.add('character-cell');
      poisonedCell.classList.add('toggle-cell');
      deadCell.classList.add('toggle-cell');
      doneCell.classList.add('toggle-cell');

      // Add character icon to the cell
      const icon = document.createElement('img');
      const numberString = String(number); // Convert to string
      let imagePath;
      if(numberString.startsWith('04') || numberString.startsWith('08')){
          imagePath = `images/1_icon.png`;
      } else {
         imagePath = numberString.startsWith('0') ? `images/0_icon.png` : `images/${numberString}_icon.png`;
      };
      icon.src = imagePath;
      icon.classList.add('character-icon');
      icon.id = `character-icon-${number}`;
      characterCell.appendChild(icon);

      // Add character name text to the cell
      const characterName = getCharacterName(number);
      const nameContainer = document.createElement('span');
      nameContainer.appendChild(document.createTextNode(characterName));
      nameContainer.classList.add('default')
      nameContainer.id = `character-name-${number}`;
      characterCell.appendChild(nameContainer);

      // Create radio button for the poisoned row
      const poisonedRadio = document.createElement('input');
      poisonedRadio.type = 'radio';
      poisonedRadio.name = `poisoned`;
      poisonedRadio.value = number;
      poisonedRadio.id = `poisoned-radio-${number}`;
      poisonedCell.appendChild(poisonedRadio);

      // Create dead toggle switch for the dead row
      const deadSwitch = document.createElement('input');
      deadSwitch.type = 'checkbox';
      deadSwitch.value = number;
      deadSwitch.id = `dead-switch-${number}`;
      deadCell.appendChild(deadSwitch);

      // Create done toggle switch for the done row
      const doneSwitch = document.createElement('input');
      doneSwitch.type = 'checkbox';
      doneSwitch.value = number;
      doneSwitch.id = `done-switch-${number}`;
      doneCell.appendChild(doneSwitch);      

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
      doneCell.setAttribute('data-character', number); // Set data-character attibute
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
      const numberString = String(number); // Convert to string
      let imagePath;
      if(numberString.startsWith('04') || numberString.startsWith('08')){
        imagePath = `images/1_pt.png`;
      } else {
        imagePath = numberString.startsWith('0') ? `images/0_pt.png` : `images/${numberString}_pt.png`;
      };
      img.src = imagePath;
      img.setAttribute('data-image-number', number);
      img.classList.add('generated-image');
      img.id = `generated-image-${number}`;
      resultContainer.appendChild(img);
    });
  }

  // Add different buttons
  const resetScriptButton = document.createElement('button');
  resetScriptButton.id = 'reset-script';
  resetScriptButton.innerText = 'Reset Script'
  resetScriptButton.addEventListener('click', resetScript);
  resultContainer.appendChild(resetScriptButton);

  const prepNightToggle = document.createElement('button');
  prepNightToggle.id = 'pn-toggle';
  prepNightToggle.innerText = 'Toggle Preparation Night';
  prepNightToggle.addEventListener('click', togglePrepNight);
  resultContainer.appendChild(prepNightToggle);

  const secondNightToggle = document.createElement('button');
  secondNightToggle.id = 'sn-toggle';
  secondNightToggle.innerText = 'Toggle Second Night';
  secondNightToggle.addEventListener('click', toggleSecondNight);
  resultContainer.appendChild(secondNightToggle);

  //Need to create empty p for every character that isn't in the script to have IDs for all the characters otherwise the style application doesn't work
  // Add a section for the night preparation information
  const emptyLine = document.createElement('p');
  emptyLine.textContent = '&nbsp';

  const nightPrepSection = document.createElement('div');
  nightPrepSection.id = 'night-preparation-section';

  const remainingPnCharacters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 152, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 282, 283];

  // Add title
  const title = document.createElement('h2');
  title.textContent = 'Noite de preparação';
  nightPrepSection.appendChild(title);

  // Add paragraphs based on characters in the result
  if (result.includes(15)) {
    addPnTxtWithToggle(15, ' - Irmãs acordam para se conhecerem.');
  }

  if (result.includes(28)) {
    addPnTxtWithToggle(28, ' - Irmãos acordam para se conhecerem.');
  }

  if (result.includes(18)) {
    addPnTxtWithToggle(18, ' - Acusador acorda e escolhe um Bode Expiatório.');
  }

  if (result.includes(3)) {
    addPnTxtWithToggle(3, ' - Cupido acorda e aponta para dois jogadores que se tornaram namorados. O cupido adormece e os namorados serão agora tocados e podem acordar para ver quem é seu amado.');
  }

  if (result.includes(23)) {
    addPnTxtWithToggle(23, ' - Criança Selvagem acorda e aponta para o jogador que ela escolhe como pai adotivo.');
  }

  if (result.includes(25)) {
    const fakeCharactersText = fakeCharacters.map(number => `${number}. ${getCharacterName(number)}`).join(', ');
    addPnTxtWithToggle(25, ` - Chefe dos Lobisomens acorda e o Moderador mostra-lhe as personagens falsas: ${fakeCharactersText}`);
  }

  if (result.includes(2)) {
    const poisanableCharactersText = poisanableCharacters.map(number => `${number}. ${getCharacterName(number)}`).join(', ');
    addPnTxtWithToggle(2, ` - Bruxa Malvada acorda e aponta para quem quer envenenar. Se for necessário o Moderador toca na cabeça do jogador envenenado. (${poisanableCharactersText})`);
  }

  if (result.includes(8)) {
    addPnTxtWithToggle(8, ' - Mestre da Raposa acorda e aponta para um jogador, e é-lhe indicado por um polegar para cima se esse jogador ou os seus vizinhos são maus.');
  }

  if (result.includes(7)) {
    addPnTxtWithToggle(7, ' - Urso rosna/não rosna.');
  }

  // Repeat this pattern for other cases...

  //creating the remaining non existing tags for compatibility reasons
  for (let i = 0; i < remainingPnCharacters.length; i++) {
    const paragraph = document.createElement('p');
    paragraph.id = `pn-txt-${remainingPnCharacters[i]}`;
    nightPrepSection.appendChild(paragraph);
  }

  // Add the night preparation section to the result container
  resultContainer.appendChild(nightPrepSection);

  // Function to add a paragraph with a click event for toggling .done class
  function addPnTxtWithToggle(characterNumber, text) {
    // Create a paragraph element with the desired id
    const paragraph = document.createElement('p');
    paragraph.id = `pn-txt-${characterNumber}`;
    paragraph.textContent = text;

    // Add the paragraph to the nightPrepSection
    nightPrepSection.appendChild(paragraph);

    // Add an empty line
    nightPrepSection.appendChild(emptyLine);

    const index = remainingPnCharacters.indexOf(characterNumber);
    if (index !== -1) {
      remainingPnCharacters.splice(index, 1);
    }

    // Add event listener to the paragraph element
    paragraph.addEventListener('click', function () {
      // Toggle the .done class on the paragraph
      this.classList.toggle('done');
    });
  }

  // Function to toggle the visibility of the nightPrepSection
  function togglePrepNight() {
    nightPrepSection.hidden = !nightPrepSection.hidden;
  }

  // Add a section for the second night information
  const secondNightSection = document.createElement('div');
  secondNightSection.id = 'second-night-section';

  const remainingSnCharacters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 152, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 282, 283];

  // Add title
  const secondNightTitle = document.createElement('h2');
  secondNightTitle.textContent = 'Começo da segunda noite.';
  secondNightSection.appendChild(secondNightTitle);

  // Add paragraphs based on characters in the result
  if (result.includes(21)) {
    addSnTxtWithToggle(21, ' - Cão-Lobo acorda e escolhe com o polegar para cima se quer se juntar aos aldeões ou com um polegar para baixo se quer se juntar aos Lobisomens como um Lobisomem que só pode dizer a verdade.');
  }

  if (result.includes(22)) {
    addSnTxtWithToggle(22, ' - Ladrão acorda e escolhe com o polegar para cima se quer se juntar aos aldeões ou com um polegar para baixo se quer se juntar aos Lobisomens.');
  }

  if (result.includes(25)) {
    const alliesTxt = allies.map(number => `${number}. ${getCharacterName(number)}`).join(', ');
    addSnTxtWithToggle(25, ` - Lobisomens acordam e o Moderador aponta-lhes quem são os Aliados (${alliesTxt})`);
  }

  // Repeat this pattern for other cases...

  //creating the remaining non-existing tags for compatibility reasons
  for (let i = 0; i < remainingSnCharacters.length; i++) {
    const paragraph = document.createElement('p');
    paragraph.id = `sn-txt-${remainingSnCharacters[i]}`;
    secondNightSection.appendChild(paragraph);
  }

  // Add the second night section to the result container
  resultContainer.appendChild(secondNightSection);

  // Function to add a paragraph with a click event for toggling .done class
  function addSnTxtWithToggle(characterNumber, text) {
    // Create a paragraph element with the desired id
    const paragraph = document.createElement('p');
    paragraph.id = `sn-txt-${characterNumber}`;
    paragraph.textContent = text;

    // Add the paragraph to the secondNightSection
    secondNightSection.appendChild(paragraph);

    // Add an empty line
    secondNightSection.appendChild(emptyLine);

    const index = remainingSnCharacters.indexOf(characterNumber);
    if (index !== -1) {
      remainingSnCharacters.splice(index, 1);
    }

    // Add event listener to the paragraph element
    paragraph.addEventListener('click', function () {
      // Toggle the .done class on the paragraph
      this.classList.toggle('done');
    });
  }

  // Function to toggle the visibility of the secondNightSection
  function toggleSecondNight() {
    secondNightSection.hidden = !secondNightSection.hidden;
  }

  // Add a section for the nights information
  const nightsSection = document.createElement('div');
  nightsSection.id = 'nights-section';

  const remainingNnCharacters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 152, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 282, 283];

  // Add title for all nights
  const nightsTitle = document.createElement('h2');
  nightsTitle.textContent = 'Todas as noites.';
  nightsSection.appendChild(nightsTitle);

  // Add paragraphs based on characters in the result
  if (result.includes(17)) {
    addNnTxt(17, ' - Sonâmbulo acorda e escolhe um jogador para visitar. Esse jogador será tocado e não poderá acordar nessa noite mesmo sendo chamado pelo Moderador.');
  }

  if (result.includes(5)) {
    addNnTxt(5, ' - (Se alguém foi executado no dia passado) Vidente acorda e o Moderador mostra-lhe a identidade do executado.');
  }

  if (result.includes(2)) {
    const poisanableCharactersText = poisanableCharacters.map(number => `${number}. ${getCharacterName(number)}`).join(', ');
    addNnTxt(2, ` - Bruxa Malvada acorda e aponta para quem quer envenenar. Se for necessário o Moderador toca na cabeça do jogador envenenado. (${poisanableCharactersText})`);
  }

  if (result.includes(1)) {
    addNnTxt(1, ' - Lobisomens acordam e apontam para quem querem assassinar. Se o Lobisomem Vampiro quiser transformar a vítima, ficará acordado a apontar para a vítima. A vítima será tocada na cabeça.');
  }

  if (result.includes(24)) {
    addNnTxt(24, ' - A CADA 3 NOITES OU SE ENVENENADO: Lobisomem Branco: acorda e escolhe um Lobisomem para matar: ', true);
  }

  if (result.includes(4)) {
    addNnTxt(4, ' - Chaman acorda e vê quem foi assassinado, indica se o quer salvar com o polegar para cima.');
  }

  if (result.includes(22)) {
    addNnTxt(22, ' - Ladrão acorda e aponta para o jogador que não terá direito ao voto no próximo dia.');
  }

  if (result.includes(8)) {
    addNnTxt(8, ' - Mestre da Raposa acorda e aponta para um jogador, e é-lhe indicado por um polegar para cima se esse jogador ou os seus vizinhos são maus.');
  }

  if (result.includes(7)) {
    addNnTxt(7, ' - Urso rosna/não rosna.');
  }

  // Add subtitle
  const subtitle = document.createElement('h3');
  subtitle.textContent = 'RESOLVER VÁRIAS COISAS:';
  nightsSection.appendChild(subtitle);

  // Add paragraphs for resolving various things
  if (result.includes(6)) {
    addNnTxt(6, ' - Se o Chefe de Aldeia for assassinado pelos Lobisomens, o Lobisomem afetado é avisado, tocando-lhe na cabeça e pedindo para acordar e ver as indicações silenciosas do Moderador.');

  }
  if (result.includes(11)) {
    addNnTxt(11, ' - Se o Caçador morto ainda não tiver escolhido a vítima, o Moderador acorda-o tocando-lhe na cabeça e sem dizer nada espera que ele aponte para uma vítima.');

  }
  if (result.includes(23)) {
    addNnTxt(23, ' - Se Criança Selvagem for envenenada, acorda por toque e sem o Moderador dizer nada, terá de escolher um novo pai adotivo.');

  }

  //creating the remaining non-existing tags for compatibility reasons
  for (let i = 0; i < remainingNnCharacters.length; i++) {
    const paragraph = document.createElement('p');
    paragraph.id = `nn-txt-${remainingNnCharacters[i]}`;
    nightsSection.appendChild(paragraph);
  }

  // Add the nights section to the result container
  resultContainer.appendChild(nightsSection);

  // Function to add a paragraph to the nightsSection
  function addNnTxt(characterNumber, text, counter) {
    // Create a container for the counter and paragraph
    const container = document.createElement('div');
    container.style.display = 'flex'; // Make the container a flex container
    
    // Create a paragraph element with the desired id
    const paragraph = document.createElement('p');
    paragraph.id = `nn-txt-${characterNumber}`;
    paragraph.textContent = text;
    container.appendChild(paragraph);

    // Create a counter
    if (counter != null) {
      // Create a counter element
      const numberElement = document.createElement('input');
      numberElement.type = 'number';
      numberElement.id = `nn-counter-${characterNumber}`;
      numberElement.min = 0;
      numberElement.max = 3;
      numberElement.step = 1;
      container.appendChild(numberElement);
    }

    // Add the paragraph to the nightsSection
    nightsSection.appendChild(container);

    // Add an empty line
    nightsSection.appendChild(emptyLine);

    const index = remainingNnCharacters.indexOf(characterNumber);
    if (index !== -1) {
      remainingNnCharacters.splice(index, 1);
    }

    // Add event listener to the paragraph element
    paragraph.addEventListener('click', function () {
      // Toggle the .done class on the paragraph
      this.classList.toggle('done');
    });
  }

  // Add event listeners for radio buttons and toggle switches
  addDandPEventListeners();
}

// Function to add event listeners for radio buttons and toggle switches
function addDandPEventListeners() {
  const poisonedRadios = document.querySelectorAll('input[type="radio"]');
  const deadSwitches = document.querySelectorAll('input[id^="dead-switch-"]');
  const doneSwitches = document.querySelectorAll('input[id^="done-switch-"]');

  poisonedRadios.forEach(radio => {
    radio.addEventListener('change', handlePoisonedChange);
  });

  deadSwitches.forEach(switchElem => {
    switchElem.addEventListener('change', handleDeadChange);
  });

  doneSwitches.forEach(switchElem => {
    switchElem.addEventListener('change', handleDoneChange);
  });
}

// Function to handle changes in the poisoned radio buttons
function handlePoisonedChange(event) {
  const characterNumber = event.target.value;
  const characterNameElement = document.getElementById(`character-name-${characterNumber}`);
  const characterIconElement = document.getElementById(`character-icon-${characterNumber}`);
  const characterPnTxt       = document.getElementById(`pn-txt-${characterNumber}`);
  const characterSnTxt       = document.getElementById(`sn-txt-${characterNumber}`);
  const characterNnTxt       = document.getElementById(`nn-txt-${characterNumber}`);

  // Remove the .poisoned-character style from all elements in the page
  const allPoisonedElements = document.querySelectorAll('.poisoned-character');
  const allPoisonedIcon     = document.querySelectorAll('.poisoned-icon');
  allPoisonedElements.forEach(element => element.classList.remove('poisoned-character'));
  allPoisonedIcon.forEach(element => element.classList.remove('poisoned-icon'));

  if (characterNumber.toString() == '04' || characterNumber.toString() == '08'){
    characterNameElement.classList.add('poisoned-character');
    characterIconElement.classList.add('poisoned-icon');
    document.getElementById(`pn-txt-1`).classList.add('poisoned-character');
    document.getElementById(`sn-txt-1`).classList.add('poisoned-character');
    document.getElementById(`nn-txt-1`).classList.add('poisoned-character');
  } else if (event.target.checked) {
    // If the poisoned button is checked, apply the .poisoned-character style
    //characterNameElement.classList.remove('default');
    //characterPnTxt.classList.remove('default');
    //characterSnTxt.classList.remove('default');
    //characterNnTxt.classList.remove('default');
    characterNameElement.classList.add('poisoned-character');
    characterIconElement.classList.add('poisoned-icon');
    characterPnTxt.classList.add('poisoned-character');
    characterSnTxt.classList.add('poisoned-character');
    characterNnTxt.classList.add('poisoned-character');
  }
}

// Function to handle changes in the dead toggle switches
function handleDeadChange(event) {
  const characterNumber = event.target.value;
  const characterNameElement = document.getElementById(`character-name-${characterNumber}`);
  const characterIconElement = document.getElementById(`character-icon-${characterNumber}`);
  const characterPnTxt       = document.getElementById(`pn-txt-${characterNumber}`);
  const characterSnTxt       = document.getElementById(`sn-txt-${characterNumber}`);
  const characterNnTxt       = document.getElementById(`nn-txt-${characterNumber}`);

  if (event.target.checked) {
    // If the dead switch is checked, apply the .dead-character style
    //characterNameElement.classList.remove('default');
    //characterPnTxt.classList.remove('default');
    //characterSnTxt.classList.remove('default');
    //characterNnTxt.classList.remove('default');
    characterNameElement.classList.add('dead-character');
    characterIconElement.classList.add('dead-character');
    characterPnTxt.classList.add('dead-character');
    characterSnTxt.classList.add('dead-character');
    characterNnTxt.classList.add('dead-character');
    if(characterNumber.toString() == 1){
      characterPnTxt.classList.remove('dead-character');
      characterSnTxt.classList.remove('dead-character');
      characterNnTxt.classList.remove('dead-character');
    }
  } else {
    // If the dead switch is unchecked, apply the .default style
    characterNameElement.classList.remove('dead-character');
    characterIconElement.classList.remove('dead-character');
    characterPnTxt.classList.remove('dead-character');
    characterSnTxt.classList.remove('dead-character');
    characterNnTxt.classList.remove('dead-character');
    characterNameElement.classList.add('default');
    characterPnTxt.classList.add('default');
    characterSnTxt.classList.add('default');
    characterNnTxt.classList.add('default');
  }
}

// Function to handle changes in the done toggle switches
function handleDoneChange(event) {
  const characterNumber = event.target.value;
  const characterPnTxt       = document.getElementById(`pn-txt-${characterNumber}`);
  const characterSnTxt       = document.getElementById(`sn-txt-${characterNumber}`);
  const characterNnTxt       = document.getElementById(`nn-txt-${characterNumber}`);

  if (event.target.checked) {
    // If the done switch is checked, apply the .done-character style
    //characterPnTxt.classList.remove('default');
    //characterSnTxt.classList.remove('default');
    //characterNnTxt.classList.remove('default');
    characterPnTxt.classList.add('dead-character');
    characterSnTxt.classList.add('dead-character');
    characterNnTxt.classList.add('dead-character');
  } else {
    // If the done switch is unchecked, apply the .default style
    characterPnTxt.classList.remove('dead-character');
    characterSnTxt.classList.remove('dead-character');
    characterNnTxt.classList.remove('dead-character');
    characterPnTxt.classList.add('default');
    characterSnTxt.classList.add('default');
    characterNnTxt.classList.add('default');
  }
}

// Function to toggle the display of images
function toggleImages() {
  const images = document.querySelectorAll('.generated-image');

  // Toggle the display property of each image
  images.forEach(img => {
    img.style.display = (img.style.display === 'none' || !img.style.display) ? 'block' : 'none';
  });
}

// Function to reset all script texts to default
function resetScript() {
  const allDoneElements = document.body.querySelectorAll('.done');
  allDoneElements.forEach(element => element.classList.remove('done'));
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

    case '04': return 'Lobisomem';
    case '08': return 'Lobisomem';

    default: return 'Aldeão Triste';
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
  } else if (x < 41) {
    availableNumbers = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28];
    const extraPlayers = x - 31;
    for (let i = 0; i < extraPlayers; i++) {
      result.push(0);
    }
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
