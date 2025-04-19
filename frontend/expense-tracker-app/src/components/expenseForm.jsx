import React, { useState, useEffect } from 'react';
import './expenseForm.css'

// Define the list of common categories
const COMMON_CATEGORIES = [
  'Food',
  'Transportation',
  'Housing',
  'Utilities',
  'Insurance',
  'Healthcare',
  'Entertainment',
  'Shopping',
  'Education',
  'Others', // Keep 'Others' as an option
];

function ExpenseForm({ initialExpenseData, onSubmit, buttonText = 'Submit' }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(''); // This will hold the selected category value
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false); // State to control custom input visibility
  const [customCategory, setCustomCategory] = useState(''); // State for the custom category value

  // Effect to pre-populate the form if initialExpenseData is provided (for modification)
  useEffect(() => {
    if (initialExpenseData) {
      setAmount(initialExpenseData.AMOUNT || '');
      // Check if the initial category is in the common list
      if (COMMON_CATEGORIES.includes(initialExpenseData.CATEGORY)) {
        setCategory(initialExpenseData.CATEGORY);
        setShowCustomCategoryInput(false); // Hide custom input
        setCustomCategory(''); // Clear custom input
      } else {
        // If the initial category is not in the common list, set category to 'Others'
        setCategory('Others');
        setShowCustomCategoryInput(true); // Show custom input
        setCustomCategory(initialExpenseData.CATEGORY || ''); // Set custom input value
      }

      // Format the date to 'YYYY-MM-DD' for the input type="date"
      if (initialExpenseData.DATE) {
        const expenseDate = new Date(initialExpenseData.DATE);
        // Check if date is valid before formatting
        if (!isNaN(expenseDate.getTime())) {
            const year = expenseDate.getFullYear();
            const month = String(expenseDate.getMonth() + 1).padStart(2, '0');
            const day = String(expenseDate.getDate()).padStart(2, '0');
            setDate(`${year}-${month}-${day}`);
        } else {
             setDate(''); // Set to empty string if initial date is invalid
        }
      } else {
        setDate('');
      }
      setNotes(initialExpenseData.NOTES || '');
    } else {
        // Reset form fields when initialExpenseData is null (for add operation)
        setAmount('');
        setCategory('');
        setDate('');
        setNotes('');
        setShowCustomCategoryInput(false);
        setCustomCategory('');
    }
  }, [initialExpenseData]); // Re-run effect if initialExpenseData changes (between add and modify)

  const handleCategoryChange = (e) => {
    const selectedValue = e.target.value;
    setCategory(selectedValue); // Update the category state

    // Show/hide custom input based on selection
    if (selectedValue === 'Others') {
      setShowCustomCategoryInput(true);
    } else {
      setShowCustomCategoryInput(false);
      setCustomCategory(''); // Clear custom input when 'Others' is not selected
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let categoryToSend = category;
    // If 'Others' is selected and a custom category is entered, use the custom value
    if (category === 'Others' && customCategory.trim() !== '') {
      categoryToSend = customCategory.trim();
    } else if (category === 'Others' && customCategory.trim() === '') {
        // Handle case where 'Others' is selected but no custom category is entered (optional)
        alert('Please enter a custom category or select a common one.');
        return; // Prevent submission
    }

    // --- Create the data object to send, including the ID if modifying ---
    const formData = {
      amount: amount,
      category: categoryToSend,
      date: date,
      notes: notes,
    };

    // If we are in modify mode (initialExpenseData exists), add the ID to the data
    if (initialExpenseData && initialExpenseData.ID) {
        formData.id = initialExpenseData.ID;
    }
    // --------------------------------------------------------------------


    // Pass the form data (now potentially including ID) up to the parent component
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className='cont'>
        <div className='input'>
          <label htmlFor="amount">Amount:</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder='USD'
            required
            min="0.01" // Added basic validation
            step="0.01" // Added step for decimal input
          />
        </div>
        <div className='input'>
          <label htmlFor="category">Category:</label>
          <select id="category" value={category} onChange={handleCategoryChange} required>
            <option value="">Select a Category</option> {/* Optional: Add a default empty option */}
            {COMMON_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        {showCustomCategoryInput && ( // Conditionally render the custom input field
          <div className='input'>
            <label htmlFor="customCategory">Custom Category:</label>
            <input
              type="text"
              id="customCategory"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              required={showCustomCategoryInput} // Make required only if visible
            />
          </div>
        )}
        <div className='input'>
          <label htmlFor="date">Date:</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className='input'>
          <label htmlFor="notes">Notes:</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>
      <button type="submit">{buttonText}</button>
    </form>
  );
}

export default ExpenseForm;