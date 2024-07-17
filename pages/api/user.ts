import { NextApiRequest, NextApiResponse } from "next";
import { getUser, getPasskey } from "@/utils/supabase";
import { ACT_REGISTER, UNAUTHORIZED, REQUEST_SUCCESS, INVALID_REQUEST } from "@/constants/server";
import { getServerSession } from "next-auth";

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
  const { user_id, username } = req.query;
  const session = await getServerSession();

  let errors: { [key: string]: string } = {};

  if (!session) {
    res.status(401).json({ message: UNAUTHORIZED });
    return;
  }

  if (!user_id || !username) {
    errors.message = "User ID or Username is required";
    return res.status(400).json({ error: errors });
  }

  if (typeof user_id !== "string") {
    errors.test_id = INVALID_REQUEST;
    return res.status(400).json({ error: errors });
  }

  if (typeof username !== "string") {
    errors.username = INVALID_REQUEST;
    return res.status(400).json({ error: errors });
  }

  try {
    const { data: user, error: userError } = await getUser({
      ...(username ? { username } : { user_id })
    });

    if (userError || !user?.id) {
      errors.user = "There was an issue fetching the user!";
      return res.status(400).send({ error: errors, message: INVALID_REQUEST });
    }

    let message = REQUEST_SUCCESS;
    let statusCode = 200;

    if (userError) {
      if ((userError as any) && (userError as any).details === "The result contains 0 rows") {
        message = ACT_REGISTER;
        statusCode = 202;
      } else {
        message =
          (userError as any)?.details ||
          "An error occurred";
        statusCode = 400;
      }
    }

    const response: Response =
      userError 
        ? { data: { user }, errors: userError, message }
        : { data: user, message: REQUEST_SUCCESS };

    res.status(statusCode).json({ ...response, status: true } as ResponseData);
  } catch (error) {
    const response: Response = {
      data: null,
      message: INVALID_REQUEST,
      errors,
    };
    if (error) {
      response.errors = error as object;
    }
    res.status(500).json(response as Response);
  }
}
