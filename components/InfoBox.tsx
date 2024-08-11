import React from 'react'

type Props = {
    selectedStock: string,
}

const InfoBox = (selectedStock: Props) => {
  return (
    <div className='w-[300px] h-screen hidden lg:flex'>
        <div className='w-[240px]'>
            left box
        </div>
        <div className='h-full bg-gray-800 w-[60px] float-right border-3'/>
        </div>
  )
}

export default InfoBox