//==================================================================================================//
//==================================================================================================//

//Werewolves on the Clocktower Guide Companion
//by AnJoMorto

//Planned updates:
  //Add all character's lists to the fixed values for easier access and modification
  //Testdrive observations
  //Automate in script the characters with neighbours (yes or no bear, fox)
  //Add player names to the script when necessary (second night friends)
  //Hover the numbers in the result and see the characters name
  //Link to the rule Docs Document for now : https://docs.google.com/document/d/1aV9II9br_8ln4zrA7wgHRByBLqyb8EzkOqc2ltHGCes/edit?usp=sharing
  //Automate Round turning and add built-in timer for the day after the script (+ play sound when timer start/over)
  //New characters
  //Drunk character (togglable)
  //Later
    //FR language
    //EN language

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
const goodCharacters          = [0,3,4,5,6,7,8,9,10,11,12,13,14,15,152,16,17,18,19,20,29,31,32,28,282,283]; //all the folk characters
const flexibleCharacters      = [21,22,23,24]; //all the chosing characters
const badCharacters           = [1,2,25,26,30,27]; //all the wolfs and allies
const allCharacters           = [...goodCharacters,...flexibleCharacters,...badCharacters]; //everyone
const availableFakeCharacters       = [6,7,8,9,10,11,12,14,16,17,18,19,20,29,31,32]; //all characters that can be proposed as fake characters
const availableAllies               = [2,27,21,22]; //all non wolf bad characters
const availablePoisanableCharacters = [3,13,15,20,21,23,28]; //all characters whose poison status need to be informed to the person
const availablePlayableCharacters   = []; //all characters that can be played by the actor
//Character Balancing depending on Player count:
const upTo10  = [];

//Fixed values
const maxChar   = allCharacters.length; //need to make it so the maximum amount of characters is dependant on the list length
const wolfRatio = 4;

//==================================================================================================//

//FUNCTION TO GENERATE AND DISPLAY THE WHOLE THING
function generateAndDisplay() {

  // Get input and result container elements
  const playerCountInput  = document.getElementById('player-count');
  const resultContainer   = document.getElementById('result-container');
  const messagesContainer = document.getElementById('messages-container');

  // Clear existing result content if it exists
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

  // Check if the player count input is empty
  if (isNaN(playerCount) || playerCount <= 0) {
    document.getElementById("result-container").innerHTML = "Por favor junte o número de jogadores!";
    return;
  }


  // Generate random list
  let result = generateRandomList(playerCount, newMessagesContainer);
  //Check add 00,01,02 etc for extra players
  let extraPlayers = 0;
  let extraWolves = [];
  if (playerCount > maxChar) {
    extraPlayers = playerCount - maxChar;
    for (let i = 0; i < extraPlayers; i++) {
      result.push(`0${i}`)
      if (i % wolfRatio == 0) {
        extraWolves.push(i);
      }
    }
  }
  shuffleArray(result);
  
  /////////////////////////////////

  //Other lists important for the script later
    //Remove the result from the fake characters list
    const fakeCharacters = availableFakeCharacters.filter(element => !result.includes(element));
    shuffleArray(fakeCharacters);
    //Make the list of the important characters to mention if poisoned
    const poisanableCharacters = availablePoisanableCharacters.filter(element => result.includes(element));
    //Make a list of the wolfs allies
    const allies = availableAllies.filter(element => result.includes(element));
    //Make a list of the flexible characters for possible allies
    const flexibles = flexibleCharacters.filter(element => result.includes(element));

  /////////////////////////////////

  // Display the result
  if (result) {
    resultContainer.innerHTML = `<p>Result: ${result.join(', ')}</p>`;

    // Create a table for characters, poisoned, dead, done, players, and notes rows
    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';

    // Create rows for players, characters, poisoned, dead, done, and notes
    const playersRow    = table.insertRow();
    playersRow.insertCell().appendChild(document.createTextNode('Jogadores'))
    const charactersRow = table.insertRow();
    charactersRow.insertCell().appendChild(document.createTextNode('Personagens'));
    const poisonedRow   = table.insertRow();
    poisonedRow.insertCell().appendChild(document.createTextNode('Envenenado'));
    const deadRow       = table.insertRow();
    deadRow.insertCell().appendChild(document.createTextNode('Morto'));
    const doneRow       = table.insertRow();
    doneRow.insertCell().appendChild(document.createTextNode('Acabou'));
    const notesRow      = table.insertRow();
    notesRow.insertCell().appendChild(document.createTextNode('Anotações'));

      // Adding a Host row when the sleepwalker is in the game
      if (result.includes(17)){
        const hostRow   = table.insertRow();
        hostRow.insertCell().appendChild(document.createTextNode('Hospedeiro'));
        result.forEach(number => {
          const hostCell = hostRow.insertCell();
          hostCell.classList.add('toggle-cell');
    
          // Create radio button for the hosting row
          const hostRadio = document.createElement('input');
          hostRadio.type = 'radio';
          hostRadio.name = `host`;
          hostRadio.value = number;
          hostRadio.id = `host-radio-${number}`;
          hostCell.appendChild(hostRadio);
          hostCell.setAttribute('data-character', number); // Set data-character attribute
        });
      };

    let maxCellWidth = 0;

    ////////////////////////

    // POPULARE ROWS WITH PLAYER NAMES; CHARACTER NAMES; ICONS; RADIO BUTTONS AND TOGGLE SWITCHES
      //Player names
        result.forEach((number, index) => {
        const playerCell      = playersRow.insertCell();
        const playerNameInput = document.createElement('input');
        playerNameInput.type  = 'text';
        playerNameInput.id    = `player-name-${number}`;
        playerCell.appendChild(playerNameInput);
      });

      //Cells for characters, poison, dead and done
        result.forEach(number => {
          const characterCell = charactersRow.insertCell();
          const poisonedCell  = poisonedRow.insertCell();
          const deadCell      = deadRow.insertCell();
          const doneCell      = doneRow.insertCell();
                characterCell.classList.add('character-cell');
                poisonedCell.classList.add('toggle-cell');
                deadCell.classList.add('toggle-cell');
                doneCell.classList.add('toggle-cell');
      
        // Add character icon to the cell
          const icon = document.createElement('img');
          const numberString = String(number); // Convert to string
          let imagePath;
          if(numberString.startsWith(`0`)){
            let x = numberString.substring(1);
            if (x % wolfRatio == 0) { //check if the character is a wolf
              imagePath = `images/1_icon.png`;
            } else { //check if the character is a villager
              imagePath = `images/0_icon.png`;
            }
          } else { //all other character's whose character's ids don't start with 0
            imagePath = `images/${numberString}_icon.png`;
          };
          icon.src = imagePath;
          icon.classList.add('character-icon');
          icon.id = `character-icon-${number}`;
          characterCell.appendChild(icon);
          // Track the width of the icon
            const iconHeight = icon.clientHeight;
            const iconWidth = icon.clientWidth;
            if (iconWidth > maxCellWidth) {
              maxCellWidth = iconWidth;
            }
            // Adjust the height of the character cell based on the icon height
            characterCell.style.height = `${Math.max(iconHeight, 100)}px`; // Set a minimum height of 100px for character cells

        // Add character name text to the cell
          const characterName = getCharacterName(number);
          const nameContainer = document.createElement('span');
          nameContainer.appendChild(document.createTextNode(characterName));
          nameContainer.classList.add('default')
          nameContainer.id    = `character-name-${number}`;
          characterCell.appendChild(nameContainer);

        // Create radio button for the poisoned row
          const poisonedRadio = document.createElement('input');
          poisonedRadio.type  = 'radio';
          poisonedRadio.name  = `poisoned`;
          poisonedRadio.value = number;
          poisonedRadio.id    = `poisoned-radio-${number}`;
          poisonedCell.appendChild(poisonedRadio);

        // Create dead toggle switch for the dead row
          const deadSwitch    = document.createElement('input');
          deadSwitch.type     = 'checkbox';
          deadSwitch.value    = number;
          deadSwitch.id       = `dead-switch-${number}`;
          deadCell.appendChild(deadSwitch);

        // Create done toggle switch for the done row
          const doneSwitch    = document.createElement('input');
          doneSwitch.type     = 'checkbox';
          doneSwitch.value    = number;
          doneSwitch.id       = `done-switch-${number}`;
          doneCell.appendChild(doneSwitch);      

        characterCell.setAttribute('data-character', number); // Set data-character attribute
        poisonedCell.setAttribute('data-character', number);  // Set data-character attribute
        deadCell.setAttribute('data-character', number);      // Set data-character attribute
        doneCell.setAttribute('data-character', number);      // Set data-character attibute
      });

    // Set the width for all character cells based on the width of the icon
      Array.from(charactersRow.cells).forEach(cell => {
        cell.style.width = `${Math.max(maxCellWidth, 200)}px`; // Set a minimum width of 200px for character cells
      });

    // Populate notes row with text areas for notes
      result.forEach(number => {
        const notesTextAreaCell = notesRow.insertCell();
        const notesTextArea     = document.createElement('textarea');
        notesTextArea.rows      = 3; // Set the number of rows as needed
        notesTextArea.id        = `notes-${number}`;
        notesTextAreaCell.appendChild(notesTextArea);
      });

    // Append the rows to the table
      resultContainer.appendChild(table);

    // Generate and append images under the table
      result.forEach(number => {
        const img = document.createElement('img');
        const numberString = String(number); // Convert to string
        let imagePath;
        if(numberString.startsWith(`0`)){ //checks if it's wolf or a villager
          let x = numberString.substring(1);        
          if (x % wolfRatio == 0) { //checks if it's a wolf
            imagePath = `images/1_pt.png`;
          } else { //checks if it's a villager
            imagePath = `images/0_pt.png`;
          }
        } else { //all other characters
          imagePath = `images/${numberString}_pt.png`;
        };
        img.src = imagePath;
        img.setAttribute('data-image-number', number);
        img.classList.add('generated-image');
        img.id = `generated-image-${number}`;
        resultContainer.appendChild(img);
        // Add click event listener to copy image to clipboard
          img.addEventListener('click', async () => {
            try {
              const response = await fetch(img.src);
              const blob = await response.blob();
              const item = new ClipboardItem({ 'image/png': blob });
              await navigator.clipboard.write([item]);
            } catch (error) {
              alert.error('Error copying image to clipboard:', error);
            }
          });
      });
  }

  //ADD DIFFERENT BUTTONS UNDER THE TABLE
    //Clean script clicked overlays (keep dead, poisoned, etc.)
    const resetScriptButton     = document.createElement('button');
    resetScriptButton.id        = 'reset-script';
    resetScriptButton.innerText = 'Limpar Guião'
    resetScriptButton.addEventListener('click', resetScript);
    resultContainer.appendChild(resetScriptButton);

    //Toggle on/off the first night script part
    const prepNightToggle       = document.createElement('button');
    prepNightToggle.id          = 'pn-toggle';
    prepNightToggle.innerText   = 'Desativar/Ativar Noite de Preparação';
    prepNightToggle.addEventListener('click', togglePrepNight);
    resultContainer.appendChild(prepNightToggle);

    //Toggle on/off the second night script part
    const secondNightToggle     = document.createElement('button');
    secondNightToggle.id        = 'sn-toggle';
    secondNightToggle.innerText = 'Desativar/Ativar Segunda Noite';
    secondNightToggle.addEventListener('click', toggleSecondNight);
    resultContainer.appendChild(secondNightToggle);

  //---------------------//
  //Information: Need to create empty p for every character that isn't in the script to have IDs for all the characters otherwise the style application doesn't work for some reason

  /**
   * How the script goes:
   * 
   * Fist Night:
   * 15. Irmãs
   * 28. Irmãos
   * 3. Cupido
   * 23. Criança Selvagem
   * 18. Acusador
   * 25. Chefe dos Lobisomens
   * 
   * Second Night:
   * 21. Cão-Lobo
   * 22. Ladrão
   * Acordar todos os que estão na equipa dos maus
   * 
   * Every Night:
   * 32. Pirômano
   * 29. (A cada 3 execuções) Ator (with the list of the dead playable characters)
   * 17. Sonâmbulo
   * 5. Vidente (+ mortos automaticos - se calhar com um confirm button)
   * 2. Bruxa
   * 7. Mestre do Urso
   * 8. Mestre da Raposa
   * 22. Ladrão
   * 1. Lobisomens
   * 30. Lobisomem Vidente
   * 26. Lobisomem Vampiro
   * 24. (A cada 3 noites) Lobisomem Branco
   * 4. Chaman
   * 
   * Fixes (add them automatically to the script (maybe on top of the Every Night part) would be huge (mostly more easy with the # ones)):
   * 14. Ressuscitar alguém
   * 6. Chefe da Aldeia Morto #
   * 11. Caçador Morto #
   * 3. Cupido Morto #
   * 23. Criança Selvagem se Pai morto
   * Inimigo que Ganhou
   * 
   */

  //EMPTY LINE GENERATOR
  const emptyLine = document.createElement('p');
  emptyLine.textContent = '&nbsp';

  // Add a section for the night preparation information
    const nightPrepSection  = document.createElement('div');
    nightPrepSection.id     = 'night-preparation-section';
    // Add title
      const title           = document.createElement('h2');
      title.textContent     = 'Noite de preparação';
      nightPrepSection.appendChild(title);

    // Add paragraphs based on characters in the result
    if(result.includes(1)){
      addPnTxtWithToggle(1, ' ! Relembro que na primeira noite nehuma morte acontecerá.')
    }

    if (result.includes(15)) {
      addPnTxtWithToggle(15, ' - Irmãs acordam para se conhecerem.');
    }

    if (result.includes(28)) {
      addPnTxtWithToggle(28, ' - Irmãos acordam para se conhecerem.');
    }

    if (result.includes(3)) {
      addPnTxtWithToggle(3, ' - Cupido acorda e aponta para dois jogadores que se tornaram Namorados. O Cupido adormece e os Namorados serão agora tocados e podem acordar para ver quem é seu amado. Lembro que os Namorados têm como objectivo de ganharem juntos');
    }

    if (result.includes(23)) {
      addPnTxtWithToggle(23, ' - Criança Selvagem acorda e aponta para o jogador que ela escolhe como pai adotivo.');
    }

    if (result.includes(18)) {
      addPnTxtWithToggle(18, ' - Acusador acorda e escolhe um Bode Expiatório.');
    }

    if (result.includes(25)) {
      const fakeCharactersText = fakeCharacters.map(number => `${number}. ${getCharacterName(number)}`).join(', ');
      addPnTxtWithToggle(25, ` - Chefe dos Lobisomens acorda e o Narrador mostra-lhe as personagens falsas: ${fakeCharactersText}`);
    }

    if (result.includes(2)) {
      const poisanableCharactersText = poisanableCharacters.map(number => `${number}. ${getCharacterName(number)}`).join(', ');
      addPnTxtWithToggle(2, ` - Bruxa Malvada acorda e aponta para quem quer envenenar. Se for necessário o Narrador toca na cabeça do jogador envenenado. (${poisanableCharactersText})`);
    }

    if (result.includes(22)) {
      addPnTxtWithToggle(22, ' - Ladrão acorda e aponta para o jogador que não terá direito ao voto no próximo dia.');
    }

    if (result.includes(8)) {
      addPnTxtWithToggle(8, ' - Mestre da Raposa acorda e aponta para um jogador, e é-lhe indicado por um polegar para cima se esse jogador ou os seus vizinhos são Criaturas Malvadas.');
    }

    if (result.includes(7)) {
      addPnTxtWithToggle(7, ' - Urso rosna/não rosna.');
    }

    //creating the remaining non existing tags for compatibility reasons
    for (let i = 0; i < allCharacters.length; i++) {
      const paragraph = document.createElement('p');
      paragraph.id = `pn-txt-${allCharacters[i]}`;
      nightPrepSection.appendChild(paragraph);
    }

    resultContainer.appendChild(nightPrepSection);   // Add the night preparation section to the result container

    // Function to add a paragraph with a click event for toggling .done class --> for some reason it needs to be here
    function addPnTxtWithToggle(characterNumber, text) {
      // Create a paragraph element with the desired id
      const paragraph       = document.createElement('p');
      paragraph.id          = `pn-txt-${characterNumber}`;
      paragraph.textContent = text;
      nightPrepSection.appendChild(paragraph); // Add the paragraph to the nightPrepSection

      // Add an empty line
      nightPrepSection.appendChild(emptyLine);

      const index = allCharacters.indexOf(characterNumber);
      if (index !== -1) {
        allCharacters.splice(index, 1);
      } //no idea what this does anymore

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

  if (result.includes(1)) {
    const alliesTxt    = allies.map(number    => `${number}. ${getCharacterName(number)}`).join(', ');
    const flexiblesTxt = flexibles.map(number => `${number}. ${getCharacterName(number)}`).join(', ');
    addSnTxtWithToggle(1, ` - Lobisomens acordam e o Narrador aponta-lhes quem são os Aliados (${alliesTxt} e se calhar: ${flexiblesTxt})`);
  }

  //creating the remaining non-existing tags for compatibility reasons
  for (let i = 0; i < allCharacters.length; i++) {
    const paragraph = document.createElement('p');
    paragraph.id = `sn-txt-${allCharacters[i]}`;
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

    const index = allCharacters.indexOf(characterNumber);
    if (index !== -1) {
      allCharacters.splice(index, 1);
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

  // Add title for all nights
  const nightsTitle = document.createElement('h2');
  nightsTitle.textContent = 'Todas as noites.';
  nightsSection.appendChild(nightsTitle);

  // Add paragraphs based on characters in the result
  if (result.includes(32)) {
    addNnTxt(32, ' - SE J. CHAMADO AO T. MAS NÃO EXECUTADO: Pirômano escolhe com o polgar para cima se quer ou não incendiar a casa do jogador que foi a tribunal mas não foi executado, esse jogador morrerá se for um Lobisomem, senão simplesmente perderá o seu poder para sempre.');
  }

  if (result.includes(29)) {
    addNnTxt(29, ' - A CASA 3 EXECUÇÕES: Ator vai tomar o papel de um jogador que foi executado até agora: ---', true);
  }

  if (result.includes(17)) {
    addNnTxt(17, ' - Sonâmbulo acorda e escolhe um jogador para visitar. Esse jogador será tocado e não poderá acordar nessa noite mesmo sendo chamado pelo Narrador.');
  }

  if (result.includes(5)) {
    addNnTxt(5, ' - (Se alguém foi morto no dia passado) Vidente acorda e o Narrador mostra-lhe a identidade do executado.');
  }

  if (result.includes(2)) {
    const poisanableCharactersText = poisanableCharacters.map(number => `${number}. ${getCharacterName(number)}`).join(', ');
    addNnTxt(2, ` - Bruxa Malvada acorda e aponta para quem quer envenenar. Se for necessário o Narrador toca na cabeça do jogador envenenado. (${poisanableCharactersText})`);
  }

  if (result.includes(7)) {
    addNnTxt(7, ' - Urso rosna/não rosna.');
  }

  if (result.includes(8)) {
    addNnTxt(8, ' - Mestre da Raposa acorda e aponta para um jogador, e é-lhe indicado por um polegar para cima se esse jogador ou os seus vizinhos são maus.');
  }

  if (result.includes(22)) {
    addNnTxt(22, ' - Ladrão acorda e aponta para o jogador que não terá direito ao voto no próximo dia.');
  }

  if (result.includes(1)) {
    addNnTxt(1, ' - Lobisomens acordam e apontam para quem querem assassinar.');
  }

  if (result.includes(30)) {
    addNnTxt(30, ' - Lobisomem Vidente escolhe se quer ver a identidade da vitíma mas salvá-la com o pulgar para cima ou não');
  }  

  if (result.includes(26)) {
    addNnTxt(26, 'Se o Lobisomem Vampiro quiser transformar a vítima, ficará acordado a apontar para a vítima. A vítima será tocada na cabeça.');
  }

  if (result.includes(24)) {
    addNnTxt(24, ' - A CADA 3 NOITES OU SE ENVENENADO: Lobisomem Branco: acorda e escolhe um Lobisomem para matar: ', true);
  }

  if (result.includes(4)) {
    addNnTxt(4, ' - Chaman acorda e vê quem foi assassinado, indica se o quer salvar com o polegar para cima.');
  }

  // Add subtitle
  const subtitle = document.createElement('h3');
  subtitle.textContent = 'RESOLVER VÁRIAS COISAS:';
  nightsSection.appendChild(subtitle);

  // Add paragraphs for resolving various things
  if (result.includes(14)) {
    addNnTxt(14, ' - Se o Anjo resuscitou alguém, ter atenção a isso.');
  }

  if (result.includes(6)) {
    const fakeCharactersText = fakeCharacters.map(number => `${number}. ${getCharacterName(number)}`).join(', ');
    addNnTxt(6, ` - Se o Chefe de Aldeia for assassinado pelos Lobisomens, o Lobisomem afetado é avisado, tocando-lhe na cabeça e pedindo para acordar e ver as indicações silenciosas do Narrador (o Lobisomem se torna o último personagem desta lista: ${fakeCharactersText})`);
  }

  if (result.includes(11)) {
    addNnTxt(11, ' - Se o Caçador morto ainda não tiver escolhido a vítima, o Narrador acorda-o tocando-lhe na cabeça e sem dizer nada espera que ele aponte para uma vítima.');
  }

  if (result.includes(3)) {
    addNnTxt(3, ' - Se o Cupido for morto, vai acordar agora e escolher dois jogadores que serão Inimigos: se um Inimigo consegue condenar o outro a execução, o primeiro recebe imunidade na próxima tentativa de assassinato.');
  }

  if (result.includes(23)) {
    addNnTxt(23, ' - Se Criança Selvagem for envenenada, acorda por toque e sem o Narrador dizer nada, terá de escolher um novo pai adotivo.');
  }

  //creating the remaining non-existing tags for compatibility reasons
  for (let i = 0; i < allCharacters.length; i++) {
    const paragraph = document.createElement('p');
    paragraph.id = `nn-txt-${allCharacters[i]}`;
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

    //I don't know what this is
    const index = allCharacters.indexOf(characterNumber);
    if (index !== -1) {
      allCharacters.splice(index, 1);
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
  const poisonedRadios  = document.querySelectorAll('input[id^="poisoned-radio-"]');
  const deadSwitches    = document.querySelectorAll('input[id^="dead-switch-"]');
  const doneSwitches    = document.querySelectorAll('input[id^="done-switch-"]');
  const hostRadios      = document.querySelectorAll('input[id^="host-radio-"]');

  poisonedRadios.forEach(radio => {
    radio.addEventListener('change', handlePoisonedChange);
  });

  deadSwitches.forEach(switchElem => {
    switchElem.addEventListener('change', handleDeadChange);
  });

  doneSwitches.forEach(switchElem => {
    switchElem.addEventListener('change', handleDoneChange);
  });

  hostRadios.forEach(switchElem => {
    switchElem.addEventListener('change', handleHostChange);
  })
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
  allPoisonedIcon.forEach(element     => element.classList.remove('poisoned-icon'));

  //Add the .poisoned-character style to extra wolves
  if (characterNumber.toString().startsWith('0')){ //checks the ones that start with 0 -> so either villager or wolf
    let x = characterNumber.toString().substring(1); //cuts the first number to keep only the last
    if (x % wolfRatio == 0) { //if it is a wolf, let it be poisoned
      characterNameElement.classList.add('poisoned-character');
      characterIconElement.classList.add('poisoned-icon');
      document.getElementById(`pn-txt-1`).classList.add('poisoned-character');
      document.getElementById(`sn-txt-1`).classList.add('poisoned-character');
      document.getElementById(`nn-txt-1`).classList.add('poisoned-character');
    } else {
      characterNameElement.classList.add('poisoned-character');
      characterIconElement.classList.add('poisoned-icon');
    }

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
    if(characterNumber.toString() == 1){ //removes the .dead-character style from werewolves script texts
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

// Function to handle changes in the host radio buttons
function handleHostChange(event) {
  const characterNumber = event.target.value;
  const characterNameElement = document.getElementById(`character-name-${characterNumber}`);
  const characterPnTxt       = document.getElementById(`pn-txt-${characterNumber}`);
  const characterSnTxt       = document.getElementById(`sn-txt-${characterNumber}`);
  const characterNnTxt       = document.getElementById(`nn-txt-${characterNumber}`);

  // Remove the .host-character style from all elements in the page
  const allHostElements = document.querySelectorAll('.host-character');
  allHostElements.forEach(element => element.classList.remove('host-character'));

  //Add the .host-character style to extra wolves
  if (characterNumber.toString().startsWith('0')){ //checks the ones that start with 0 -> so either villager or wolf
    let x = characterNumber.toString().substring(1); //cuts the first number to keep only the last
    if (x % wolfRatio == 0) { //if it is a wolf, let it be host
      characterNameElement.classList.add('host-character');
      document.getElementById(`pn-txt-1`).classList.add('host-character');
      document.getElementById(`sn-txt-1`).classList.add('host-character');
      document.getElementById(`nn-txt-1`).classList.add('host-character');
    } else {
      characterNameElement.classList.add('host-character');
    }

  } else if (event.target.checked) {
    // If the host button is checked, apply the .host-character style
    //characterNameElement.classList.remove('default');
    //characterPnTxt.classList.remove('default');
    //characterSnTxt.classList.remove('default');
    //characterNnTxt.classList.remove('default');
    characterNameElement.classList.add('host-character');
    characterPnTxt.classList.add('host-character');
    characterSnTxt.classList.add('host-character');
    characterNnTxt.classList.add('host-character');
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
    case 29: return 'Ator';
    case 30: return 'Lobisomem Videnete';
    case 31: return 'Paranoico';
    case 32: return 'Pirômano'

    case 152: return 'Irmã';
    case 282: return 'Irmão';
    case 283: return 'Irmão';

    default: return 'Aldeão Triste'; //this may the problem on why the extra werewolves are taking the Aldeão name
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
    document.getElementById("result-container").innerHTML = "Sem jogadores suficientes! (mínimo 8)";
    return;
  } else if (x < 10) {
    availableNumbers = [7,10,11,14,16,31,32,26,21,22,23,24];
  } else if (x < 15) {
    availableNumbers = [7,8,9,10,11,12,13,14,16,17,19,31,32,20,26,30,27,21,22,23,24];
  } else if (x < 20) {
    availableNumbers = [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,29,30,31,32];
  } else {
    availableNumbers = [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,29,30,31,32,28];
  }

if (x <= maxChar) {
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
} else {
    while (result.length < maxChar && availableNumbers.length > 0) {
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
  }

  return result;
}

// Function to shuffle an array
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}