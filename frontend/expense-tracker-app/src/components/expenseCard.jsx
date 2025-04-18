import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './expenseCard.css'

function ExpenseCard({ expense, onDelete, onModify }) { // Receive onModify function as prop

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="expense-card">
      <p>Amount: {expense.AMOUNT}</p>
      <p>Category: {expense.CATEGORY}</p>
      <p>Date: {formatDate(expense.DATE)}</p>
      <p>Notes: {expense.NOTES}</p>
      <button onClick={() => onModify(expense)}>Modify</button> {/* Call onModify with the expense object */}
      <button onClick={() => onDelete(expense.ID)}>Delete</button>
    </div>
  );
}

export default ExpenseCard;