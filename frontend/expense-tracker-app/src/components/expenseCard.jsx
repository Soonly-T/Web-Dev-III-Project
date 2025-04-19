import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './expenseCard.css' // Ensure correct path

function ExpenseCard({ expense, onDelete, onModify }) { // Receive onModify function as prop

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid Date"; // Or handle as appropriate
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="expense-card">
      <p>Amount: ${expense.AMOUNT}</p>
      <p>Category: {expense.CATEGORY}</p>
      <p>Date: {formatDate(expense.DATE)}</p>
      {/* --- CONDITIONAL RENDERING FOR NOTES --- */}
      {/* Only render the paragraph if expense.NOTES is not null, undefined, or an empty string */}
      {expense.NOTES && expense.NOTES.trim() !== '' && (
         <p>Notes: {expense.NOTES}</p>
      )}
      {/* ---------------------------------------- */}
      <button onClick={() => onModify(expense)}>Modify</button> {/* Call onModify with the expense object */}
      <button id='del' onClick={() => onDelete(expense.ID)}>Delete</button>
    </div>
  );
}


export default ExpenseCard;