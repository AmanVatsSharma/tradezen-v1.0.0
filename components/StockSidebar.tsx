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
  const [input, setInput] = useState<string>('')
  const [list, setList] = useState<string[]>(stocks)

  const add = () => {
    const v = input.trim().toUpperCase()
    if (!v) return
    if (!list.includes(v)) setList([v, ...list])
    setInput('')
  }

  return (<>
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="z-10 h-screen w-64 bg-[#26bef2] text-white">

        <div className="">
          <h2 className="text-2xl font-bold p-4">TradeZen</h2>
          <div className='px-3 pb-2'>
            <div className='flex gap-2'>
              <input value={input} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setInput(e.target.value)} placeholder='Add symbol' className='flex-1 rounded-md border px-2 py-1 text-sm bg-background text-black'/>
              <button onClick={add} className='rounded-md border px-2 text-sm bg-white/20'>Add</button>
            </div>
          </div>
          <ul>
            {list.map((stock) => (
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
