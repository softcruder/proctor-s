"use client"
import React from 'react';
import Image from 'next/image';
import { ReactNode } from 'react';

interface AuthLayoutProps {
    pageTitle?: string;
    children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <section className="bg-white">
      <div className="lg:grid lg:min-h-screen md:grid-cols-8 lg:grid-cols-12">
        {/* <aside className="relative block h-16 md:col-span-4 lg:order-first lg:col-span-4 lg:h-full xl:col-span-5">
          <Image
            alt=""
            src="https://images.unsplash.com/photo-1605106702734-205df224ecce?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
            className="absolute inset-0 h-full w-full object-cover"
            layout='fill'
          />
        </aside>

        <main
          className="flex items-center justify-center px-8 py-8 sm:px-12 md:col-span-4 lg:col-span-8 lg:px-16 lg:py-12 xl:col-span-7"
        >
          <div className="w-9/12 max-w-4xl lg:max-w-6xl">
            {children}
          </div>
        </main> */}
        <div className="px-8 py-8 bg-gray-50 sm:px-12 md:col-span-2 lg:col-span-3 lg:px-16 lg:py-12 xl:col-span-4">
        </div>
        {children}
        <div className="px-8 py-8 bg-gray-50 sm:px-12 md:col-span-2 lg:col-span-3 lg:px-16 lg:py-12 xl:col-span-4">
        </div>
      </div>
    </section>
  );
};

export default AuthLayout;

