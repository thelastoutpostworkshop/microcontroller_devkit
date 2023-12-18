var boardsData;
var isValuesVisible = true;

async function loadHtmlSnippet(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Could not load HTML snippet from URL '${url}':`, error);
  }
}

async function initializeMenu() {
  const menuHtml = await loadHtmlSnippet("html/menu.html");
  if (menuHtml) {
    const headerElement = document.querySelector(".header"); // Target the header element
    if (headerElement) {
      headerElement.insertAdjacentHTML("afterbegin", menuHtml); // Prepend the content to the header element
      await populateMenu(); // Ensure this is called after the HTML snippet is added
      await switchBoard();
      document.getElementById("toggleValues").addEventListener("change", function () {
        adjustValuesVisibility();
      });
    }
  }
}

function toggleValuesVisibility() {
  isValuesVisible = !isValuesVisible;
  adjustValuesVisibility();
}

function adjustValuesVisibility() {
  const values = document.querySelectorAll(".value");
  values.forEach((value) => {
    value.style.display = isValuesVisible ? "" : "none";
  });
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
  boardsData = await loadBoardsData();
  if (!boardsData) return;

  const selector = document.getElementById("boardSelector");
  if (!selector) {
    console.error("boardSelector element not found");
    return;
  }

  // Track the index to identify the first element
  let isFirstOption = true;

  boardsData.forEach((board) => {
    const option = document.createElement("option");
    option.value = board.name;
    option.textContent = board.name;

    // If it's the first option, select it
    if (isFirstOption) {
      option.selected = true;
      isFirstOption = false;
    }

    selector.appendChild(option);
  });
}

async function switchBoard() {
  const selector = document.getElementById("boardSelector");
  const selectedBoardName = selector.value;

  // const boardsData = await loadBoardsData();
  // console.log("Loaded boards data:", boardsData); // Debugging line

  const board = boardsData.find((b) => b.name === selectedBoardName);
  console.log("Selected board:", board); // Debugging line

  if (board) {
    document.getElementById("defaultStyleSheet").href = "css/default.css";
    document.getElementById("boardStyleSheet").href = board.css;
    document.getElementById("boardImage").src = board.image;

    // Load and replace only the indicators div
    try {
      const pinsHtml = await loadHtmlSnippet(board.pins);
      const oldIndicatorsElement = document.getElementById("indicators");
      if (pinsHtml && oldIndicatorsElement) {
        const newIndicatorsElement = document.createElement("div");
        newIndicatorsElement.innerHTML = pinsHtml;

        oldIndicatorsElement.replaceWith(newIndicatorsElement);
      } else {
        console.error("Pins HTML or indicators element not found");
      }
    } catch (error) {
      console.error(`Error loading pins HTML from ${board.pins}:`, error);
    }
  } else {
    console.error(`Board not found for name: ${selectedBoardName}`);
  }
}

window.onload = initializeMenu;
