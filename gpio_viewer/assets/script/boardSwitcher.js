async function loadHtmlSnippet(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.error('Could not load HTML snippet:', error);
    }
}

async function initializeMenu() {
    const menuHtml = await loadHtmlSnippet('html/menu.html');
    if (menuHtml) {
        const headerElement = document.querySelector('.header'); // Target the header element
        if (headerElement) {
            headerElement.insertAdjacentHTML('afterbegin', menuHtml); // Prepend the content to the header element
            await populateMenu(); // Ensure this is called after the HTML snippet is added
        }
    }
}


async function loadBoardsData() {
  try {
    const response = await fetch("boards.json");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Could not load boards data:", error);
  }
}

async function populateMenu() {
    const boardsData = await loadBoardsData();
    if (!boardsData) return;

    const selector = document.getElementById('boardSelector');
    if (!selector) {
        console.error('boardSelector element not found');
        return;
    }

    boardsData.forEach(board => {
        const option = document.createElement('option');
        option.value = board.name;
        option.textContent = board.name;
        selector.appendChild(option);
    });
}

function switchBoard() {
  const selector = document.getElementById("boardSelector");
  const selectedBoardName = selector.value;
  loadBoardsData().then((boardsData) => {
    const board = boardsData.find((b) => b.name === selectedBoardName);

    if (board) {
      document.getElementById("boardStyleSheet").href = board.css;
      document.getElementById("boardImage").src = board.image;
    }
  });
}

window.onload = initializeMenu; 
