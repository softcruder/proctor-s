// pages/index.tsx
"use client"
import { useState } from 'react';
import Authenticator from '@/components/Authenticator/Authenticator';
import ViolationDetector from '@/components/ViolationDetector/ViolationDetector';

export default function Home() {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [testID, setTestID] = useState<string>('');
  const [userID, setUserID] = useState<string>('');

  const handleAuthSuccess = (testID: string, userID: string) => {
    setTestID(testID);
    setUserID(userID);
    setAuthenticated(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-2 px-4 sm:px-6 lg:px-8">
      {authenticated && (<h1 className="text-4xl font-extrabold text-gray-900 mb-8">Proctor-S</h1>)}
      {authenticated ? (
        <ViolationDetector testID={testID} userID={userID} />
      ) : (
        <Authenticator onAuthSuccess={handleAuthSuccess} />
      )}
    </div>
  );
}
