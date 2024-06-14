import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/Supabase/supabaseClient';
import { getUser, getPasskey } from '@/utils/supabase';

interface Response {
    data: object | null;
    errors?: object | null;
    message: string;
}

type ResponseData = {
    message: string,
    data?: object | null,
    status?: boolean | null,
    error?: object | string | null,
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { test_id, username } = req.query;

  let errors: { [key: string]: string } = {};

  if (!test_id || !username) {
    if (!test_id) errors.test_id = "Test ID is required";
    if (!username) errors.username = "Username is required";
    return res.status(400).send({ error: errors });
  }

  if (typeof test_id !== 'string') {
    errors.test_id = "Invalid Test ID";
    return res.status(400).send({ error: errors });
  }

  if (typeof username !== 'string') {
    errors.username = "Invalid Username";
    return res.status(400).send({ error: errors });
  }

  try {
    const { data: userID, error: confirmError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (confirmError || !userID) {
      errors.user = "User not found";
      return res.status(400).send({ error: errors });
    }

    const { data: user, error: userError } = await getUser({ user_id: userID.id });
    const { data: passkey, error: passkeyError } = await getPasskey({ internal_user_id: userID.id });

    let message = "Request Successful";
    let statusCode = 200;

    if (userError || passkeyError) {
      if (userError && userError.details === 'The result contains 0 rows') {
        message = 'ACT_NEED_INVITE';
        statusCode = 202;
      } else if (passkeyError && passkeyError.details === 'The result contains 0 rows') {
        message = 'ACT_REGISTER';
        statusCode = 200;
      } else {
        message = userError?.details || passkeyError?.details || "An error occurred";
        statusCode = 400;
      }
    }

    const response: Response = userError || passkeyError
      ? { data: { user }, errors: (passkeyError || userError), message }
      : { data: { user, passkey }, message };

    res.status(statusCode).send(response);
    console.log(res.send)
  } catch (error) {
    const response: Response = { data: null, message: "Invalid Request", errors };
    if (error) { response.errors = error as object; }
    res.status(500).send(response);
    console.log(res.json)
  }
}