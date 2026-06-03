function fillEmptyFields(totalPlayers) {
    const numPlayersInput = document.getElementById('numPlayers'); // Assuming this is the input element
    //let totalPlayers = parseInt(numPlayersInput.value);
    const mandatory = [1, 2, 3, 4, 5];
    const upTo10 = [7, 10, 11, 14, 16, 31, 32, 26, 21, 22];
    const upTo15 = [7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 19, 31, 32, 20, 26, 30, 27, 21, 22, 24];
    const upTo20 = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 29, 30, 31, 32];
    const upToInf = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 29, 30, 31, 32, 28];

    // Calculate the number of non-mandatory characters needed
    const nonMandatoryCount = totalPlayers - mandatory.length;

    // Select the appropriate pool based on the number of players
    let pool;
    if (totalPlayers <= 10) {
        pool = [...upTo10];
    } else if (totalPlayers <= 15) {
        pool = [...upTo15];
    } else if (totalPlayers <= 20) {
        pool = [...upTo20];
    } else {
        pool = [...upToInf];
    }

    // Randomly select non-mandatory numbers from the pool, ensuring uniqueness
    const nonMandatory = [];
    while (nonMandatory.length < nonMandatoryCount && pool.length > 0) {
        const randomIndex = Math.floor(Math.random() * pool.length);
        const num = pool.splice(randomIndex, 1)[0];
        nonMandatory.push(num);
    }

    // If more numbers are needed, add zeros and a 1 for every three zeros
    while (nonMandatory.length < nonMandatoryCount) {
        nonMandatory.push(0);
        if ((nonMandatory.filter(num => num === 0).length % 3) === 0) {
            nonMandatory.push(1);
        }
    }

    // Handle special cases for 15 and 28
    if (nonMandatory.includes(15)) {
        let replacementIndex = nonMandatory.indexOf(0);
        if (replacementIndex === -1) {
            replacementIndex = nonMandatory.findIndex(num => num !== 15 && num !== 152 && num !== 28);
        }
        if (replacementIndex !== -1) {
            nonMandatory[replacementIndex] = 152;
        }
    }

    if (nonMandatory.includes(28)) {
        let replacementIndices = [];
        nonMandatory.forEach((num, idx) => {
            if (num === 0 || (num !== 15 && num !== 152 && num !== 28)) {
                replacementIndices.push(idx);
            }
        });

        if (replacementIndices.length >= 2) {
            nonMandatory[replacementIndices[0]] = 282;
            nonMandatory[replacementIndices[1]] = 283;
        }
    }

    // Combine mandatory numbers with non-mandatory numbers
    const finalArray = [...nonMandatory, ...mandatory];

    // Shuffle the final array
    for (let i = finalArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [finalArray[i], finalArray[j]] = [finalArray[j], finalArray[i]];
    }

    // Return the final array
    return finalArray;
}
