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
    <div style={{ width: '100%', height: 300, display: 'flex', flexDirection: 'row' }}>
      <div style={{ flex: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart style={{ position: 'relative', left: '-50px' }}> {/* Make PieChart a positioning context */}
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => `$${value.toFixed(2)}`} 
              contentStyle={{
                backgroundColor: 'rgba(227, 227, 227, 0.9)',
                border: '1px solid #ccc',
                borderRadius: '5px',
                padding: '10px',
              }}
              itemStyle={{
                color: 'rgba(2, 0, 43, 0.7)',
                fontWeight: 'bold',
              }}
            />
            <Legend
              layout="vertical"
              align="middle"
              wrapperStyle={{
                lineHeight: '24px',
                position: 'absolute',
                right: 0,
                top: '50%',
                transform: 'translateY(-50%)',
              }}
              
              
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* You might want to adjust the flex of the outer div or add padding */}
      {/* to accommodate the legend's width */}
    </div>
  );
}

export default CategoryPieChart;