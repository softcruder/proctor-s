"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Oval } from 'react-loader-spinner';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { sessionId, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (!sessionId && !isLoading) {
        router.push('/auth/login')
      }
    };
  }, [sessionId, isLoading, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-2 px-4 sm:px-6 lg:px-8">
      {isLoading && sessionId && (<Oval
        visible={true}
        height="80"
        width="80"
        color="#4fa94d"
        ariaLabel="oval-loading"
        wrapperStyle={{}}
        wrapperClass=""
      />)}
    </div>
  );
}
