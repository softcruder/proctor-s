import React, { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <section className="bg-white">
      <div className="lg:grid lg:min-h-screen md:grid-cols-8 lg:grid-cols-12 xl:grid-cols-14">
        <div className="px-8 py-8 bg-gray-50 sm:px-12 md:col-span-2 lg:col-span-3 lg:px-16 lg:py-12 xl:col-span-3">
        </div>
        {children}
        <div className="px-8 py-8 bg-gray-50 sm:px-12 md:col-span-2 lg:col-span-3 lg:px-16 lg:py-12 xl:col-span-3">
        </div>
      </div>
    </section>
  );
}