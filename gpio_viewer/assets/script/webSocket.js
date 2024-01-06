var ws;
var gpioStates = {};
const colors = [
  "#00ff00", // Green
  "#1fff00",
  "#3eff00",
  "#5dff00",
  "#7cff00",
  "#9bff00",
  "#baff00",
  "#d9ff00",
  "#f8ff00",
  "#ffff00", // Yellow
  "#ffef00",
  "#ffdf00",
  "#ffcf00",
  "#ffbf00",
  "#ffaf00",
  "#ff9f00",
  "#ff8f00",
  "#ff7f00",
  "#FE5454",
  "#ff0000", // Red
];

function initEventSource() {
  console.log("Waiting to connect to ESP32: with EventSource: ");
  console.log(source);
  source.addEventListener(
    "open",
    function (e) {
      console.log("Events Connected");
      source.addEventListener(
        "gpio-state",
        function (e) {
          var states = JSON.parse(e.data);
          saveBoardStates(states);
          setAllIndicatorColor(states);
        },
        false
      );
      source.addEventListener(
        "free_heap",
        function (e) {
          var freeHeap = document.getElementById("freeHeap");
          if(freeHeap) {
            freeHeap.innerHTML = "Free Heap:" + e.data;
          }
        },
        false
      );
    },
    false
  );
  source.addEventListener(
    "error",
    function (e) {
      if (e.target.readyState != EventSource.OPEN) {
        console.log("Events Disconnected");
      }
    },
    false
  );
}

function saveBoardStates(states) {
  for (var gpio in states) {
    if (states.hasOwnProperty(gpio)) {
      gpioStates[gpio] = states[gpio];
    }
  }
}

function setAllIndicatorColor(states) {
  for (var gpio in states) {
    setIndicatorColor("gpio" + gpio, states[gpio]);
  }
}

function setIndicatorColor(indicatorId, state) {
  // Find the indicator within the 'indicators' section
  const indicatorSection = document.getElementById("indicators");
  const indicator = indicatorSection.querySelector("#" + indicatorId);
  if (!indicator) return;

  // Set the color of the indicator
  value = Math.max(0, Math.min(state.s, 255));
  const index = Math.floor((state.s / 255) * (colors.length - 1));
  indicator.style.backgroundColor = colors[index];

  // Find the corresponding value element within the 'values' section
  const valuesSection = document.getElementById("values");
  const valueElement = valuesSection.querySelector("#" + indicatorId);
  displayValue = "";
  pinType = "";
  if (valueElement) {
    if (state.t == 0) {
      // It's a digital pin
      if (state.v == 0) {
        displayValue = "LOW";
      } else {
        if (state.v == 1) {
          displayValue = "HIGH";
        } else {
          displayValue = state.v;
        }
      }
    } else {
      displayValue = state.v;
    }
    switch (state.t) {
      case 0:
        pinType = "D";
        break;
      case 1:
        pinType = "P";
        break;
      case 2:
        pinType = "A";
        break;

      default:
        pinType = "X";
        break;
    }
    if (valueElement.classList.contains("value_right")) {
      // Update the text in the value-text div for 'value value_right'
      const valueText = valueElement.querySelector(".value-text");
      if (valueText) {
        valueText.textContent = pinType + " " + displayValue;
      }
    } else {
      // Update the text in the value-text div for 'value'
      const valueText = valueElement.querySelector(".value-text");
      if (valueText) {
        valueText.textContent = displayValue + " " + pinType;
      }
    }

    const bar = valueElement.querySelector(".value-bar");
    if (bar) {
      const maxValue = 255;
      const widthPercent = (value / maxValue) * 100;
      bar.style.width = widthPercent + "%";
    }
  }
}

window.addEventListener("load", initEventSource);
