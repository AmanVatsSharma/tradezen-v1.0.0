"use client";
import Image from 'next/image'
import React from 'react'
import { Button } from '../ui/button'
import { PlaceholdersAndVanishInput } from '../ui/placeholders-and-vanish-input';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import MenuIcon from '@mui/icons-material/Menu';

type Props = {}

const placeholders = [
    "What's the first rule of Fight Club?",
    "Who is Tyler Durden?",
    "Where is Andrew Laeddis Hiding?",
    "Write a Javascript method to reverse a string",
    "How to assemble your own PC?",
];


const GeneralHeader = (props: Props) => {

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("submitted");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.value);
    };

    return (
        <div className='relative p-3 md:px-10 flex items-center justify-center shadow-[0_3px_10px_rgb(0,0,0,0.2)] bg-transparent md:justify-between'>


            <div className="md:hidden absolute left-1">
                <Sheet>
                    <SheetTrigger>
                        <MenuIcon />
                    </SheetTrigger>
                    <SheetContent side={'left'}>
                        <SheetHeader>
                            <SheetTitle>Are you absolutely sure?</SheetTitle>
                            <SheetDescription>
                                This action cannot be undone. This will permanently delete your account
                                and remove your data from our servers.
                            </SheetDescription>
                        </SheetHeader>
                    </SheetContent>
                </Sheet>
            </div>


            <Image src={'/logo.png'} alt='Tradezen Pro' width={500} height={200} className='h-6  w-auto' />
            <div className="inputsearch hidden md:flex ">
                <PlaceholdersAndVanishInput
                    placeholders={placeholders}
                    onChange={handleChange}
                    onSubmit={onSubmit}
                />
            </div>

        </div>
    )
}

export default GeneralHeader


