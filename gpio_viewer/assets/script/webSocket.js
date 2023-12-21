var ws;
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
  source.addEventListener(
    "open",
    function (e) {
      console.log("Events Connected");
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
  source.addEventListener(
    "gpio-state",
    function (e) {
      var states = JSON.parse(e.data);
      for (var gpio in states) {
        setIndicatorColor("gpio" + gpio, states[gpio]);
      }
    },
    false
  );
  source.addEventListener(
    "free_heap",
    function (e) {
      document.getElementById("freeHeap").innerHTML = "Free Heap:" + e.data;
    },
    false
  );
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
  if (valueElement) {
    if (state.t == 0) {
      // It's a digital pin
      if (state.v == 0) {
        valueElement.textContent = "LOW";
      } else {
        if (state.v == 1) {
          valueElement.textContent = "HIGH";
        } else {
          valueElement.textContent = state.v;
        }
      }
    } else {
      valueElement.textContent = state.v;
    }
  }
}

// window.addEventListener("load", initWebSocket);
window.addEventListener("load", initEventSource);
