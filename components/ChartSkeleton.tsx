import Image from 'next/image';
import React from 'react';

export const ChartSkeleton: React.FC = () => {
    return (
        <div className="flex items-center justify-center w-full h-full absolute top-1/2">
            <div className="flex flex-col items-center">
                <Image src="/logo.png" width={180} height={81} alt="Loading..." className="mb-4" />
                <div className="animate-pulse w-full">
                    <div className="bg-gray-200 h-64 rounded" />
                </div>
            </div>
        </div>
    );
};
