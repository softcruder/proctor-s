import { NextApiRequest, NextApiResponse } from "next";
import httpService from "@/services";
import { getUser, updateUser, upsertPasskey } from "@/utils/supabase";
import { User } from "@/types/global";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { body, query } = req;
  const { username = "", id = "" } = query;
  const { authOptions, user_id, challenge, authOptRes } = body;
  let errors = {};
  let user: User | null;
  let queryParam: { [key: string]: string } = {};
  const now = new Date()?.toISOString();
  if (username) {
    queryParam["username"] = username?.toString();
  } else if (id || user_id) {
    queryParam["user_id"] = id?.toString() || user_id;
  }

  // (Pseudocode) Retrieve the logged-in user
  const {
    data: userData,
    error: userError,
    status: userStatus,
  } = await getUser(queryParam);
  
  if (!userStatus) {
    errors = { ...errors, userError };
    res
      .status(500)
      .json({
        status: userStatus,
        error: userError,
        message: userError?.details,
      });
  }
  user = userData;
  const authenticationPayload = {
    auth_options: authOptions,
    id: user_id,
    challenge,
  };

  // Verify the registration data with the verify-registration endpoint
  try {
    const host = req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || 'http'; // Handle cases with proxy
    const verifyUrl = new URL('/api/auth/verify-authentication', `${protocol}://${host}`).href;
    const {
      data: verData,
      status: verStatus,
      message: verMessage,
    } = await httpService.post(verifyUrl, {...authenticationPayload, origin: `${protocol}://${host}`});
    if (!verStatus) {
      errors = { ...errors };
      res.status(500).json({ status: verStatus, message: verMessage });
    } else {
      updateUser({ user_id, last_login: now });
      const { authenticationInfo } = verData;
      const {
        newCounter,
      } = authenticationInfo;
      const newPasskey = {
        webauthn_user_id: authOptRes?.user?.id,
        counter: newCounter,
        last_use: new Date()?.toISOString(),
        additional_details: (prev) => ({
          ...prev,
          auth_options: authOptions,
        })
      };
      const {
        status: upsertStatus,
        error: upsertError,
        data: upsertData,
      } = await upsertPasskey(user_id, newPasskey);
      if (!upsertStatus) {
        errors = { ...errors, upsertError };
        res.status(500)?.json({ upsertError, message: "An error occured!" });
      }

      res
        .status(200)
        .json({
          data: { passkey: upsertData, user: userData },
          status: true,
          message: "Auth Registration Successful",
        });
    }
  } catch (error) {
    // Handle any errors that occur during the process
    if (error) {
      errors = { ...errors, error, };
    }
    res
      .status(500)
      .json({ status: false, error: errors, message: "An error occurred." });
  }
};
