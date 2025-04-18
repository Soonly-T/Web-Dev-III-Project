import '../App.css';
import React, { useState, useEffect, useMemo } from 'react'; // Import useMemo
import { useNavigate } from 'react-router-dom';
import ExpenseCard from '../components/expenseCard';
import ExpenseForm from '../components/expenseForm.jsx';
import './dashboard.css';

function DashboardScreen() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [layoutMode, setLayoutMode] = useState('list');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expenseToModify, setExpenseToModify] = useState(null);
  const navigate = useNavigate();

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

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login-signup');
        return;
      }

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

  useEffect(() => {
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

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login-signup');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete expense: ${response.status}`);
      }

      console.log(`Expense with ID ${id} deleted successfully`);
      setExpenses(prevExpenses => prevExpenses.filter(expense => expense.ID !== id));
      // Optionally, you could refetch expenses here if needed
    } catch (error) {
      console.error('Error deleting expense:', error.message);
      setError(`Error deleting expense: ${error.message}`);
    }
  };

  const handleAddClick = () => {
    setExpenseToModify(null);
    setIsFormOpen(true);
  };

  const handleModifyClick = (expense) => {
    setExpenseToModify(expense);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login-signup');
      return;
    }

    const method = expenseToModify ? 'PUT' : 'POST';
    const url = expenseToModify
      ? `http://localhost:3060/expenses/modify-expense`
      : `http://localhost:3060/expenses/add-expense`;

    const body = expenseToModify
      ? JSON.stringify({ id: expenseToModify.ID, ...formData })
      : JSON.stringify(formData);

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: body,
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login-signup');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `${expenseToModify ? 'Modify' : 'Add'} failed with status: ${response.status}`);
      }

      console.log(`${expenseToModify ? 'Modify' : 'Add'} successful`);
      setIsFormOpen(false);
      setExpenseToModify(null);
      fetchExpenses(); // Refetch expenses to update the list
    } catch (error) {
      console.error(`${expenseToModify ? 'Modify' : 'Add'} error:`, error.message);
      setError(`${expenseToModify ? 'Modify' : 'Add'} failed: ${error.message}`);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setExpenseToModify(null);
    setError('');
  };

  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.DATE);
    const expenseMonth = expenseDate.getMonth() + 1;
    const expenseYear = expenseDate.getFullYear();

    const monthMatch = !selectedMonth || parseInt(selectedMonth) === expenseMonth;
    const yearMatch = !selectedYear || parseInt(selectedYear) === expenseYear;

    return monthMatch && yearMatch;
  });

  // Calculate the total expenditure of the filtered expenses
  const totalExpenditure = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.AMOUNT), 0);
  }, [filteredExpenses]); // Recalculate whenever filteredExpenses changes

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

      {/* Display Total Expenditure */}
      <h3>Total Expenditure: ${totalExpenditure.toFixed(2)}</h3> {/* Display the total, formatted to 2 decimal places */}


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

      {/* Add Expense Button */}
      <button onClick={handleAddClick}>Add Expense</button>


      <h2>Expenses</h2>
      {filteredExpenses.length > 0 ? (
        <div className={`expense-list-container ${layoutMode === 'grid' ? 'grid-view' : 'list-view'}`}>
          {filteredExpenses.map(expense => (
            <ExpenseCard key={expense.ID} expense={expense} onDelete={handleDeleteExpense} onModify={handleModifyClick} />
          ))}
        </div>
      ) : (
        <p>No expenses found for the selected month and year.</p>
      )}

      {/* Floating Expense Form (Modal) */}
      {isFormOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>{expenseToModify ? 'Modify Expense' : 'Add Expense'}</h3>
            <ExpenseForm
              initialExpenseData={expenseToModify}
              onSubmit={handleFormSubmit}
              buttonText={expenseToModify ? 'Save Changes' : 'Add Expense'}
            />
            <button onClick={handleCloseForm}>Cancel</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default DashboardScreen;