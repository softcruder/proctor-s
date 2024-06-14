import { supabase } from "@/lib/Supabase/supabaseClient";
import { PostgrestError } from '@supabase/supabase-js';

interface Params {
  user_id: string;
  test_id?: string;
}

interface User {
  id: string;
  test_id: string;
  violation_id: string;
  class: string;
  username: string;
  created_at: string;
  updated_at: string;
  last_login: string;
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
  }
  
  interface UpdateUserResult {
    data: null | Record<string, unknown>;
    error: PostgrestError | null;
    status: boolean;
  }
  
  interface GetPasskeyParams {
    cred_id?: string;
    internal_user_id?: string;
  }
  
  interface Passkey {
    cred_id: string;
    cred_public_key: Uint8Array;
    internal_user_id: string;
    webauthn_user_id: string;
    counter: number;
    backup_eligible: boolean;
    backup_status: boolean;
    transports: string;
    created_at: string;
    last_use?: string;
  }
  
  interface GetPasskeyResult {
    data: Passkey | null;
    error: PostgrestError | null;
    status: boolean;
  }

export async function getUser(params: Params): Promise<GetUserResult> {
  const { user_id } = params;
  let status = false;

  const { data, error, status: reqStatus } = await supabase
    .from('users')
    .select('*')
    .eq('id', user_id)
    .single();

  if (reqStatus === 200) {
    status = true;
  } else if (reqStatus === 400) {
    status = false;
  }

  return { data, error, status };
}

export async function updateUser(params: UserUpdateParams): Promise<UpdateUserResult> {
  const { user_id, ...updateData } = params;
  let status = false;

  const { data, error, status: reqStatus } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', user_id)
    .select('*');

  if (reqStatus === 200) {
    status = true;
  } else {
    status = false;
  }

  return { data, error, status };
}
  
  export async function getPasskey(params: GetPasskeyParams): Promise<GetPasskeyResult> {
    const { cred_id, internal_user_id } = params;
    let status = false;
  
    // Ensure either cred_id or internal_user_id is provided
    if (!cred_id && !internal_user_id) {
      return {
        data: null,
        error: { message: "Either cred_id or internal_user_id must be provided", details: '', hint: '', code: '400' },
        status: false,
      };
    }
  
    let query = supabase.from('passkeys').select('*').single();
  
    if (cred_id) {
      query = query.eq('cred_id', cred_id);
    } else if (internal_user_id) {
      query = query.eq('internal_user_id', internal_user_id);
    }
  
    const { data, error, status: reqStatus } = await query;
  
    if (reqStatus === 200) {
      status = true;
    } else {
      status = false;
    }
  
    return { data, error, status };
  }


