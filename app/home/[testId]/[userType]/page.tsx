"use client"
import { useEffect, useState } from 'react';
import ViolationDetector from '@/components/ViolationDetector/ViolationDetector';
import { useSearchParams, useRouter } from 'next/navigation';

export default function Test({ params }: { params: { testId: string, userType: string } }) {
  const searchParams = useSearchParams();
  const userId = searchParams?.get('prsr') || '';
  const router = useRouter();
  
  useEffect(() => {
    const { userType, testId } = params;
  if (!userId || !userType || !testId) {
    router.push('/');
  }
  }, [userId, router, params]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-2 px-4 sm:px-6 lg:px-8">
      {/* {(<h1 className="text-4xl font-extrabold text-gray-900 mb-8">Proctor-S</h1>)} */}
      (
        <ViolationDetector testID={params.testId} userID={userId} />
      )
    </div>
  );
}
