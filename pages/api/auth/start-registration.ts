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
  const { regOptions, user_id, regOptRes } = body;
  let errors = {};
  let user: User | null;
  let queryParam: { [key: string]: string } = {};
  const now = new Date()?.toISOString();
  if (username) {
    queryParam["username"] = username?.toString();
  } else if (id) {
    queryParam["user_id"] = id?.toString();
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
  user = userData as User;
  const { challenge } = user;
  const registrationPayload = {
    regOptions,
    user_id,
    challenge,
  };

  // Verify the registration data with the verify-registration endpoint
  try {
    const {
      data: verData,
      status: verStatus,
      message: verMessage,
    } = await httpService.post(
      `/api/auth/verify-registration`,
      registrationPayload
    );
    if (!verStatus) {
      errors = { ...errors };
      res.status(500).json({ status: verStatus, message: verMessage });
    } else {
      updateUser({ user_id, last_login: now });
      const { registrationInfo } = verData;
      const {
        credentialID,
        credentialPublicKey,
        counter,
        credentialDeviceType,
        credentialBackedUp,
      } = registrationInfo;
      const newPasskey = {
        cred_id: credentialID,
        cred_public_key: credentialPublicKey,
        webauthn_user_id: regOptRes?.user?.id,
        counter,
        backup_eligible: credentialBackedUp,
        backup_status: credentialBackedUp,
        transports: regOptions?.response?.transports.join(", ") || "", // Convert the array of transports to a string
        device_type: credentialDeviceType,
        additional_details: {
          options: regOptions,
          challenge,
        },
        last_use: new Date()?.toISOString(),
        created_at: new Date()?.toISOString(),
        internal_user_id: user?.id,
      };
      const {
        status: upsertStatus,
        error: upsertError,
        data: upsertData,
      } = await upsertPasskey(user?.id, newPasskey);
      if (!upsertStatus) {
        errors = { ...errors, upsertError };
        res.status(500)?.json({ upsertError, message: "An error occured!" });
      }

      res
        .status(200)
        .json({
          data: { passkey: upsertData, user: userData },
          message: "Auth Registration Successful",
        });
    }
  } catch (error) {
    // Handle any errors that occur during the process
    if (error) {
      errors = { ...error };
    }
    res
      .status(500)
      .json({ status: false, error: errors, message: "An error occurred." });
  }
};
