// components/Authenticator.tsx
import React, { useState } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';
import { supabase } from '../../lib/Supabase/supabaseClient';

interface AuthenticatorProps {
  onAuthSuccess: (testID: string, userID: string) => void;
}

const Authenticator: React.FC<AuthenticatorProps> = ({ onAuthSuccess }) => {
  const [userID, setUserID] = useState<string>('');
  const [testID, setTestID] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleAuth = async () => {
    try {
      const optionsResponse = await fetch(`/api/auth/generate-authentication-options?userID=${userID}`);
      const options = await optionsResponse.json();
      
      const authResponse = await startAuthentication(options);
      
      const verifyResponse = await fetch('/api/auth/verify-authentication', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential: authResponse, userID }),
      });
      
      const verification = await verifyResponse.json();

      if (verification.verified) {
        onAuthSuccess(testID, userID);
      } else {
        setError('Authentication failed.');
      }
    } catch (error) {
      console.error(error);
      setError('An error occurred during authentication.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Test Proctoring App</h2>
        </div>
        <div className="bg-white p-6 shadow-sm rounded-lg">
          <div className="space-y-4">
            <input
              type="text"
              className="border border-gray-300 rounded-md p-3 w-full"
              placeholder="User ID"
              value={userID}
              onChange={(e) => setUserID(e.target.value)}
            />
            <input
              type="text"
              className="border border-gray-300 rounded-md p-3 w-full"
              placeholder="Test ID"
              value={testID}
              onChange={(e) => setTestID(e.target.value)}
            />
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-md w-full"
              onClick={handleAuth}
            >
              Authenticate
            </button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Authenticator;