// "use client"
import React from 'react';
import Image from 'next/image';
import { ReactNode } from 'react';
import { APPNAME } from '@/config';

interface RegisterLayoutProps {
    children: ReactNode;
}

export default function RegisterLayout({ children }: RegisterLayoutProps ) {
    return (
        <section className="bg-white">
            <div className="lg:grid absolute lg:min-h-screen md:grid-cols-8 lg:grid-cols-12">
                <aside className="relative block h-16 md:col-span-3 lg:order-first lg:col-span-4 lg:h-full xl:col-span-5">
                    <Image
                        alt=""
                        src="/images/splash.png"
                        className="absolute inset-0 h-full w-full object-cover"
                        layout='fill'
                        priority
                    />
                </aside>

                <main
                    className="flex relative px-8 py-8 sm:px-12 md:col-span-5 lg:col-span-8 justify-center lg:px-16 lg:py-12 xl:col-span-7"
                >
                    {/* <h2 className="absolute mt-1 px-8 left-5 mx-3 text-left text-2xl font-semibold text-gray-800 self-start cursor-default" aria-label='logo'>
                    ProctorXpert
                    </h2> */}
                    <div className="w-7/12 max-w-4xl self-center lg:max-w-6xl">
                        <Image src='/images/proxpert-white-bg__image.jpeg' alt={APPNAME} height={200} width={1320} className='w-1/3 mb-3' />
                        {children}
                    </div>
                </main>
            </div>
        </section>
    );
};

