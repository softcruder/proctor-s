// components/Authenticator.tsx
import React, { ChangeEvent, useEffect, useState } from "react";
import TextInput from "@/components/shared/TextInputField/index";
import Link from "next/link";
import ToastNotification from "@/components/NotificationToast/index";
import Image from "next/image";
import Button from "@/components/shared/Button/index";
import { ACT_REGISTER, ACT_SETUP_AUTH } from "@/constants/server";
import { useRouter } from "next/navigation";
import { AuthData, Errors, AuthResponse, User, UserWithCredId } from "@/types/global";
import { checkAuth, handleAuthentication, handleRegistration } from "@/utils/auth/index";
import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { capitalizeTheFirstLetter } from "@/utils";
import { APPNAME } from "@/config";
import { useUtilsContext } from "@/context/UtilsContext";

interface AuthenticatorProps {
  onAuthSuccess: (testID: string, userID: string, user: User) => void;
}

const Authenticator: React.FC<AuthenticatorProps> = ({ onAuthSuccess }) => {
  const router = useRouter();
  const [authData, setAuthData] = useState<AuthData>({
    username: "softcruder",
    test_id: "test_paper",
  });
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authRes, setAuthRes] = useState<AuthResponse>({});
  const { notify } = useUtilsContext();

  useEffect(() => {
    const handleRegister = async ({ message = '', data }: { message: string, data: User | undefined }) => {
      try {
        if (message === ACT_SETUP_AUTH && data) {
          const queryRes = await handleRegistration(data, startRegistration);

          if (!queryRes.status) {
            setError(queryRes.message);
            setMessage('');
            setIsLoading(false);
          } else if (queryRes.status) {
            setError('');
            setMessage(queryRes.message);
            setIsLoading(false);
          }
        }
      } catch (error) {
        setIsLoading(false);
        setError("A problem occured, Please try again.");
      }
    };

    if (authRes && Object.keys(authRes).length >= 1) {
      const { message, data } = authRes;
      if (message === ACT_SETUP_AUTH && data) {
        handleRegister({ message, data });
      }
    }
  }, [authRes]);

  const handleAuth = async () => {
    if (!authData.username) {
      setErrors((prev) => ({
        ...prev,
        username: "Username is required!",
      }));
      return;
    } else if (!authData.test_id) {
      setErrors((prev) => ({
        ...prev,
        test_id: "Test ID is required!",
      }));
      return;
    }

    try {
      setIsLoading(true);
      const res = await checkAuth(authData.username, authData.test_id);
      const { message, status, data } = res;

      let notificationMsg = '';
      if (status) {
        message === ACT_REGISTER
          ? router.push("/register")
          : message === ACT_SETUP_AUTH
            ? (notificationMsg = `Setting up your biometric auth...`)
            : (notificationMsg = `Authenticating`);
      }

      setMessage(notificationMsg);
      notify(notificationMsg, { type: 'success' })

      const handleAuthnResult = await handleAuthentication({
        ...data.user,
        cred_id: data.passkey.cred_id,
      }, startAuthentication);

      if (handleAuthnResult) {
        const { status: authStatus, data: authenticatedData } = handleAuthnResult;
        setAuthRes({ message, data: data.user });

        if (authStatus) {
          onAuthSuccess(authData.test_id || '', (authenticatedData as User).id, authenticatedData as User);
          setIsLoading(false);
          setMessage("Authenticated, logging in...");
        }
      }
    } catch (error) {
      setError("Authentication failed.");
      console.log(error)
      notify("Authentication failed.", { type: 'danger' });
    } finally {
      setIsLoading(false);
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
      [name]: "",
    }));
  };

  return (
    <div className="flex items-center bg-gray-50 justify-center py-12 px-4 sm:px-6 lg:px-8">
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
          <form className="mt-5 space-y-4">
            <TextInput
              value={authData["username"]}
              name="username"
              label="Username"
              onChange={handleChange}
              placeholder="Enter your username"
              errorMessage={errors["username"]}
              required
            />
            <TextInput
              value={authData["test_id"]}
              name="test_id"
              label="Test ID"
              onChange={handleChange}
              placeholder="Enter your test ID"
              errorMessage={errors["test_id"]}
            />
            <Button
              onClick={handleAuth}
              text="Sign in"
              isLoading={isLoading}
              disabled={(!authData.username && !authData.test_id)}
              bgColor="bg-blue-700"
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default Authenticator;
