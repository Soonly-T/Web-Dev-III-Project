import '../App.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ExpenseCard from '../components/expenseCard'; // Import the ExpenseCard component
import './dashboard.css'

function DashboardScreen() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [layoutMode, setLayoutMode] = useState('list'); // Default to list view
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login-signup');
        return;
      }

      try {
        const response = await fetch('http://localhost:3060/expenses/get-expenses', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch expenses: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched Expenses:", data.expenses);
        setExpenses(data.expenses);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching expenses:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [navigate]);

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleLayoutChange = (event) => {
    setLayoutMode(event.target.value);
  };

  const handleDeleteExpense = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login-signup');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3060/expenses/remove-expense/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete expense: ${response.status}`);
      }

      console.log(`Expense with ID ${id} deleted successfully`);
      // Update the expenses state to remove the deleted expense
      setExpenses(prevExpenses => prevExpenses.filter(expense => expense.ID !== id));

      // Optionally, you could refetch expenses here if needed
    } catch (error) {
      console.error('Error deleting expense:', error.message);
      setError(`Error deleting expense: ${error.message}`); // Update error state
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.DATE);
    const expenseMonth = expenseDate.getMonth() + 1;
    const expenseYear = expenseDate.getFullYear();

    const monthMatch = !selectedMonth || parseInt(selectedMonth) === expenseMonth;
    const yearMatch = !selectedYear || parseInt(selectedYear) === expenseYear;

    return monthMatch && yearMatch;
  });

  if (loading) {
    return <div>Loading expenses...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Expense Dashboard</h1>

      {/* Filter Controls */}
      <div>
        <label htmlFor="month">Month:</label>
        <select id="month" value={selectedMonth} onChange={handleMonthChange}>
          <option value="">All Months</option>
          <option value="1">January</option>
          <option value="2">February</option>
          <option value="3">March</option>
          <option value="4">April</option>
          <option value="5">May</option>
          <option value="6">June</option>
          <option value="7">July</option>
          <option value="8">August</option>
          <option value="9">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </select>

        <label htmlFor="year">Year:</label>
        <select id="year" value={selectedYear} onChange={handleYearChange}>
          <option value="">All Years</option>
          <option value="2023">2023</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
        </select>
      </div>

      {/* Layout Selection */}
      <div>
        <label>Layout:</label>
        <input
          type="radio"
          name="layout"
          value="list"
          checked={layoutMode === 'list'}
          onChange={handleLayoutChange}
        />
        List
        <input
          type="radio"
          name="layout"
          value="grid"
          checked={layoutMode === 'grid'}
          onChange={handleLayoutChange}
        />
        Grid
      </div>

      <h2>Expenses</h2>
      {filteredExpenses.length > 0 ? (
        <div className={`expense-list-container ${layoutMode === 'grid' ? 'grid-view' : 'list-view'}`}>
          {filteredExpenses.map(expense => (
            <ExpenseCard key={expense.ID} expense={expense} onDelete={handleDeleteExpense} /> 
          ))}
        </div>
      ) : (
        <p>No expenses found for the selected month and year.</p>
      )}
    </div>
  );
}

export default DashboardScreen;