const form = document.getElementById("transaction-form");
const balanceDisplay = document.getElementById("balance");
const list = document.getElementById("transaction-list");
const ctx = document.getElementById("expense-chart").getContext("2d");
const preview = document.getElementById("preview");
const downloadBtn = document.getElementById("download-csv");
const toggleTheme = document.getElementById("toggle-theme");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function updateLocalStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function updateBalance() {
  const total = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  balanceDisplay.innerText = `Current Balance: ₹${total.toFixed(2)}`;
}

function renderTransactions() {
  list.innerHTML = "";
  transactions.forEach((tx, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${tx.desc} - ₹${tx.amount} [${tx.category}]
      <button onclick="deleteTransaction(${index})">X</button>
    `;
    list.appendChild(li);
  });
}

function deleteTransaction(index) {
  transactions.splice(index, 1);
  updateLocalStorage();
  init();
}

function updateChart() {
  const categoryTotals = {};
  transactions.forEach(tx => {
    categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
  });

  const chartData = {
    labels: Object.keys(categoryTotals),
    datasets: [{
      label: "Expenses",
      data: Object.values(categoryTotals),
      backgroundColor: [
        "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"
      ]
    }]
  };

  if (window.pieChart) window.pieChart.destroy();
  window.pieChart = new Chart(ctx, {
    type: "pie",
    data: chartData
  });
}

function updatePreview() {
  if (transactions.length === 0) {
    preview.innerHTML = "<p>No transactions yet.</p>";
    return;
  }

  const table = document.createElement("table");
  table.border = "1";
  table.innerHTML = "<tr><th>Description</th><th>Amount</th><th>Category</th></tr>";
  transactions.forEach(tx => {
    const row = table.insertRow();
    row.insertCell(0).innerText = tx.desc;
    row.insertCell(1).innerText = tx.amount;
    row.insertCell(2).innerText = tx.category;
  });

  preview.innerHTML = "";
  preview.appendChild(table);
}

function downloadCSV() {
  if (transactions.length === 0) return;

  let csv = "Description,Amount,Category\n";
  transactions.forEach(tx => {
    csv += `${tx.desc},${tx.amount},${tx.category}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "finance_report.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const desc = document.getElementById("desc").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;

  if (isNaN(amount) || !desc) return;

  transactions.push({ desc, amount, category });
  updateLocalStorage();
  form.reset();
  init();
});

downloadBtn.addEventListener("click", downloadCSV);

toggleTheme.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

function init() {
  updateBalance();
  renderTransactions();
  updateChart();
  updatePreview();
}

init();
