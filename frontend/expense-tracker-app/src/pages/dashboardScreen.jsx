import '../App.css';
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import ExpenseCard from '../components/expenseCard.jsx';
import ExpenseForm from '../components/expenseForm.jsx';
import CategoryPieChart from '../components/categoryPieChart.jsx';

import './dashboard.css';

function DashboardScreen() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [layoutMode, setLayoutMode] = useState('grid');
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
        let errorMessage = `Failed to fetch expenses: ${response.status}`;
        try {
             const errorData = await response.json();
             errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
            console.error("Failed to parse error response:", jsonError);
        }
        throw new Error(errorMessage);
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

  const [activeElement, setActiveElement] = useState('home');

  const handlePage = (elementId) => {
    setActiveElement(elementId);
  };

  useEffect(() => {
    fetchExpenses();
  }, [navigate]);

  const availableYears = useMemo(() => {
    const years = expenses
      .map(expense => {
        const date = new Date(expense.DATE);
        return isNaN(date.getTime()) ? null : date.getFullYear();
      })
      .filter(year => year !== null);

    const uniqueYears = [...new Set(years)].sort((a, b) => a - b);

    if (uniqueYears.length === 0) {
      return [new Date().getFullYear()];
    }

    return uniqueYears;
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.DATE);
      if (isNaN(expenseDate.getTime())) {
          console.warn("Invalid expense date found during filtering:", expense);
          return false;
      }

      const expenseMonth = expenseDate.getMonth() + 1;
      const expenseYear = expenseDate.getFullYear();

      const monthMatch = !selectedMonth || parseInt(selectedMonth) === expenseMonth;
      const yearMatch = !selectedYear || parseInt(selectedYear) === expenseYear;
      const categoryMatch = !selectedCategoryFilter || expense.CATEGORY === selectedCategoryFilter;

      return monthMatch && yearMatch && categoryMatch;
    });
  }, [expenses, selectedMonth, selectedYear, selectedCategoryFilter]);

  const totalExpenditure = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.AMOUNT), 0);
  }, [filteredExpenses]);

  const uniqueCategories = useMemo(() => {
    const categories = expenses.map(expense => String(expense.CATEGORY || 'Uncategorized'));
    const unique = new Set(categories);
    return ['All Categories', ...Array.from(unique)].sort();
  }, [expenses]);

  const handleMonthChange = (event) => { setSelectedMonth(event.target.value); };
  const handleYearChange = (event) => { setSelectedYear(event.target.value); };
  const handleCategoryFilterChange = (event) => { setSelectedCategoryFilter(event.target.value); };
  const handleLayoutChange = (event) => { setLayoutMode(event.target.value); };

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
        console.warn("Token expired or invalid (401 received), redirecting to login.");
        localStorage.removeItem('token');
        navigate('/login-signup');
        return;
      }

      if (!response.ok) {
         let errorMessage = `Failed to delete expense: ${response.status}`;
         try {
             const errorData = await response.json();
             errorMessage = errorData.message || errorMessage;
         } catch (jsonError) {
             console.error("Failed to parse error response:", jsonError);
         }
         throw new Error(errorMessage);
      }

      console.log(`Expense with ID ${id} deleted successfully`);
      setExpenses(prevExpenses => prevExpenses.filter(expense => expense.ID !== id));
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

    const body = JSON.stringify({ ...formData });

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
        console.warn("Token expired or invalid (401 received), redirecting to login.");
        localStorage.removeItem('token');
        navigate('/login-signup');
        return;
      }

      if (!response.ok) {
         let errorMessage = `${expenseToModify ? 'Modify' : 'Add'} failed with status: ${response.status}`;
          try {
             const errorData = await response.json();
             errorMessage = errorData.message || errorMessage;
         } catch (jsonError) {
             console.error("Failed to parse error response:", jsonError);
         }
         throw new Error(errorMessage);
      }

      console.log(`${expenseToModify ? 'Modify' : 'Add'} successful`);
      setIsFormOpen(false);
      setExpenseToModify(null);
      fetchExpenses();
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login-signup');
    console.log("User logged out.");
  };

  const handleUserSettingsClick = () => {
    navigate('/modify-user');
  };

  if (loading) {
    return <div className="loading-indicator">Loading expenses...</div>;
  }

  if (error && expenses.length === 0) {
      return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className='grid-container'>
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
       {error && expenses.length > 0 && (
           <div className="alert failure">{error}</div>
       )}

      <div className='title'>
        <h1>Expense Dashboard</h1>
        <hr></hr>
      </div>

      <div className='menu'>
        <button onClick={() => handlePage('home')} className={activeElement === 'home' ? 'active' : ''}>Home</button>
        <button onClick={() => handlePage('expense')} className={activeElement === 'expense' ? 'active' : ''}>All Expenses</button>

        <button onClick={handleAddClick}>Add Expense</button>

        <button onClick={handleUserSettingsClick}>User Settings</button>

        <button onClick={handleLogout} className="logout-button">Logout</button>

      </div>

      <div className='main'>
        <div id='home' style={{ display: activeElement === 'home' ? 'block' : 'none' }}>
          <div className='content'>

            <div className='expense'>
              <h3>Total Expenditure:
                 <span style={{ color: totalExpenditure > 0 ? 'red' : 'rgb(0, 221, 44)' }}>
                   ${totalExpenditure.toFixed(2)}
                 </span>
              </h3>

              <div className='filter'>
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
                  {availableYears.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>

                <label htmlFor="category-filter">Category:</label>
                <select id="category-filter" value={selectedCategoryFilter} onChange={handleCategoryFilterChange}>
                  {uniqueCategories.map(category => (
                    <option key={category} value={category === 'All Categories' ? '' : category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ width: '100%', height: '300px' }}>
                <CategoryPieChart data={filteredExpenses} key={filteredExpenses.length} />
              </div>

            </div>
          </div>

          <div className='footer'>
            <h2>Recent Expenses</h2>

            <div className="layout">
              {/* <div className='radio'>
                <label>Layout:</label>
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
              </div> */}
              <div>
                <button id='add' onClick={handleAddClick}>+ New</button>
              </div>
            </div>

            {filteredExpenses.length > 0 ? (
              <div className={`expense-list-container grid-view`}>
                {activeElement === 'home'
                  ? filteredExpenses
                      .sort((a, b) => new Date(b.DATE) - new Date(a.DATE))
                      .slice(0, 10)
                      .map(expense => (
                        <ExpenseCard
                           key={expense.ID}
                           expense={expense}
                           onDelete={handleDeleteExpense}
                           onModify={handleModifyClick}
                        />
                      ))
                  : filteredExpenses.map(expense => (
                      <ExpenseCard key={expense.ID} expense={expense} onDelete={handleDeleteExpense} onModify={handleModifyClick} />
                    ))
                }
              </div>
            ) : (
              <p>No expenses found for the selected month, year, or category.</p>
            )}

          </div>
        </div>

        <div className='exp' style={{ display: activeElement === 'expense' ? 'block' : 'none', padding: '10vh' }}>
          <h1>All Expenses</h1>

          <div className="layout">
             {/* <div className='radio'>
              <label>Layout:</label>
              <label>
                <input
                   type="radio"
                   name="layout"
                   value="grid"
                   checked={layoutMode === 'grid'}
                   onChange={handleLayoutChange}
                 />
                 Grid
               </label> */}
             {/* </div> */}
            <div>
              <button id='add' onClick={handleAddClick}>+ New</button>
            </div>
          </div>
          {filteredExpenses.length > 0 ? (
              <div className={`expense-list-container grid-view`}>
                {filteredExpenses.map(expense => (
                  <ExpenseCard
                     key={expense.ID}
                     expense={expense}
                     onDelete={handleDeleteExpense}
                     onModify={handleModifyClick}
                  />
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
