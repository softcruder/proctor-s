"use client"
import { ChangeEvent, useState } from 'react';
import { Oval } from 'react-loader-spinner';
import TextInput from '@/components/shared/TextInputField';
import Button from '@/components/shared/Button';
import { APPNAME } from '@/config';
import { capitalizeTheFirstLetter } from '@/utils';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useUtilsContext } from '@/context/UtilsContext';
import { startAuthentication } from '@simplewebauthn/browser';
import httpService from '@/services';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { setSessionId, login, setUser, isLoading } = useAuth() || {};
  const { notify } = useUtilsContext()
  const [authData, setAuthData] = useState({
    student_id: "",
    email: "",
    // rememberMe: false,
  });
  const [errors, setErrors] = useState({
    username: "",
    email: "",
  });
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setAuthData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };
  const handleCheckboxChange = (checked: boolean) => {
    // setIsChecked(checked);
    setAuthData((prev) => ({
      ...prev,
      rememberMe: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      login && await login({ student_id: authData.student_id, email: authData.email, credentials: { ...authData } });
    } catch (err: any) {
      notify(err.message || 'Error!', { description: 'Login failed. Please try again.', type: 'danger', timeOut: 8000 });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center col-span-6 py-2 px-4 sm:px-6 lg:px-8">
      {authenticated && (<Oval
        visible={true}
        height="80"
        width="80"
        color="rgb(30, 86, 160)"
        ariaLabel="oval-loading"
        wrapperStyle={{}}
        wrapperClass=""
      />)}
      {/* {!authenticated && <Authenticator onAuthSuccess={handleAuthSuccess} />} */}
      {!authenticated && <div className="flex items-center bg-gray-50 justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-3">
          <img src='/white-bg-proxpert-transparent-crop.png' className='w-1/3 mb-3' alt={capitalizeTheFirstLetter(APPNAME)} />
          <div className="bg-white p-6 shadow-md rounded-lg">
            <h1 className='text-2xl font-semibold'>Welcome back</h1>
            <div className="flex-row text-left">
              <span className="mb-3 text-gray-500 font-regular text-sm">Do not have an account?
                <button className="text-blue-500 text-sm mx-1.5">
                  <Link href="/register"> Sign up</Link>
                </button>
              </span>
            </div>

            {/* {error && <p className="mb-3 border-solid border-[#FE9B9B] py-1 px-3 text-[#DF0101] text-xs text-left bg-[#FEEDED] font-medium rounded">{error}</p>}
          {message && <p className="mb-3 border-solid border-[#006804] py-1 px-3 text-[#006804] text-xs text-left bg-[#00680433] font-medium rounded">{message}</p>} */}
            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <TextInput
                value={authData.student_id}
                name="student_id"
                label="Student ID"
                onChange={handleChange}
                placeholder="Enter your student ID"
                errorMessage={errors.username}
                required
              />
              <TextInput
                value={authData.email}
                name="email"
                label="Email"
                onChange={handleChange}
                placeholder="Enter your email"
                errorMessage={errors.email}
              />
              {/* <Checkbox 
              label='Remember me'
              checked={authData.rememberMe}
              onChange={handleCheckboxChange}
            /> */}
              <Button
                type='submit'
                text="Sign in"
                isLoading={isLoading}
                disabled={(!authData.student_id && !authData.email)}
              // bgColor="bg-blue-700"
              />
            </form>
          </div>
        </div>
      </div>}
    </div>
  );
}
