let transactions = [
  { date: "2026-04-01", amount: 35000, category: "Salary", type: "income" },
  { date: "2026-04-02", amount: 2100, category: "Shopping", type: "expense" },
  { date: "2026-04-03", amount: 1200, category: "Food", type: "expense" },
  { date: "2026-04-04", amount: 1700, category: "Gym", type: "expense" },
  { date: "2026-04-03", amount: 1000, category: "Travel", type: "expense" },
  { date: "2026-04-05", amount: 1500, category: "Supplements", type: "expense" }
];

let role = "viewer";
let filter = "all";

let lineChart, pieChart;

// Event Listeners
document.getElementById("role").addEventListener("change", (e) => {
  role = e.target.value;
  render();
});

document.getElementById("filter").addEventListener("change", (e) => {
  filter = e.target.value;
  render();
});

document.getElementById("search").addEventListener("input", render);

document.getElementById("addBtn").addEventListener("click", () => {
  if (role !== "admin") {
    alert("Only admin can add transactions");
    return;
  }

  let amount = prompt("Enter amount:");
  let category = prompt("Enter category:");
  let type = prompt("income or expense:");

  if (!amount || !category || !type) return;

  transactions.push({
    date: new Date().toISOString().split("T")[0],
    amount: Number(amount),
    category,
    type
  });

  render();
});

function render() {
  renderSummary();
  renderTable();
  renderInsights();
  renderCharts();
}

function renderSummary() {
  let income = transactions
    .filter(t => t.type === "income")
    .reduce((a, b) => a + b.amount, 0);

  let expense = transactions
    .filter(t => t.type === "expense")
    .reduce((a, b) => a + b.amount, 0);

  document.getElementById("balance").innerText = "Balance: ₹" + (income - expense);
  document.getElementById("income").innerText = "Income: ₹" + income;
  document.getElementById("expense").innerText = "Expense: ₹" + expense;
}

function renderTable() {
  let table = document.getElementById("table");
  let search = document.getElementById("search").value.toLowerCase();

  let filtered = transactions.filter(t => {
    return (filter === "all" || t.type === filter) &&
      t.category.toLowerCase().includes(search);
  });

  table.innerHTML = `
    <tr>
      <th>Date</th><th>Category</th><th>Amount</th><th>Type</th><th>Action</th>
    </tr>
  `;

  filtered.forEach((t, index) => {
    table.innerHTML += `
      <tr>
        <td>${t.date}</td>
        <td>${t.category}</td>
        <td>₹${t.amount}</td>
        <td>${t.type}</td>
        <td>
          ${role === "admin" ? `<button onclick="deleteTx(${index})">Delete</button>` : ""}
        </td>
      </tr>
    `;
  });
}

function deleteTx(index) {
  transactions.splice(index, 1);
  render();
}

// INSIGHTS
function renderInsights() {
  let insightsDiv = document.getElementById("insights");

  let income = transactions
    .filter(t => t.type === "income")
    .reduce((a, b) => a + b.amount, 0);

  let expense = transactions
    .filter(t => t.type === "expense")
    .reduce((a, b) => a + b.amount, 0);

  let savings = income - expense;

  // Expense categories
  let categories = {};
  transactions
    .filter(t => t.type === "expense")
    .forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });

  let topCategory = "N/A";
  if (Object.keys(categories).length > 0) {
    topCategory = Object.keys(categories).reduce((a, b) =>
      categories[a] > categories[b] ? a : b
    );
  }

  let monthData = {};

  transactions.forEach(t => {
    let month = t.date.slice(0, 7); // YYYY-MM

    if (!monthData[month]) {
      monthData[month] = { income: 0, expense: 0 };
    }

    if (t.type === "income") {
      monthData[month].income += t.amount;
    } else {
      monthData[month].expense += t.amount;
    }
  });

  let months = Object.keys(monthData);
  let latestMonth = months[months.length - 1];

  let monthlyText = "No data";
  if (latestMonth) {
    let m = monthData[latestMonth];
    monthlyText = `Income: ₹${m.income}, Expense: ₹${m.expense}`;
  }

  let observation = "";

  if (expense > income) {
    observation = "⚠️ You are spending more than your income.";
  } else if (savings > income * 0.3) {
    observation = "✅ Great! You are saving a good amount.";
  } else {
    observation = "ℹ️ Try to increase your savings.";
  }

  insightsDiv.innerHTML = `
    <p><strong>💸 Highest Spending:</strong> ${topCategory}</p>
    <p><strong>📅 Monthly (Latest):</strong> ${monthlyText}</p>
    <p><strong>💰 Savings:</strong> ₹${savings}</p>
    <p><strong>📊 Observation:</strong> ${observation}</p>
  `;
}

function renderCharts() {
  let ctx1 = document.getElementById("lineChart");
  let ctx2 = document.getElementById("pieChart");

  if (lineChart) lineChart.destroy();
  if (pieChart) pieChart.destroy();

  let balance = 0;
  let labels = [];
  let data = [];

  transactions.forEach(t => {
    balance += t.type === "income" ? t.amount : -t.amount;
    labels.push(t.date);
    data.push(balance);
  });

  lineChart = new Chart(ctx1, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Balance Trend",
        data,
        borderColor: "blue",
        fill: false
      }]
    }
  });

  let categories = {};
  transactions
    .filter(t => t.type === "expense")
    .forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });

  pieChart = new Chart(ctx2, {
    type: "pie",
    data: {
      labels: Object.keys(categories),
      datasets: [{
        data: Object.values(categories),
        backgroundColor: ["red", "green", "blue", "orange"]
      }]
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {

  const toggleBtn = document.getElementById("themeToggle");

  // Load saved theme
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    toggleBtn.innerText = "☀️";
  }

  // Toggle click
  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
      localStorage.setItem("theme", "dark");
      toggleBtn.innerText = "☀️";
    } else {
      localStorage.setItem("theme", "light");
      toggleBtn.innerText = "🌙";
    }
  });
});

render();