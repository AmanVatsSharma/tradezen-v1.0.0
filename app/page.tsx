'use client'
import StockSidebar from "@/components/StockSidebar";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import Image from "next/image";
import { useState } from "react";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
} from "@tabler/icons-react";
import Link from "next/link";
import { Logo, LogoIcon } from "@/components/global/Logos";

const stocks = ['NASDAQ:AAPL', 'NASDAQ:GOOGL', 'NASDAQ:MSFT'];
const links = [
  {
    label: "Dashboard",
    href: "#",
    icon: (
      <IconBrandTabler className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: "Profile",
    href: "#",
    icon: (
      <IconUserBolt className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: "Settings",
    href: "#",
    icon: (
      <IconSettings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: "Logout",
    href: "#",
    icon: (
      <IconArrowLeft className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
];

export default function Home() {


  const [selectedStock, setSelectedStock] = useState(stocks[0]);
  const [open, setOpen] = useState(false);

  return (
    <main className="flex">

      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10 h-screen">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "TradeZen",
                href: "#",
                icon: (
                  <Image
                    src="/logo.png"
                    className="h-7 "
                    width={50}
                    height={50}
                    alt="TradeZen"
                  />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>

      <div className="text-7xl flex-col gap-7 flex items-center justify-center w-full">
        Welcome to
        <Image src="/logo.png" alt="alt" width={450} height={450} />

        <p className="flex text-base "> go to
          <span
            className="text-blue-400 ml-1 underline"
          >
            <Link href={'/charts'}>
              charts
            </Link>
          </span>
        </p>

      </div>

      <StockSidebar
        stocks={stocks}
        selectedStock={selectedStock}
        onSelectStock={setSelectedStock}
      />
    </main>
  );
}


