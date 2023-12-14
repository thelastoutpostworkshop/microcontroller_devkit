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
  "#ff6f00",
  "#ff0000"  // Red
];

function initWebSocket() {
  ws = new WebSocket("ws://" + window.location.hostname + ":" + serverPort + "/ws");
  ws.onmessage = function (event) {
    var states = JSON.parse(event.data);
    for (var gpio in states) {
      setIndicatorColor("gpio" + gpio, states[gpio]);
    }
  };
}

function setIndicatorColor(indicatorId, value) {
  const indicator = document.getElementById(indicatorId);
  if (!indicator) return;

  value = Math.max(0, Math.min(value, 256));

  const index = Math.floor((value / 256) * (colors.length - 1));

  indicator.style.backgroundColor = colors[index];
}

window.addEventListener("load", initWebSocket);
