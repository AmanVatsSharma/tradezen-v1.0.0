'use client'
import React, { useState } from 'react';
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import Image from 'next/image';

interface SidebarProps {
  stocks: string[];
  selectedStock: string;
  onSelectStock: (stock: string) => void;
}


const StockSidebar: React.FC<SidebarProps> = ({ stocks, selectedStock, onSelectStock }) => {
  const [open, setOpen] = useState(true);

  return (<>
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="absolute right-0 z-10 h-screen w-64 h-screen bg-[#26bef2] text-white">

        <div className="">
          <h2 className="text-2xl font-bold p-4">TradeZen</h2>
          <ul>
            {stocks.map((stock) => (
              <li
                key={stock}
                className={`rounded-lg mx-2 py-1 pl-2 cursor-pointer ${selectedStock === stock ? 'bg-[#2f2f3b]' : ''}`}
                onClick={() => onSelectStock(stock)}
              >
                {stock}
              </li>
            ))}
          </ul>
        </div>

      </SidebarBody>
    </Sidebar>

    {/* <div className="">
      <h2 className="text-2xl font-bold p-4">TradeZen</h2>
      <ul>
        {stocks.map((stock) => (
          <li
            key={stock}
            className={`rounded-lg mx-2 py-1 pl-2 cursor-pointer ${selectedStock === stock ? 'bg-[#2f2f3b]' : ''}`}
            onClick={() => onSelectStock(stock)}
          >
            {stock}
          </li>
        ))}
      </ul>
    </div> */}


  </>

  );
};

export default StockSidebar;
