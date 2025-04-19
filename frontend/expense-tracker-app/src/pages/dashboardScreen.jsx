import '../App.css';
import React, { useState, useEffect, useMemo } from 'react'; // Import useMemo
import { useNavigate } from 'react-router-dom';
import ExpenseCard from '../components/expenseCard.jsx';
import ExpenseForm from '../components/expenseForm.jsx';
import CategoryPieChart from '../components/categoryPieChart.jsx'; // Import the Pie Chart component
import './dashboard.css';

function DashboardScreen() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(''); // State for category filter
  const [layoutMode, setLayoutMode] = useState('grid');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expenseToModify, setExpenseToModify] = useState(null);
  const navigate = useNavigate();

  // Function to fetch expenses from the backend
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

      // Handle expired token
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
      // Assuming expense dates are in a format compatible with new Date()
      setExpenses(data.expenses);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const [activeElement, setActiveElement] = useState('home'); // State to track which element is visible

  const handlePage = (elementId) => {
    setActiveElement(elementId);
  };
  
  // Fetch expenses when the component mounts
  useEffect(() => {
    fetchExpenses();
  }, [navigate]); // Dependency on navigate to avoid lint warning if navigate changes

  // Handlers for filter changes
  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleCategoryFilterChange = (event) => {
    setSelectedCategoryFilter(event.target.value);
  };

  // Handler for layout change
  const handleLayoutChange = (event) => {
    setLayoutMode(event.target.value);
  };

  // Handler for deleting an expense
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

      // Handle expired token during delete
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
      // Update the expenses state to remove the deleted expense
      setExpenses(prevExpenses => prevExpenses.filter(expense => expense.ID !== id));
      // Optionally, you could refetch expenses here if needed
    } catch (error) {
      console.error('Error deleting expense:', error.message);
      setError(`Error deleting expense: ${error.message}`);
    }
  };

  // Handlers for opening the form modal
  const handleAddClick = () => {
    setExpenseToModify(null); // Null indicates adding a new expense
    setIsFormOpen(true);
  };

  const handleModifyClick = (expense) => {
    setExpenseToModify(expense); // Set the expense data for modification
    setIsFormOpen(true);
  };

  // Handler for submitting the form (Add or Modify)
  const handleFormSubmit = async (formData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login-signup');
      return;
    }

    const method = expenseToModify ? 'PUT' : 'POST';
    const url = expenseToModify
      ? `http://localhost:3060/expenses/modify-expense` // Your modify endpoint
      : `http://localhost:3060/expenses/add-expense`; // Your add endpoint

    const body = expenseToModify
      ? JSON.stringify({ id: expenseToModify.ID, ...formData }) // Include ID for modify
      : JSON.stringify(formData); // Just form data for add

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: body,
      });

      // Handle expired token during form submission
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
      setIsFormOpen(false); // Close the form
      setExpenseToModify(null); // Clear expense data
      fetchExpenses(); // Refetch expenses to update the list and chart
    } catch (error) {
      console.error(`${expenseToModify ? 'Modify' : 'Add'} error:`, error.message);
      setError(`${expenseToModify ? 'Modify' : 'Add'} failed: ${error.message}`);
    }
  };

  // Handler for closing the form modal
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setExpenseToModify(null); // Clear expense data when closing
    setError(''); // Clear any form-related error message
  };

  // Filter expenses based on selected month, year, and category
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.DATE);
      const expenseMonth = expenseDate.getMonth() + 1;
      const expenseYear = expenseDate.getFullYear();

      const monthMatch = !selectedMonth || parseInt(selectedMonth) === expenseMonth;
      const yearMatch = !selectedYear || parseInt(selectedYear) === expenseYear;
      // Category filter: match if no filter is selected OR the expense category matches the selected filter
      const categoryMatch = !selectedCategoryFilter || expense.CATEGORY === selectedCategoryFilter;


      return monthMatch && yearMatch && categoryMatch;
    });
  }, [expenses, selectedMonth, selectedYear, selectedCategoryFilter]); // Recalculate when expenses or filter criteria change


  // Calculate the total expenditure of the filtered expenses
  const totalExpenditure = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.AMOUNT), 0);
  }, [filteredExpenses]); // Recalculate whenever filteredExpenses changes

  // Get unique categories for the filter dropdown from all expenses
  const uniqueCategories = useMemo(() => {
    const categories = expenses.map(expense => expense.CATEGORY || 'Uncategorized');
    return ['All Categories', ...new Set(categories)].sort(); // Add "All Categories" and sort alphabetically
  }, [expenses]); // Recalculate when the main expenses list changes


  if (loading) {
    return <div>Loading expenses...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className='grid-container'>
      {/* Floating Expense Form (Modal) */}
      {isFormOpen && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <div className="cont">
                <h3>{expenseToModify ? 'Modify Expense' : 'Add Expense'}</h3>
                <ExpenseForm
                  initialExpenseData={expenseToModify}
                  onSubmit={handleFormSubmit}
                  buttonText={expenseToModify ? 'Save Changes' : 'Add Expense'}
                />
                <button id='cancel' onClick={handleCloseForm}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      <div className='title'>
        <h1>Expense Dashboard</h1>
        <hr></hr>
      </div>
      <div className='menu'>
        <button onClick={() =>handlePage('home')}>Home</button>
        <button onClick={() =>handlePage('expense')}>All Expenses</button>
        
        {/* Add Expense Button */}
        <button onClick={handleAddClick}>Add Expense</button>

      </div>
      <div className='main'>
        <div id='home' style={{display: activeElement === 'home' ? 'block' : 'none',}}>
        <div className='content'>
          {/* Filter Controls */}
          
          <div className='expense'>
            {/* Display Total Expenditure */}
            <h3>Total Expenditure: <span style={{ color: totalExpenditure > 0 ? 'red' : 'rgb(0, 221, 44)' }}>
              ${totalExpenditure.toFixed(2)}</span>
            </h3>
            <div className='filter'>
            <label htmlFor="month">Month:
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
            </label>
            <label htmlFor="year">Year:
              <select id="year" value={selectedYear} onChange={handleYearChange}>
                <option value="">All Years</option>
                {/* You might want to generate years dynamically based on your data */}
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
            </label>
            {/* Category Filter */}
            <label htmlFor="category-filter">Category:
              <select id="category-filter" value={selectedCategoryFilter} onChange={handleCategoryFilterChange}>
                {uniqueCategories.map(category => (
                  <option key={category} value={category === 'All Categories' ? '' : category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          </div>
            {/* Pie Chart */}
            <div style={{ width: '100%', height: '300px' }}> {/* Container for the chart */}
              <CategoryPieChart data={filteredExpenses} /> {/* Pass filtered expenses to the chart */}
            </div>
          </div>

        
        </div>
          {/*Recent Expense*/}
          <div className='footer'>
            <h2>Recent Expenses</h2>
            
            {/* Layout Selection */}
            <div className="layout">
              <div className='radio'>

                <label>Layout:</label>
                <label>
                  <input
                    type="radio"
                    name="layout"
                    value="list"
                    checked={layoutMode === 'list'}
                    onChange={handleLayoutChange}
                  />
                  List
                </label>
                <label>
                  <input
                    type="radio"
                    name="layout"
                    value="grid"
                    checked={layoutMode === 'grid'}
                    onChange={handleLayoutChange}
                  />
                  Grid
                </label>
      
              </div>
              <div>
                <button id='add' onClick={handleAddClick}>+ New</button>

              </div>

            </div>
            {filteredExpenses.length > 0 ? (
              <div className={`expense-list-container ${layoutMode === 'list' ? 'list-view' : 'grid-view'}`}>
                {filteredExpenses
                  .sort((a, b) => new Date(b.DATE) - new Date(a.DATE)) // Sort by date in descending order (newest first)
                  .slice(0, 3) // Take the first 3 elements (newest) after sorting
                  .map(expense => (
                    <ExpenseCard key={expense.ID} expense={expense} onDelete={handleDeleteExpense} onModify={handleModifyClick} />
                  ))}
              </div>
            ) : (
              <p>No expenses found for the selected month, year, or category.</p>
            )}
            
          </div>
        </div>
      <div className='exp' style={{display: activeElement === 'expense' ? 'block' : 'none', padding:'10vh'}}>
        <h1>All Expenses</h1>

        <div className="layout">
          <div className='radio'>
            <label>Layout:</label>
            <label>
              <input
                type="radio"
                name="layout"
                value="list"
                checked={layoutMode === 'list'}
                onChange={handleLayoutChange}
              />
              List
            </label>
            <label>
              <input
                type="radio"
                name="layout"
                value="grid"
                checked={layoutMode === 'grid'}
                onChange={handleLayoutChange}
              />
              Grid
            </label>
  
          </div>
          <div>
            <button id='add' onClick={handleAddClick}>+ New</button>
          </div>
        </div>
        {filteredExpenses.length > 0 ? (
              <div className={`expense-list-container ${layoutMode === 'list' ? 'list-view' : 'grid-view'}`}>
                {filteredExpenses.map(expense => (
                  <ExpenseCard key={expense.ID} expense={expense} onDelete={handleDeleteExpense} onModify={handleModifyClick} />
                ))}
              </div>
            ) : (
              <p>No expenses found for the selected month, year, or category.</p>
            )}
      </div>
      </div>

    </div>
  );
}

export default DashboardScreen;