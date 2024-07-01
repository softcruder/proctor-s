"use client"
import { useEffect, useState } from 'react';
import Authenticator from '@/components/Authenticator/Authenticator';
import { useRouter } from 'next/navigation';
import { User } from '@/types/global';
import { Oval } from 'react-loader-spinner';

export default function Home() {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const router = useRouter();
  const [testID, setTestID] = useState<string>('');
  const [userID, setUserID] = useState<string>('');
  const [user, setUser] = useState<User>({} as User);

  const handleAuthSuccess = (testID: string, userID: string, user: User) => {
    setTestID(testID);
    setUserID(userID);
    setUser(user);
    setAuthenticated(true);
  };

  useEffect(() => {
    if (authenticated) {
      // router.push(`/test/${userID}`);
      const { user_type } = user;
      router.push(`/home/${testID}/${user_type}/?prsr=${userID}`);
    };
  }, [authenticated, router, testID, user, userID]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-2 px-4 sm:px-6 lg:px-8">
      {authenticated && (<Oval
        visible={true}
        height="80"
        width="80"
        color="#4fa94d"
        ariaLabel="oval-loading"
        wrapperStyle={{}}
        wrapperClass=""
      />)}
      {!authenticated && <Authenticator onAuthSuccess={handleAuthSuccess} />}
    </div>
  );
}
