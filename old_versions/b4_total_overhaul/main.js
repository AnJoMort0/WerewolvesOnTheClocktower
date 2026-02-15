//==================================================================================================//
//==================================================================================================//

//Werewolves on the Clocktower Guide Companion
//by AnJoMorto

//==================================================================================================//

/**Character List:**
1 - Lobisomem
2 - Bruxa Malvada
3 - Cupido
4 - Chaman
5 - Vidente
6 - Menina
7 - Caçador
8 - Cavaleiro Enferrujado
9 - Mestre do Urso
10 - Mestre da Raposa
11 - Mestre do Corvo
12 - Anjo
13 - Salvador
14 - Paranoico
15 - Capuchinho Vermelho
16 - Juiz
17 - Piromaníaco
18 - Marionetista
19 - Sonâmbulo
20 - Insomniaca
21 - Ator
22 - Substituto
23 - Cão-Lobo
24 - Ladrão
25 - Amante Secreto
26 - Lobisomem Branco
27 - Lobisomem Mau
28 - Lobisomem Vampiro
29 - Lobisomem Vidente
30 - Ankou
31 - Ilusionista
32 - Cupido Malvado
100 - Chefe da Aldeia
101 - Romântico Desesperado
102 - Criança Selvagem
103 - Astrónomo
104 - Idiota
105 - Irmãs
106 - Irmãos
0 - Aldeão Triste
**/

document.addEventListener("DOMContentLoaded", function () {
    const characterOptions = [
        "1 - Lobisomem",
        "2 - Bruxa Malvada",
        "3 - Cupido",
        "4 - Chaman",
        "5 - Vidente",
        "6 - Menina",
        "7 - Caçador",
        "8 - Cavaleiro Enferrujado",
        "9 - Mestre do Urso",
        "10 - Mestre da Raposa",
        "11 - Mestre do Corvo",
        "12 - Anjo",
        "13 - Salvador",
        "14 - Paranoico",
        "15 - Capuchinho Vermelho",
        "16 - Juiz",
        "17 - Piromaníaco",
        "18 - Marionetista",
        "19 - Sonâmbulo",
        "20 - Insomniaca",
        "21 - Ator",
        "22 - Substituto",
        "23 - Cão-Lobo",
        "24 - Ladrão",
        "25 - Amante Secreto",
        "26 - Lobisomem Branco",
        "27 - Lobisomem Mau",
        "28 - Lobisomem Vampiro",
        "29 - Lobisomem Vidente",
        "30 - Ankou",
        "31 - Ilusionista",
        "32 - Cupido Malvado",
        "100 - Chefe da Aldeia",
        "101 - Romântico Desesperado",
        "102 - Criança Selvagem",
        "103 - Astrónomo",
        "104 - Idiota",
        "105 - Irmãs",
        "106 - Irmãos",
        "0 - Aldeão Triste"
    ];

    const container = document.createElement("div");
    container.classList.add("table-container");

    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    thead.innerHTML = `
        <tr>
            <th>Nome</th>
            <th>Personagem</th>
        </tr>
    `;

    function createDropdown(inputField, dropdown, options) {
        dropdown.innerHTML = "";
        options.forEach(optionText => {
            const option = document.createElement("div");
            option.textContent = optionText;
            option.classList.add("dropdown-item");
            option.addEventListener("click", function () {
                inputField.value = optionText;
                dropdown.style.display = "none";
            });
            dropdown.appendChild(option);
        });
    }

    function addRow() {
        const row = document.createElement("tr");

        // Name input
        const nameCell = document.createElement("td");
        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameCell.appendChild(nameInput);

        // Character dropdown
        const characterCell = document.createElement("td");
        const charInput = document.createElement("input");
        charInput.type = "text";
        charInput.placeholder = "Escolha um personagem";
        const dropdown = document.createElement("div");
        dropdown.classList.add("dropdown");

        charInput.addEventListener("input", function () {
            const filteredOptions = characterOptions
                .filter(option => option.toLowerCase().includes(charInput.value.toLowerCase()));
            createDropdown(charInput, dropdown, filteredOptions);
            dropdown.style.display = "block";
        });

        charInput.addEventListener("focus", function () {
            createDropdown(charInput, dropdown, characterOptions);
            dropdown.style.display = "block";
        });

        document.addEventListener("click", function (event) {
            if (!charInput.contains(event.target) && !dropdown.contains(event.target)) {
                dropdown.style.display = "none";
            }
        });

        characterCell.appendChild(charInput);
        characterCell.appendChild(dropdown);

        row.appendChild(nameCell);
        row.appendChild(characterCell);
        tbody.appendChild(row);
    }

    function removeRow() {
        if (tbody.rows.length > 8) {
            tbody.deleteRow(tbody.rows.length - 1);
        }
    }

    function setRowCount() {
        let rowCount = parseInt(rowInput.value, 10);
        if (isNaN(rowCount) || rowCount < 8) {
            rowCount = 8;
            rowInput.value = 8;
        }

        // Adjust number of rows
        while (tbody.rows.length < rowCount) {
            addRow();
        }
        while (tbody.rows.length > rowCount) {
            removeRow();
        }
    }

    // Initialize 8 rows
    for (let i = 0; i < 8; i++) {
        addRow();
    }

    table.appendChild(thead);
    table.appendChild(tbody);
    container.appendChild(table);

    // Controls
    const controls = document.createElement("div");
    controls.classList.add("table-controls");

    const addButton = document.createElement("button");
    addButton.textContent = "+";
    addButton.addEventListener("click", addRow);

    const removeButton = document.createElement("button");
    removeButton.textContent = "-";
    removeButton.addEventListener("click", removeRow);

    const rowInput = document.createElement("input");
    rowInput.type = "number";
    rowInput.min = "8";
    rowInput.value = "8";

    const confirmButton = document.createElement("button");
    confirmButton.textContent = "Confirmar";
    confirmButton.addEventListener("click", setRowCount);

    controls.appendChild(addButton);
    controls.appendChild(removeButton);
    controls.appendChild(rowInput);
    controls.appendChild(confirmButton);

    container.appendChild(controls);
    document.body.appendChild(container);
});