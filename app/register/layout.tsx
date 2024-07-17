"use client"
import React from 'react';
import Image from 'next/image';
import { ReactNode } from 'react';

interface RegisterLayoutProps {
    pageTitle?: string;
    children: ReactNode;
}

const RegisterLayout: React.FC<RegisterLayoutProps> = ({ children }) => {
    return (
        <section className="bg-white">
            <div className="lg:grid lg:min-h-screen md:grid-cols-8 lg:grid-cols-12">
                <aside className="relative block h-16 md:col-span-3 lg:order-first lg:col-span-4 lg:h-full xl:col-span-5">
                    <Image
                        alt=""
                        src="https://images.unsplash.com/photo-1605106702734-205df224ecce?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
                        className="absolute inset-0 h-full w-full object-cover"
                        layout='fill'
                    />
                </aside>

                <main
                    className="flex  px-8 py-8 sm:px-12 md:col-span-5 lg:col-span-8 justify-center lg:px-16 lg:py-12 xl:col-span-7"
                >
                    <h2 className="mt-1 mx-3 text-left text-2xl font-medium text-gray-800 self-start cursor-default" aria-label='logo'>
                        Proctor-<sup>s</sup>
                    </h2>
                    <div className="w-7/12 max-w-4xl self-center lg:max-w-6xl">
                        {children}
                    </div>
                </main>
            </div>
        </section>
    );
};

export default RegisterLayout;

