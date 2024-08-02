'use client';
import React from 'react';

interface TooltipProps {
    price: number;
    time: string;
}

const ChartTooltip: React.FC<TooltipProps> = ({ price, time }) => {
    return (
        <div className="tooltip">
            <div>Price: {price}</div>
            <div>Time: {time}</div>
        </div>
    );
};

export default ChartTooltip;
