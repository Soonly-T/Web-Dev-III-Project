import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './expenseCard.css'

function ExpenseCard({ expense, onDelete }) { // Receive onDelete function as prop
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleModifyClick = () => {
    navigate(`/add-expense?id=${expense.ID}`); // Navigate to add-expense page with expense ID
  };

  return (
    <div className="expense-card">
      <p>Amount: {expense.AMOUNT}</p>
      <p>Category: {expense.CATEGORY}</p>
      <p>Date: {formatDate(expense.DATE)}</p>
      <p>Notes: {expense.NOTES}</p>
      <button onClick={handleModifyClick}>Modify</button>
      <button onClick={() => onDelete(expense.ID)}>Delete</button> {/* Call onDelete with expense ID */}
    </div>
  );
}

export default ExpenseCard;