// src/components/Sidebar.tsx
import React from 'react';

interface SidebarProps {
  stocks: string[];
  selectedStock: string;
  onSelectStock: (stock: string) => void;
}

const StockSidebar: React.FC<SidebarProps> = ({ stocks, selectedStock, onSelectStock }) => {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white">
      <h2 className="text-2xl font-bold p-4">TradeZen</h2>
      <ul>
        {stocks.map((stock) => (
          <li
            key={stock}
            className={`p-4 cursor-pointer ${selectedStock === stock ? 'bg-gray-700' : ''}`}
            onClick={() => onSelectStock(stock)}
          >
            {stock}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StockSidebar;
