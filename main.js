// Default language
const LANGUAGE = "PT";
const TXT = langData[LANGUAGE];

// Set title
document.title = TXT.title;


// Create number of players input
const numInput          = document.createElement("input");
numInput.type           = "number";
numInput.min            = "8";
numInput.placeholder    = TXT.numPlaceholder;
document.body.appendChild(numInput);

const createTableButton         = document.createElement("button");
createTableButton.textContent   = TXT.createTable;
document.body.appendChild(createTableButton);

// Create table
const tableContainer = document.createElement("div");
document.body.appendChild(tableContainer);
createTableButton.addEventListener("click", function () {
    const playerCount = parseInt(numInput.value);
    // Clear previous table if any
    tableContainer.innerHTML = "";
    if (isNaN(playerCount) || playerCount < 8) {
        alert(TXT.numPlayerError);
        return;
    }

    const table = document.createElement("table");
    table.border = "1";

    // Player Names Row
    const nameRow = document.createElement("tr");
    for (let j = 0; j < playerCount; j++) {
        const cell = document.createElement("td");

        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.placeholder = `${TXT.player} ${j + 1}`;

        cell.appendChild(nameInput);
        nameRow.appendChild(cell);
    }
    table.appendChild(nameRow);

    // Characters Row
    const characterRow = document.createElement("tr");
    for (let j = 0; j < playerCount; j++) {
        const cell = document.createElement("td");

        const select = document.createElement("select");

        TXT.characters.forEach(character => {
            const option = document.createElement("option");
            option.value = character.id;
            option.textContent = `${character.id}. ${character.name}`;
            select.appendChild(option);
        });

        select.addEventListener("change", updateScript);

        cell.appendChild(select);
        characterRow.appendChild(cell);
    }

    table.appendChild(characterRow);

    tableContainer.appendChild(table);

    updateScript();
});

// Create the script
const scriptContainer = document.createElement("div");
document.body.appendChild(scriptContainer);
function getSelectedCharacters() {
    const selects = tableContainer.querySelectorAll("select");
    const selected = [];

    selects.forEach(select => {
        if (select.value) {
            selected.push(select.value);
        }
    });

    return selected;
}
function updateScript() {
    console.log("working")
    const selectedCharacters = getSelectedCharacters();

    scriptContainer.innerHTML = ""; // clear previous script

    TXT.secondNightScript.forEach(step => {

        // If step has no requirements → always show
        if (!step.requires) {
            const p = document.createElement("p");
            p.textContent = step.text;
            scriptContainer.appendChild(p);
        }

        // If it has requirements → only show if character is selected
        else if (step.requires.some(id => selectedCharacters.includes(id))) {
            const p = document.createElement("p");
            p.textContent = step.text;
            scriptContainer.appendChild(p);
        }

    });
}
