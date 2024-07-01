// components/Authenticator.tsx
import React, { ChangeEvent, useEffect, useState } from "react";
import TextInput from "../TextInputField";
import ToastNotification from "../NotificationToast";
import Button from "../Button";
import { ACT_REGISTER, ACT_SETUP_AUTH, ACT_START_AUTH } from "@/constants/server";
import { useRouter } from "next/navigation";
import httpService from "@/services";
import { User } from "@/types/global";
import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { updateUser, upsertPasskey } from "@/utils/supabase";

interface AuthenticatorProps {
  onAuthSuccess: (testID: string, userID: string, user: User) => void;
}
interface AuthData {
  username: string;
  test_id: string;
}
interface Errors {
  test_id?: string;
  [key: string]: string | undefined;
}
interface AuthResponse {
  message?: string;
  data?: User | undefined;
}
interface UserWithCredId extends User {
  cred_id: string;
}


const Authenticator: React.FC<AuthenticatorProps> = ({ onAuthSuccess }) => {
  const router = useRouter();
  const [authData, setAuthData] = useState<AuthData>({
    username: "softcruder",
    test_id: "test_paper",
  });
  const [userID, setUserID] = useState<string>("");
  const [testID, setTestID] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authRes, setAuthRes] = useState<AuthResponse>({});

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
      httpService
        .get(
          `/api/auth/check-auth?username=${authData.username}&test_id=${authData.test_id}`
        )
        .then(async (res) => {
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
          const handleAuthn = async ({ message = '', data }: { message: string, data: UserWithCredId | undefined }) => {
            try {
              if (!data) {
                throw new Error('Data is undefined');
              }
              const authOptRes = await httpService.get(`/api/auth/generate-authentication-options?username=${data.username}`);
              const userAuthOptions = await startAuthentication(authOptRes)
              const challenge = authOptRes.challenge;
              updateUser({ user_id: data.id, additional_details: { authentication_data: userAuthOptions}, updated_at: new Date()?.toISOString(), challenge: authOptRes.challenge })
              const payload = { authOptions: userAuthOptions, challenge, user_id: data?.id, authOptRes }
              const queryRes = await httpService.post(`/api/auth/start-authentication`, payload);
              return { ...queryRes as { message: string, data: object, status: boolean } };
            } catch (error) {
              setError("A problem occured, Please try again.")
            }
          }
          const { status: authStatus, data: authenticatedData, message: authMessage } = await handleAuthn({ message, data: { ...data?.user, cred_id: data?.passkey?.cred_id }})
          setAuthRes({ message, data: data?.user });
          if(authStatus) {
            onAuthSuccess(authData?.test_id || '', authenticatedData?.user?.id, authenticatedData?.user);
            setIsLoading(false);
            setMessage("Authenticated, logging in...");
          }
        })
        .catch((error) => {
          <ToastNotification
            message={error || "An error occurred during authentication."}
            type="danger"
          />;
          setError("Authentication failed.");
        }).finally(() => {
          setIsLoading(false);
        });
      // const { test_id: testID, username: userID } = authData;
      // if (!res?.ok) {
      //   onAuthSuccess(testID, userID);
      //   <ToastNotification message='Login successful!' type='success' />
      // } else {
      //   <ToastNotification message='An error occurred during authentication.' type='danger' />
      //   setError('Authentication failed.');
      // }
    } catch (error) {
      if (error) {
        console.log(error);
        setErrors((prev) => ({
          ...prev,
          ...error,
        }));
      } else {
        return (
          <ToastNotification
            message="An error occurred during authentication."
            type="danger"
          />
        );
      }
      isLoading && setIsLoading(false);
      setError("An error occurred during authentication.");
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

  useEffect(() => {
    const handleRegister = async ({ message = '', data }: { message: string, data: User | undefined }) => {
      try {
        if (message === ACT_SETUP_AUTH) {
          const regOptRes = await httpService.get(`/api/auth/generate-registration-options?username=${data?.username}`);
          // console.log(regOptRes);
          const regisOptions = await startRegistration(regOptRes)
          const challenge = regOptRes.challenge;
          updateUser({ user_id: data?.id, authn_options: regisOptions, updated_at: new Date()?.toISOString(), challenge: regOptRes.challenge })
          // console.log(regisOptions); we will start new flow from here to remove all these from here
          const payload = { regOptions: regisOptions, challenge, user_id: data?.id, regOptRes }
          const queryRes = await httpService.post(`/api/auth/start-registration`, payload);
          if (!queryRes.status) {
            setError(queryRes.message)
            setMessage('')
            setIsLoading(false)
          } else if (queryRes?.status) {
            setError('')
            setMessage(queryRes.message)
            setIsLoading(false)
          }
        }
      } catch (error) {
        setIsLoading(false);
        setError("A problem occured, Please try again.")
      }

    }
    if (authRes && Object.keys(authRes)?.length >= 1) {
      const { message, data } = authRes;
      message === ACT_SETUP_AUTH && handleRegister({ message: message || '', data: data }).then(() => {

        // const { test_id, username } = authData;
        // onAuthSuccess(test_id, username);
      });
      // message === ACT_START_AUTH && handleAuth({ message, data }).then(() => {

      // })
    }
  }, [authRes])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-4 text-left text-2xl font-medium text-gray-600">
            Proctor-<sup>s</sup>
          </h2>
        </div>
        <div className="bg-white p-6 shadow-sm rounded-lg">
          {error && <p className="mb-3 border-solid border-[#FE9B9B] py-1 px-3 text-[#DF0101] text-xs text-left bg-[#FEEDED] font-medium rounded">{error}</p>}
          {message && <p className="mb-3 border-solid border-[#006804] py-1 px-3 text-[#006804] text-xs text-left bg-[#00680433] font-medium rounded">{message}</p>}
          <div className="space-y-4">
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
              text="Authenticate"
              isLoading={isLoading}
              disabled={(!authData.username && !authData.test_id)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Authenticator;
