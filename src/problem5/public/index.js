// Connect to the scoreboard WebSocket
const ws = new WebSocket('ws://localhost:3001/ws/scoreboard');

ws.onopen = () => {
  console.log('Connected to scoreboard WebSocket');
  updateDashboard([]); // Call once on connect
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  updateDashboard(message.data);
};  

ws.onerror = (err) => {
  console.error('WebSocket error:', err);
};

function updateDashboard(scores) {
  const table = document.getElementById('scoreboard-table');
  if (!table) return;
  table.innerHTML = `
    <tr><th>Rank</th><th>Username</th><th>Score</th></tr>
    ${scores.map((user, i) => `<tr><td>${i + 1}</td><td>${user.username}</td><td>${user.score}</td></tr>`).join('')}
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  // Initial empty table
  updateDashboard([]);
});
