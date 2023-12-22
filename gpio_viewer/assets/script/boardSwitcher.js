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
        toggleValuesVisibility();
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

  // Get last selected board from cookie
  const lastSelectedBoard = getCookie('lastSelectedBoard');
  let isFirstOption = true;

  boardsData.forEach((board) => {
    const option = document.createElement("option");
    option.value = board.name;
    option.textContent = board.name;

    // Select the option if it was the last selected board
    if (board.name === lastSelectedBoard) {
      option.selected = true;
      isFirstOption = false;
    }

    selector.appendChild(option);
  });

  // If a board was selected from the cookie, switch to it
  if (lastSelectedBoard) {
    await switchBoard();
  }
}


async function switchBoard() {
  const selector = document.getElementById("boardSelector");
  const selectedBoardName = selector.value;

  setCookie('lastSelectedBoard', selectedBoardName, 365); 

  const board = boardsData.find((b) => b.name === selectedBoardName);
  // console.log("Selected board:", board); // Debugging line

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
        adjustValuesVisibility();
        document.getElementById("freeRAM").innerHTML = "Free Sketch:" + freeSketchSpace;
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

function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}


window.onload = initializeMenu;
