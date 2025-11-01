
// ===========================
// Global Variables
// ===========================

let incomeData = [];
let expenseData = [];
let currentCurrency = 'BDT';
let currencySymbols = {
    'BDT': '৳',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'INR': '₹',
    'JPY': '¥'
};

let charts = {
    line: null,
    pie: null,
    bar: null
};

// ===========================
// Initialization
// ===========================

document.addEventListener('DOMContentLoaded', function() {
    // Set current date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('incomeDate').value = today;
    document.getElementById('expenseDate').value = today;
    
    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Load data from localStorage
    loadData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initial render
    renderAll();
});

// ===========================
// Event Listeners
// ===========================

function setupEventListeners() {
    // Currency selector
    document.getElementById('currencySelector').addEventListener('change', function() {
        currentCurrency = this.value;
        saveSettings();
        renderAll();
    });
    
    // Month filter
    document.getElementById('monthFilter').addEventListener('change', function() {
        renderAll();
    });
    
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Form submissions
    document.getElementById('incomeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveIncome();
    });
    
    document.getElementById('expenseForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveExpense();
    });
}

// ===========================
// Data Management
// ===========================

function loadData() {
    // Load from localStorage
    const savedData = localStorage.getItem('financialTrackerData');
    if (savedData) {
        const data = JSON.parse(savedData);
        incomeData = data.income || [];
        expenseData = data.expenses || [];
        currentCurrency = data.currency || 'BDT';
        document.getElementById('currencySelector').value = currentCurrency;
    }
    
    // Load theme
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        document.getElementById('themeToggle').innerHTML = '<i class="bi bi-sun-fill"></i>';
    }
}

function saveData() {
    const data = {
        income: incomeData,
        expenses: expenseData,
        currency: currentCurrency,
        lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('financialTrackerData', JSON.stringify(data));
}

function saveSettings() {
    saveData();
}

// ===========================
// Income Functions
// ===========================

function resetIncomeForm() {
    document.getElementById('incomeForm').reset();
    document.getElementById('incomeId').value = '';
    document.getElementById('incomeModalTitle').textContent = 'Add Income';
    document.getElementById('incomeDate').value = new Date().toISOString().split('T')[0];
}

function saveIncome() {
    const id = document.getElementById('incomeId').value;
    const source = document.getElementById('incomeSource').value.trim();
    const category = document.getElementById('incomeCategory').value;
    const amount = parseFloat(document.getElementById('incomeAmount').value);
    const date = document.getElementById('incomeDate').value;
    
    // Validation
    if (!source || !category || !amount || !date) {
        showToast('Please fill all fields', 'danger');
        return;
    }
    
    if (amount <= 0) {
        showToast('Amount must be greater than 0', 'danger');
        return;
    }
    
    // Check for future dates
    if (new Date(date) > new Date()) {
        if (!confirm('The date is in the future. Continue?')) {
            return;
        }
    }
    
    const income = {
        id: id || Date.now().toString(),
        source,
        category,
        amount,
        date,
        createdAt: id ? incomeData.find(i => i.id === id).createdAt : new Date().toISOString()
    };
    
    if (id) {
        // Update existing
        const index = incomeData.findIndex(i => i.id === id);
        incomeData[index] = income;
        showToast('Income updated successfully', 'success');
    } else {
        // Add new
        incomeData.push(income);
        showToast('Income added successfully', 'success');
    }
    
    saveData();
    renderAll();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('incomeModal'));
    modal.hide();
    resetIncomeForm();
}

function editIncome(id) {
    const income = incomeData.find(i => i.id === id);
    if (!income) return;
    
    document.getElementById('incomeId').value = income.id;
    document.getElementById('incomeSource').value = income.source;
    document.getElementById('incomeCategory').value = income.category;
    document.getElementById('incomeAmount').value = income.amount;
    document.getElementById('incomeDate').value = income.date;
    document.getElementById('incomeModalTitle').textContent = 'Edit Income';
    
    const modal = new bootstrap.Modal(document.getElementById('incomeModal'));
    modal.show();
}

function deleteIncome(id) {
    if (!confirm('Are you sure you want to delete this income entry?')) return;
    
    incomeData = incomeData.filter(i => i.id !== id);
    saveData();
    renderAll();
    showToast('Income deleted successfully', 'success');
}

// ===========================
// Expense Functions
// ===========================

function resetExpenseForm() {
    document.getElementById('expenseForm').reset();
    document.getElementById('expenseId').value = '';
    document.getElementById('expenseModalTitle').textContent = 'Add Expense';
    document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
}

function saveExpense() {
    const id = document.getElementById('expenseId').value;
    const source = document.getElementById('expenseSource').value.trim();
    const category = document.getElementById('expenseCategory').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const date = document.getElementById('expenseDate').value;
    
    // Validation
    if (!source || !category || !amount || !date) {
        showToast('Please fill all fields', 'danger');
        return;
    }
    
    if (amount <= 0) {
        showToast('Amount must be greater than 0', 'danger');
        return;
    }
    
    // Check for future dates
    if (new Date(date) > new Date()) {
        if (!confirm('The date is in the future. Continue?')) {
            return;
        }
    }
    
    const expense = {
        id: id || Date.now().toString(),
        source,
        category,
        amount,
        date,
        createdAt: id ? expenseData.find(e => e.id === id).createdAt : new Date().toISOString()
    };
    
    if (id) {
        // Update existing
        const index = expenseData.findIndex(e => e.id === id);
        expenseData[index] = expense;
        showToast('Expense updated successfully', 'success');
    } else {
        // Add new
        expenseData.push(expense);
        showToast('Expense added successfully', 'success');
    }
    
    saveData();
    renderAll();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('expenseModal'));
    modal.hide();
    resetExpenseForm();
}

function editExpense(id) {
    const expense = expenseData.find(e => e.id === id);
    if (!expense) return;
    
    document.getElementById('expenseId').value = expense.id;
    document.getElementById('expenseSource').value = expense.source;
    document.getElementById('expenseCategory').value = expense.category;
    document.getElementById('expenseAmount').value = expense.amount;
    document.getElementById('expenseDate').value = expense.date;
    document.getElementById('expenseModalTitle').textContent = 'Edit Expense';
    
    const modal = new bootstrap.Modal(document.getElementById('expenseModal'));
    modal.show();
}

function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense entry?')) return;
    
    expenseData = expenseData.filter(e => e.id !== id);
    saveData();
    renderAll();
    showToast('Expense deleted successfully', 'success');
}

// ===========================
// Rendering Functions
// ===========================

function renderAll() {
    renderIncome();
    renderExpenses();
    updateSummary();
    updateCharts();
}

function getFilteredData(data) {
    const monthFilter = document.getElementById('monthFilter').value;
    if (!monthFilter) return data;
    
    const [year, month] = monthFilter.split('-');
    return data.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getFullYear() == year && (itemDate.getMonth() + 1) == month;
    });
}

function renderIncome() {
    const tbody = document.getElementById('incomeTableBody');
    const filteredIncome = getFilteredData(incomeData);
    
    if (filteredIncome.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="bi bi-inbox" style="font-size: 2rem;"></i>
                    <p class="mt-2">No income entries yet. Click "Add Income" to start.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by date (newest first)
    filteredIncome.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = filteredIncome.map((income, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${income.source}</td>
            <td><span class="badge bg-success">${income.category}</span></td>
            <td><strong>${formatCurrency(income.amount)}</strong></td>
            <td>${formatDate(income.date)}</td>
            <td class="no-print">
                <button class="btn btn-sm btn-outline-primary action-btn" onclick="editIncome('${income.id}')" title="Edit">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger action-btn" onclick="deleteIncome('${income.id}')" title="Delete">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderExpenses() {
    const tbody = document.getElementById('expenseTableBody');
    const filteredExpenses = getFilteredData(expenseData);
    
    if (filteredExpenses.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="bi bi-inbox" style="font-size: 2rem;"></i>
                    <p class="mt-2">No expense entries yet. Click "Add Expense" to start.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by date (newest first)
    filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = filteredExpenses.map((expense, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${expense.source}</td>
            <td><span class="badge bg-danger">${expense.category}</span></td>
            <td><strong>${formatCurrency(expense.amount)}</strong></td>
            <td>${formatDate(expense.date)}</td>
            <td class="no-print">
                <button class="btn btn-sm btn-outline-primary action-btn" onclick="editExpense('${expense.id}')" title="Edit">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger action-btn" onclick="deleteExpense('${expense.id}')" title="Delete">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function updateSummary() {
    const filteredIncome = getFilteredData(incomeData);
    const filteredExpenses = getFilteredData(expenseData);
    
    const totalIncome = filteredIncome.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0;
    
    document.getElementById('totalIncome').textContent = formatCurrency(totalIncome);
    document.getElementById('totalExpenses').textContent = formatCurrency(totalExpenses);
    document.getElementById('netSavings').textContent = formatCurrency(netSavings);
    document.getElementById('savingsRate').textContent = savingsRate + '%';
    
    // Update color based on net savings
    const netElement = document.getElementById('netSavings');
    const rateElement = document.getElementById('savingsRate');
    
    if (netSavings >= 0) {
        netElement.classList.remove('text-danger');
        netElement.classList.add('text-success');
        rateElement.classList.remove('text-danger');
        rateElement.classList.add('text-success');
    } else {
        netElement.classList.remove('text-success');
        netElement.classList.add('text-danger');
        rateElement.classList.remove('text-success');
        rateElement.classList.add('text-danger');
    }
}

// ===========================
// Chart Functions
// ===========================

function updateCharts() {
    updateLineChart();
    updatePieChart();
    updateBarChart();
}

function updateLineChart() {
    const ctx = document.getElementById('lineChart');
    if (!ctx) return;
    
    const filteredIncome = getFilteredData(incomeData);
    const filteredExpenses = getFilteredData(expenseData);
    
    // Get all dates and sort them
    const allDates = [...new Set([
        ...filteredIncome.map(i => i.date),
        ...filteredExpenses.map(e => e.date)
    ])].sort();
    
    // Aggregate by date
    const incomeByDate = {};
    const expenseByDate = {};
    
    filteredIncome.forEach(item => {
        incomeByDate[item.date] = (incomeByDate[item.date] || 0) + item.amount;
    });
    
    filteredExpenses.forEach(item => {
        expenseByDate[item.date] = (expenseByDate[item.date] || 0) + item.amount;
    });
    
    const incomeValues = allDates.map(date => incomeByDate[date] || 0);
    const expenseValues = allDates.map(date => expenseByDate[date] || 0);
    
    if (charts.line) {
        charts.line.destroy();
    }
    
    charts.line = new Chart(ctx, {
        type: 'line',
        data: {
            labels: allDates.map(date => formatDate(date)),
            datasets: [
                {
                    label: 'Income',
                    data: incomeValues,
                    borderColor: 'rgb(25, 135, 84)',
                    backgroundColor: 'rgba(25, 135, 84, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Expenses',
                    data: expenseValues,
                    borderColor: 'rgb(220, 53, 69)',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return currencySymbols[currentCurrency] + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

function updatePieChart() {
    const ctx = document.getElementById('pieChart');
    if (!ctx) return;
    
    const filteredExpenses = getFilteredData(expenseData);
    
    // Group by category
    const categoryTotals = {};
    filteredExpenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });
    
    const categories = Object.keys(categoryTotals);
    const amounts = Object.values(categoryTotals);
    
    if (charts.pie) {
        charts.pie.destroy();
    }
    
    const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
    ];
    
    charts.pie = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: amounts,
                backgroundColor: colors.slice(0, categories.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function updateBarChart() {
    const ctx = document.getElementById('barChart');
    if (!ctx) return;
    
    // Group data by month
    const monthlyData = {};
    
    incomeData.forEach(item => {
        const month = item.date.substring(0, 7); // YYYY-MM
        if (!monthlyData[month]) {
            monthlyData[month] = { income: 0, expenses: 0 };
        }
        monthlyData[month].income += item.amount;
    });
    
    expenseData.forEach(item => {
        const month = item.date.substring(0, 7);
        if (!monthlyData[month]) {
            monthlyData[month] = { income: 0, expenses: 0 };
        }
        monthlyData[month].expenses += item.amount;
    });
    
    const months = Object.keys(monthlyData).sort();
    const incomeValues = months.map(m => monthlyData[m].income);
    const expenseValues = months.map(m => monthlyData[m].expenses);
    
    if (charts.bar) {
        charts.bar.destroy();
    }
    
    charts.bar = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months.map(m => {
                const [year, month] = m.split('-');
                const date = new Date(year, month - 1);
                return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            }),
            datasets: [
                {
                    label: 'Income',
                    data: incomeValues,
                    backgroundColor: 'rgba(25, 135, 84, 0.7)',
                    borderColor: 'rgb(25, 135, 84)',
                    borderWidth: 1
                },
                {
                    label: 'Expenses',
                    data: expenseValues,
                    backgroundColor: 'rgba(220, 53, 69, 0.7)',
                    borderColor: 'rgb(220, 53, 69)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return currencySymbols[currentCurrency] + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// ===========================
// Utility Functions
// ===========================

function formatCurrency(amount) {
    return currencySymbols[currentCurrency] + amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toast.className = `toast align-items-center border-0 bg-${type} text-white`;
    toastMessage.textContent = message;
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

function clearFilter() {
    document.getElementById('monthFilter').value = '';
    renderAll();
}

function showSection(section) {
    const dashboard = document.getElementById('dashboardSection');
    const charts = document.getElementById('chartsSection');
    
    if (section === 'dashboard') {
        dashboard.style.display = 'block';
        charts.style.display = 'none';
    } else if (section === 'charts') {
        dashboard.style.display = 'none';
        charts.style.display = 'block';
        // Update charts when showing
        updateCharts();
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    
    const themeIcon = document.getElementById('themeToggle');
    themeIcon.innerHTML = isDark ? '<i class="bi bi-sun-fill"></i>' : '<i class="bi bi-moon-fill"></i>';
    
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Update charts for theme
    updateCharts();
}

// ===========================
// Export Functions
// ===========================

function exportCSV() {
    const filteredIncome = getFilteredData(incomeData);
    const filteredExpenses = getFilteredData(expenseData);
    
    let csv = 'Type,Description,Category,Amount,Date\n';
    
    filteredIncome.forEach(item => {
        csv += `Income,"${item.source}","${item.category}",${item.amount},${item.date}\n`;
    });
    
    filteredExpenses.forEach(item => {
        csv += `Expense,"${item.source}","${item.category}",${item.amount},${item.date}\n`;
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-tracker-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showToast('CSV exported successfully', 'success');
}

// ===========================
// Sample Data (for testing)
// ===========================

function loadSampleData() {
    if (incomeData.length > 0 || expenseData.length > 0) {
        if (!confirm('This will replace existing data. Continue?')) return;
    }
    
    incomeData = [
        {
            id: '1',
            source: 'Monthly Salary',
            category: 'Salary',
            amount: 80000,
            date: '2025-01-01',
            createdAt: new Date().toISOString()
        },
        {
            id: '2',
            source: 'Freelance Project',
            category: 'Freelance',
            amount: 50000,
            date: '2025-01-15',
            createdAt: new Date().toISOString()
        }
    ];
    
    expenseData = [
        {
            id: '1',
            source: 'Apartment Rent',
            category: 'Housing',
            amount: 25000,
            date: '2025-01-05',
            createdAt: new Date().toISOString()
        },
        {
            id: '2',
            source: 'Grocery Shopping',
            category: 'Food',
            amount: 12000,
            date: '2025-01-10',
            createdAt: new Date().toISOString()
        },
        {
            id: '3',
            source: 'Electricity Bill',
            category: 'Utilities',
            amount: 3500,
            date: '2025-01-12',
            createdAt: new Date().toISOString()
        }
    ];
    
    saveData();
    renderAll();
    showToast('Sample data loaded successfully', 'success');
}

// Add to console for testing
console.log('💡 Tip: Run loadSampleData() to load sample data for testing');