import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function TransactionPieAndTable({ categoryData, transactions, unusualCharges = [] }) {
 
  const pieData = Object.entries(categoryData || {})
    .map(([key, value]) => ({ name: key, value: Number(value) || 0 }))
    .filter((d) => d.value > 0);

  // Pie chart colors
  const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#3b82f6"];

  return (
    <div className="mt-6 space-y-6">
      
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Spending by Category</h2>
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ReTooltip formatter={(value) => `₹${value}`} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center">No spending data available.</p>
        )}
      </div>

      
      <div className="bg-white p-6 rounded-2xl shadow-md overflow-x-auto">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Transactions</h2>
        {transactions && transactions.length > 0 ? (
          <table className="min-w-full table-auto border-collapse border border-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, idx) => {
                const isUnusual = unusualCharges.includes(tx.description);
                return (
                  <tr
                    key={idx}
                    className={`${idx % 2 === 0 ? "bg-gray-50" : ""} ${
                      isUnusual ? "bg-red-400 font-semibold" : ""
                    }`}
                  >
                    <td className="border border-gray-300 px-4 py-2">{tx.date}</td>
                    <td className="border border-gray-300 px-4 py-2">{tx.description}</td>
                    <td className="border border-gray-300 px-4 py-2">{tx.type}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">{tx.amount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center">No transactions available.</p>
        )}
      </div>
    </div>
  );
}
