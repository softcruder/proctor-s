import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/Supabase/supabaseClient";
import { getUser, getPasskey } from "@/utils/supabase";
import { ACT_REGISTER, ACT_SETUP_AUTH, ACT_START_AUTH } from "@/constants/server";

interface Response {
  data: object | null;
  errors?: object | null;
  message: string;
}

type ResponseData = {
  message: string;
  data?: object | null;
  status?: boolean | null;
  error?: object | string | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { test_id, username } = req.query;

  let errors: { [key: string]: string } = {};

  if (!test_id || !username) {
    if (!test_id) errors.test_id = "Test ID is required";
    if (!username) errors.username = "Username is required";
    return res.status(400).send({ error: errors });
  }

  if (typeof test_id !== "string") {
    errors.test_id = "Invalid Test ID";
    return res.status(400).json({ error: errors });
  }

  if (typeof username !== "string") {
    errors.username = "Invalid Username";
    return res.status(400).json({ error: errors });
  }

  try {
    const { data: user, error: userError } = await getUser({
      username,
    });

    if (userError || !user?.id) {
      errors.user = "There was an issue authenticating the user!";
      return res.status(400).send({ error: errors, message: ACT_REGISTER });
    }

    const { data: passkey, error: passkeyError } = await getPasskey({
      internal_user_id: user?.id,
    });

    let message = "Request Successful";
    let statusCode = 200;

    if (userError || passkeyError) {
      if (
        (userError as any) &&
        (userError as any).details === "The result contains 0 rows"
      ) {
        message = ACT_REGISTER;
        statusCode = 202;
      } else if (
        (passkeyError as any) &&
        (passkeyError as any).details === "The result contains 0 rows"
      ) {
        message = ACT_SETUP_AUTH;
        statusCode = 200;
      } else {
        message =
          (userError as any)?.details ||
          (passkeyError as any)?.details ||
          "An error occurred";
        statusCode = 400;
      }
    }

    const response: Response =
      userError || passkeyError
        ? { data: { user }, errors: passkeyError || userError, message }
        : { data: { user, passkey }, message: ACT_START_AUTH };

    res.status(statusCode).json({ ...response, status: true } as ResponseData);
  } catch (error) {
    const response: Response = {
      data: null,
      message: "Invalid Request",
      errors,
    };
    if (error) {
      response.errors = error as object;
    }
    res.status(500).json(response as Response);
  }
}
