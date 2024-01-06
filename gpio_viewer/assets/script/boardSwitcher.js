var boardsData;
var isValuesVisible = true;
var currentGPIOViewerRelease;

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
      const updateNecessary = await fetchMinRelease();
      if (updateNecessary) {
        const updateHtml = await loadHtmlSnippet("html/update.html");
        headerElement.insertAdjacentHTML("afterbegin", updateHtml); // Prepend the content to the header element
      }
      await populateMenu();
      const infoView = document.getElementById("viewinfo");
      if (infoView) {
        if (typeof sampling_interval === "undefined") {
          sampling_interval = "?";
        }
        infoView.innerHTML =
          "<div>Pin Types D=Digital / A=Analog / P=PWM" +
          " and Sampling interval is " +
          sampling_interval +
          "ms" +
          " (Run by the GPIOViewer Library Release v" +
          currentGPIOViewerRelease +
          ")</div>";
      }
      await switchBoard();
      document.getElementById("toggleValues").addEventListener("change", function () {
        toggleValuesVisibility();
      });
    }
  }
}

async function fetchMinRelease() {
  try {
    const url = "http://" + ip + ":" + serverPort + "/release";
    const response = await fetch(url);
    const data = await response.json();
    currentGPIOViewerRelease = data.release;
    console.log("Current release:", currentGPIOViewerRelease);

    const versionResponse = await fetch("version.json");
    const versionData = await versionResponse.json();
    console.log("Minimum release supported by the Web Application:", versionData.minRelease);

    const res = compareVersions(versionData.minRelease, currentGPIOViewerRelease);
    if (res > 0) {
      console.log("Please Update GPIOViewer Library to the latest stable release");
      return true;
    }

    return false; // Return false if no update is needed
  } catch (error) {
    currentGPIOViewerRelease = "1.0.4 or less";
    console.error("Error fetching release version:", error);
    return true; // Update is needed
  }
}

function compareVersions(version1, version2) {
  var v1 = version1.split(".").map(Number);
  var v2 = version2.split(".").map(Number);

  for (var i = 0; i < Math.max(v1.length, v2.length); i++) {
    var num1 = v1[i] || 0; // Default to 0 if undefined
    var num2 = v2[i] || 0; // Default to 0 if undefined

    if (num1 < num2) {
      return -1; // version1 < version2
    }
    if (num1 > num2) {
      return 1; // version1 > version2
    }
  }
  return 0; // version1 == version2
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
  const lastSelectedBoard = getCookie("lastSelectedBoard");
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

  setCookie("lastSelectedBoard", selectedBoardName, 365);

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
        setAllIndicatorColor(gpioStates);
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
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

window.addEventListener("DOMContentLoaded", initializeMenu);