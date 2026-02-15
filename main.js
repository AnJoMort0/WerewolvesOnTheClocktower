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
            option.value = character;
            option.textContent = character;
            select.appendChild(option);
        });

        cell.appendChild(select);
        characterRow.appendChild(cell);
    }

    table.appendChild(characterRow);

    tableContainer.appendChild(table);
});