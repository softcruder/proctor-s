// utils/authUtils.ts
import httpService from "@/services";
import { updateUser } from "@/utils/supabase";
import { User, UserWithCredId, HandleAuthResponse, AuthResponse } from "@/types/global";

export const checkAuth = async (username: string, test_id: string) => {
  return httpService.get(`/api/auth/check-auth?username=${username}&test_id=${test_id}`);
};

export const handleAuthentication = async (data: UserWithCredId, startAuthentication: ((arg0: any) => any) | undefined) => {
  const authOptRes = await httpService.get(`/api/auth/generate-authentication-options?username=${data.username}`);
  const userAuthOptions = await startAuthentication!(authOptRes);
  const challenge = authOptRes.challenge;

  await updateUser({
    user_id: data.id,
    additional_details: { authentication_data: userAuthOptions },
    updated_at: new Date().toISOString(),
    challenge,
  });

  const payload = { authOptions: userAuthOptions, challenge, user_id: data.id, authOptRes };
  return httpService.post(`/api/auth/start-authentication`, payload) as Promise<HandleAuthResponse>;
};

export const handleRegistration = async (data: User, startRegistration: ((arg0: any) => any) | undefined) => {
  const regOptRes = await httpService.get(`/api/auth/generate-registration-options?username=${data.username}`);
  const regisOptions = await startRegistration!(regOptRes);
  const challenge = regOptRes.challenge;

  await updateUser({
    user_id: data.id,
    authn_options: regisOptions,
    updated_at: new Date().toISOString(),
    challenge,
  });

  const payload = { regOptions: regisOptions, challenge, user_id: data.id, regOptRes };
  return httpService.post(`/api/auth/start-registration`, payload);
};
