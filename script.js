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
  
    // Generate random list
    const result = generateRandomList(playerCount, newMessagesContainer);
  
    // Display the result
  if (result) {
    resultContainer.innerHTML = `<p>Result: ${result.join(', ')}</p>`;
    result.forEach(number => {
      // Create image element for each number with a class
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