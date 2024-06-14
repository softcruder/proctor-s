// components/Authenticator.tsx
import React, { ChangeEvent, useEffect, useState } from 'react';
import TextInput from '../TextInputField';
import ToastNotification from '../NotificationToast';
import Button from '../Button';

interface AuthenticatorProps {
  onAuthSuccess: (testID: string, userID: string) => void;
}

interface AuthData {
    username: string;
    test_id: string;
  }
  
  interface Errors {
    test_id?: string;
    [key: string]: string | undefined;
  }

const Authenticator: React.FC<AuthenticatorProps> = ({ onAuthSuccess }) => {
  const [authData, setAuthData] = useState<AuthData>({
    username: "softcruder",
    test_id: "test_paper",
  });
  const [userID, setUserID] = useState<string>('');
  const [testID, setTestID] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleAuth = async () => {
    if (!authData.username) {
        setErrors((prev) => ({
            ...prev,
            username: "Username is required!"
        }));
        return
    } else if (!authData.test_id) {
        setErrors((prev) => ({
            ...prev,
            test_id: "Test ID is required!"
        }));
        return
    };
    try {
        setIsLoading(true);
        const res = await fetch(`/api/auth/check-auth?test_id=${authData.test_id}&username=${authData.username}`);
          console.log(res)
        const { ok } = res;
        if (ok) {
          console.log('here')
          console.log(res);
          // const verification = await data.json();
        }
        setIsLoading(false);
      const { test_id: testID, username: userID } = authData;
      if (ok) {
        onAuthSuccess(testID, userID);
      } else {
        setError('Authentication failed.');
      }
    } catch (error) {
      if (error) {
        console.log(error)
        setErrors((prev) => ({
            ...prev,
            ...error,
          }));
      } else {
        return (
            <ToastNotification message='An error occurred during authentication.' type='danger' />
        )
      }
      setError('An error occurred during authentication.');
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setAuthData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
        ...prev,
        [name]: ""
    }))
  };

  // useEffect(() => {
  // if (authData && Object.keys(authData)?.length >= 1) {
  //   handleAuth()
  // }
  // }, [authData])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-left text-3xl font-bold text-gray-700">Proctor-S</h2>
        </div>
        <div className="bg-white p-6 shadow-sm rounded-lg">
          <div className="space-y-4">
            <TextInput 
                value={authData['username']}
                name='username'
                label='Username'
                onChange={handleChange}
                placeholder='Enter your username'
                errorMessage={errors['username']}
                required
            />
            <TextInput 
                value={authData['test_id']}
                name='test_id'
                label='Test ID'
                onChange={handleChange}
                placeholder='Enter your test ID'
                errorMessage={errors['test_id']}
                required
            />
            <Button 
                onClick={handleAuth}
                text='Authenticate'
                isLoading={isLoading}
                disabled={!authData.username && !authData.test_id}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Authenticator;