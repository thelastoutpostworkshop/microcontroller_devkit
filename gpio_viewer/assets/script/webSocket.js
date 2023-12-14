var ws;
function initWebSocket() {
  ws = new WebSocket("ws://" + window.location.hostname + ":" + serverPort + "/ws");
  ws.onmessage = function (event) {
    var states = JSON.parse(event.data);
    for (var gpio in states) {
      setIndicatorColor("gpio" + gpio, states[v]);
    }
  };
}

function setIndicatorColor(indicatorId, value) {
  const indicator = document.getElementById(indicatorId);
  if (!indicator) return; // Exit if the indicator is not found

  // Ensure the value is within the range [0, 256]
  value = Math.max(0, Math.min(value, 256));

  // Calculate the red and green components based on the value
  // The red component increases with the value, green decreases
  const red = Math.round((value / 256) * 255);
  const green = 255 - red;

  // Set the background color
  indicator.style.backgroundColor = `rgb(${red}, ${green}, 0)`;
}

window.addEventListener("load", initWebSocket);
