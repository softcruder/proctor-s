// components/Layout.tsx
"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
//   const router = useRouter();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleLogout = () => {
    console.log('logout')
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
            <li className="p-4 hover:bg-gray-700">Menu Item 1</li>
            <li className="p-4 hover:bg-gray-700">Menu Item 2</li>
            <li className="p-4 hover:bg-gray-700">Menu Item 3</li>
          </ul>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          {/* <div className="text-2xl font-bold">Proctor-<sup>s</sup></div> */}
          <Image src='/proxpert-white-bg__image.jpeg' alt={APPNAME} height={500} width={170} className='' />
          <div className="relative">
            <button onClick={toggleProfileMenu} className="focus:outline-none">
              <img src="/profile-icon.png" alt="Profile" className="w-8 h-8 rounded-full" />
            </button>
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg">
                <ul>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Settings</li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={handleLogout}>Logout</li>
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