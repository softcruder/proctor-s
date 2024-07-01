import { supabase } from "@/lib/Supabase/supabaseClient";
import { PostgrestError } from "@supabase/supabase-js";
import { User, Passkey } from "@/types/global";

interface Params {
  user_id?: string;
  test_id?: string;
  username?: string;
}

interface GetUserResult {
  data: User | null;
  error: PostgrestError | null;
  status: boolean;
}

interface UserUpdateParams {
  user_id: string;
  test_id?: string;
  violation_id?: string;
  class?: string;
  username?: string;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  authn_options?: object;
  challenge?: string;
  additional_details?: object;
}

interface UpdateUserResult {
  data: any[] | null;
  error: PostgrestError | null;
  status: boolean;
}

interface GetPasskeyParams {
  cred_id?: string;
  internal_user_id?: string;
  single?: boolean;
}

interface GetPasskeyResult {
  data: Passkey | null;
  error: PostgrestError | null;
  status: boolean;
}
interface PasskeyUpdateResult {
  message: string;
  data?: Passkey | undefined | null;
  status: boolean;
  error?: PostgrestError | null | undefined | unknown;
}

export async function getUser(params: Params): Promise<GetUserResult> {
  const { user_id, username } = params;
  let status = false;

  let query = supabase.from("users").select("*");
  if (username) {
    query = query.eq("username", username);
  } else if (user_id) {
    query = query.eq("id", user_id);
  }

  const { data, error, status: reqStatus } = await query.single();

  if (reqStatus === 200) {
    status = true;
  } else if (reqStatus === 400) {
    status = false;
  }

  return { data, error, status };
}

export async function updateUser( params: UserUpdateParams ): Promise<UpdateUserResult> {
  const { user_id, ...updateData } = params;
  let status = false;

  const {
    data,
    error,
    status: reqStatus,
  } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", user_id)
    .select("*");

  if (reqStatus === 200) {
    status = true;
  } else {
    status = false;
  }

  return { data, error, status };
}

export async function getPasskey(
  params: GetPasskeyParams
): Promise<GetPasskeyResult> {
  const { cred_id, internal_user_id, single } = params;
  let status = false;

  // Ensure either cred_id or internal_user_id is provided
  if (!cred_id && !internal_user_id) {
    return {
      data: null,
      error: {
        message: "Either credential id or user id must be provided",
        details: "",
        hint: "",
        code: "400",
      },
      status: false,
    };
  }

  let query = supabase.from("passkeys").select("*");

  if (cred_id) {
    query = query.eq("cred_id", cred_id);
  } else if (internal_user_id) {
    query = query.eq("internal_user_id", internal_user_id);
  }

  const { data, error, status: reqStatus } = single ? await query.single() : await query;

  if (reqStatus === 200) {
    status = true;
  } else {
    status = false;
  }

  return { data, error, status };
}

export async function upsertPasskey (internalUserId: string, newRecordData: Passkey): Promise<PasskeyUpdateResult> {
  let status = false;
  try {
    // Check if the record exists
    const { data, error, status: reqStatus } = await supabase
      .from('passkeys')
      .select('*')
      .eq('internal_user_id', internalUserId)
      .single()

    if (error && reqStatus !== 406) {
      throw error;
    }

    if (data) {
      // If record is found, update it
      const { data: updateData, error: updateError } = await supabase
        .from('passkeys')
        .update(newRecordData)
        .eq('internal_user_id', internalUserId)
        .single();

      if (updateError) {
        throw updateError
      }

      return { data: updateData, status: true, error: updateError, message: 'Record updated!' }

    } else {
      // If no record is found, insert a new one
      const { data: insertData, error: insertError } = await supabase
        .from('passkeys')
        .insert([newRecordData])

      if (insertError) {
        throw insertError
      }

      return { data: insertData, status: true, error: insertError, message: 'Record created!' }
    }

  } catch (error) {
    return { status, error, message: 'Invalid request!' }
  }
}
