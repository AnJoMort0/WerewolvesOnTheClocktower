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

    const scriptContainer = document.createElement("div");
    scriptContainer.classList.add("script-container");
    document.body.appendChild(scriptContainer);

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
                updateScript();
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
            updateScript();
        }
    }

    function setRowCount() {
        let rowCount = parseInt(rowInput.value, 10);
        if (isNaN(rowCount) || rowCount < 8) {
            rowCount = 8;
            rowInput.value = 8;
        }

        while (tbody.rows.length < rowCount) {
            addRow();
        }
        while (tbody.rows.length > rowCount) {
            removeRow();
        }
        updateScript();
    }

    function updateScript() {
        const selectedCharacters = [];
        document.querySelectorAll("tbody tr").forEach(row => {
            const charInput = row.cells[1].querySelector("input");
            if (charInput.value) {
                selectedCharacters.push(charInput.value);
            }
        });

        const scriptText = generateScript(selectedCharacters);
        scriptContainer.innerHTML = `<h2>Roteiro de Jogo</h2>${scriptText}`;
    }

    function generateScript(selectedCharacters) {
        let script = "<h3>Primeira Noite</h3>";
        script += "<p>Esta noite não terá mortos.</p>";
        script += "<p>(Lançar um d12)</p>";

        if (selectedCharacters.includes("3 - Cupido")) {
            script += "<p>O Cupido acorda e escolhe dois jogadores que serão Namorados...</p>";
        }

        if (selectedCharacters.includes("32 - Cupido Malvado")) {
            script += "<p>O Cupido Malvado acorda e escolhe dois jogadores que serão Inimigos...</p>";
        }

        if (selectedCharacters.includes("105 - Irmãs")) {
            script += "<p>As Irmãs acordam para se conhecerem.</p>";
        }

        if (selectedCharacters.includes("106 - Irmãos")) {
            script += "<p>Os Irmãos acordam para se conhecerem.</p>";
        }

        if (selectedCharacters.includes("2 - Bruxa Malvada")) {
            script += "<p>A Bruxa Malvada acorda e escolhe um jogador para envenenar...</p>";
        }

        if (selectedCharacters.includes("11 - Mestre do Corvo")) {
            script += "<p>O Mestre do Corvo escolhe um jogador que terá automaticamente 2 votos contra...</p>";
        }

        script += "<h3>Início da Segunda Noite</h3>";

        if (selectedCharacters.includes("23 - Cão-Lobo")) {
            script += "<p>O Cão-Lobo acorda e escolhe se quer ser um Cão ou um Lobisomem...</p>";
        }

        if (selectedCharacters.includes("24 - Ladrão")) {
            script += "<p>O Ladrão acorda e escolhe se quer jogar do lado dos Aldeões ou dos Lobisomens...</p>";
        }

        if (selectedCharacters.includes("102 - Criança Selvagem")) {
            script += "<p>A Criança Selvagem acorda e escolhe o seu Pai Adotivo...</p>";
        }

        script += "<h3>Noite Normal</h3>";

        if (selectedCharacters.includes("14 - Paranoico")) {
            script += "<p>LEMBRA-TE (Se o Cavaleiro Enferrujado morreu, matar o Lobisomem mais próximo)</p>";
        }

        if (selectedCharacters.includes("20 - Insomniaca")) {
            script += "<p>O Sonâmbulo acorda e escolhe um jogador para visitar...</p>";
        }

        if (selectedCharacters.includes("5 - Vidente")) {
            script += "<p>Se alguém morreu, a Vidente acorda e vê os mortos...</p>";
        }

        if (selectedCharacters.includes("12 - Anjo")) {
            script += "<p>(Ressuscitar o jogador salvo pelo Anjo)</p>";
        }

        return script;
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
