import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function CategoryPieChart({ data }) {
  // Process data to get category totals
  const categoryTotals = data.reduce((acc, expense) => {
    const category = expense.CATEGORY || 'Uncategorized'; // Handle cases with no category
    const amount = parseFloat(expense.AMOUNT) || 0; // Ensure amount is a number
    acc[category] = (acc[category] || 0) + amount;
    return acc;
  }, {});

  // Convert totals into an array format suitable for Recharts
  const chartData = Object.keys(categoryTotals).map(category => ({
    name: category,
    value: categoryTotals[category],
  }));

  // Define some colors for the pie chart slices
  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF',
    '#FF6666', '#66B2FF', '#FF9933', '#33CC99', '#B8B8B8'
  ];

  return (
    <div style={{ width: '100%', height: 300 }}> {/* Container for the chart */}
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%" // Center X position
            cy="50%" // Center Y position
            outerRadius={80} // Radius of the pie chart
            fill="#8884d8"
            dataKey="value"
            labelLine={false}
            // label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} // Optional label on slices
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `$${value.toFixed(2)}`} /> {/* Tooltip on hover */}
          <Legend /> {/* Displays the legend with category names and colors */}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CategoryPieChart;