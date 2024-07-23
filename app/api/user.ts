import { NextRequest, NextResponse } from "next/server";
import { getUser, getPasskey } from "@/utils/supabase";
import { ACT_REGISTER, UNAUTHORIZED, REQUEST_SUCCESS, INVALID_REQUEST } from "@/constants/server";
import { getSession } from "@/lib";

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

export default async function GET(req: NextRequest) {
  const { user_id, username } = await req.json();
  const session = await getSession();

  let errors: { [key: string]: string } = {};

  if (!session) {
    return NextResponse.json({ message: UNAUTHORIZED }, { status: 401 });
  }

  if (!user_id || !username) {
    errors.message = "User ID or Username is required";
    return NextResponse.json({ error: errors }, { status: 400 });
  }

  if (typeof user_id !== "string") {
    errors.test_id = INVALID_REQUEST;
    return NextResponse.json({ error: errors }, { status: 400 });
  }

  if (typeof username !== "string") {
    errors.username = INVALID_REQUEST;
    return NextResponse.json({ error: errors }, { status: 400 });
  }

  try {
    const { data: user, error: userError } = await getUser({
      ...(username ? { username } : { user_id })
    });

    if (userError || !user?.id) {
      errors.user = "There was an issue fetching the user!";
      return NextResponse.json({ error: errors, message: INVALID_REQUEST }, { status: 400 });
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

    return NextResponse.json({ ...response, status: true } as ResponseData), { status: statusCode };
  } catch (error) {
    const response: Response = {
      data: null,
      message: INVALID_REQUEST,
      errors,
    };
    if (error) {
      response.errors = error as object;
    }
    NextResponse.json(response as Response, { status: 500 });
  }
}
