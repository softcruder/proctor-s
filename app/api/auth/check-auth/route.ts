import { NextRequest, NextResponse } from "next/server";
import { getUser, getPasskey } from "@/utils/supabase";
import {
  ACT_REGISTER,
  ACT_SETUP_AUTH,
  ACT_START_AUTH,
} from "@/constants/server";

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

export default async function POST(
  req: NextRequest
) {
  const { test_id, username } = await req.json();

  let errors: { [key: string]: string } = {};

  if (!test_id || !username) {
    if (!test_id) errors.test_id = "Test ID is required";
    if (!username) errors.username = "Username is required";
    return NextResponse.json({ error: errors }, { status: 400 });
  }

  if (typeof test_id !== "string") {
    errors.test_id = "Invalid Test ID";
    return NextResponse.json({ error: errors }, { status: 400 });
  }

  if (typeof username !== "string") {
    errors.username = "Invalid Username";
    return NextResponse.json({ error: errors }, { status: 400 });
  }

  try {
    const { data: user, error: userError } = await getUser({
      username,
    });

    if (userError || !user?.id) {
      errors.user = "There was an issue authenticating the user!";
      return NextResponse.json({ error: errors, message: ACT_REGISTER }, { status: 400 });
    }

    const { data: passkey, error: passkeyError } = await getPasskey({
      internal_user_id: user?.id,
      single: true,
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
        : {
            data: { user, passkey: { cred_id: passkey?.cred_id } },
            message: ACT_START_AUTH,
          };

    NextResponse.json({ ...response, status: true } as ResponseData, { status: statusCode });
  } catch (error) {
    const response: Response = {
      data: null,
      message: "Invalid Request",
      errors,
    };
    if (error) {
      response.errors = error as object;
    }
    NextResponse.json(response as Response, { status: 500 });
  }
}
