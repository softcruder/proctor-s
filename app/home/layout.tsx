// components/Layout.tsx
"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { BsGear, BsDoorOpen, BsGrid, BsFileXFill, BsFileEarmarkText } from 'react-icons/bs';
import Image from 'next/image';
import Link from 'next/link';
import { APPNAME } from '@/config';
import { useAuth } from '@/context/AuthContext';
import { useUtilsContext } from '@/context/UtilsContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const { logout } = useAuth();
  const { notify } = useUtilsContext();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
//   const router = useRouter();
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMenuOpen(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleLogout = () => {
    // console.log('logout')
    logout();
    notify("Logout successfully", { type: 'success' });
    // Handle logout logic here
    // router.push('/login');
  };

  return (
    <div className="flex h-screen">
      <aside className={`bg-gray-800 text-white w-${isMenuOpen ? '64' : '16'} transition-width duration-300`}>
        <div className="flex items-center justify-between p-4">
          <button onClick={toggleMenu} className="text-white focus:outline-none">
            ☰
          </button>
          {/* {isMenuOpen && <span className="ml-2">Proctor-<sup>s</sup></span>} */}
        </div>
        <nav className="mt-4">
          <ul>
            <li className="p-4 hover:bg-gray-700 align-center">{isMenuOpen ? <Link href="/dashboard">Dashboard</Link> : <BsGrid />}</li>
            <li className="p-4 hover:bg-gray-700 align-center">{isMenuOpen ? <Link href="/dashboard">Test</Link> : <BsFileEarmarkText />}</li>
          </ul>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          {/* <div className="text-2xl font-bold">Proctor-<sup>s</sup></div> */}
          <Image src='/images/proxpert-white-bg__image.jpeg' alt={APPNAME} height={500} width={170} className='' />
          <div className="relative">
            <button onClick={toggleProfileMenu} className="focus:outline-none">
              <img src="/icons/favicon.jpeg" alt="Profile" className="w-8 h-8 rounded-full" />
            </button>
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border-gray-300 divide-solid > * + *">
                <ul>
                  <li className="grid gap-x-1 grid-cols-4 px-2 py-3 items-center hover:bg-gray-100 font-medium cursor-pointer"><BsGear className="col-span-1 ml-3" /><span className="col-span-2">Settings</span></li>
                  <li className="grid gap-x-1 grid-cols-4 px-2 py-3 items-center hover:bg-gray-100 font-medium text-red-500 cursor-pointer" onClick={handleLogout}><BsDoorOpen className="col-span-1 ml-3" /><span className="col-span-2">Logout</span></li>
                </ul>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;