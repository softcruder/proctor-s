import { supabase } from "@/lib/Supabase/supabaseClient";
import { PostgrestError } from "@supabase/supabase-js";
import { User, Passkey } from "@/types/global";
import { generateSessionToken } from "@/helpers";
import { Session } from "@/types/types";

interface Result {
  message: string;
  status: boolean;
  error?: PostgrestError | undefined | null | any | unknown;
  // data?: { [key: string]: string };
}
interface GetUserParams {
  user_id?: string;
  student_id?: string;
  username?: string;
  email?: string;
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
  authn_options?: {[key: string]: any};
  challenge?: string;
  additional_details?: {[key: string]: any};
  [key: string]: any;
}
interface UpdateUserResult extends Result {
  data: any[] | null;
  error: PostgrestError | null | any;
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
interface PasskeyUpdateResult extends Result {
  data?: Passkey[] | undefined | null;
  errors?: { [key: string]: string } | string | null | undefined | unknown;
}
interface InsertSessionResult extends Result {
  data?: { [key: string]: string } | any | Session;
}

export async function checkExistingUser(username: string, email: string): Promise<{ id: any; username: any; email: any; } | null> {
	try {
		const { data, error } = await supabase
			.from('users')
			.select('id, username, email')
			.or(`username.eq.${username},email.eq.${email}`)
			.single();

		if (error && error.code !== 'PGRST116') {
			throw error;
		}

		return data;
	} catch (error) {
		// Log error or handle it accordingly
		console.error('Error checking existing user:', error);
		return null;
	}
}

export async function getUser(params: GetUserParams): Promise<GetUserResult> {
  const { user_id, username, student_id, email } = params;
  let status = false;

  let query = supabase.from("users").select("*");
  if (username) {
    query = query.eq("username", username);
  } else if (user_id) {
    query = query.eq("id", user_id);
  } else if (student_id) {
    query = query.eq("student_id", student_id)
  } else if (email) {
    query = query.eq("email", email)
  }

  const { data, error, status: reqStatus } = await query.single();

  if (reqStatus === 200) {
    status = true;
  } else if (reqStatus === 400) {
    status = false;
  }

  return { data, error, status };
}

export async function updateUser(params: UserUpdateParams): Promise<UpdateUserResult> {
	const { user_id, ...updateData } = params;

	try {
		const { data, error, status: reqStatus } = await supabase
			.from('users')
			.update(updateData)
			.eq('id', user_id)
			.select('*');

		if (error) {
			throw error;
		}

		return { message: 'Update Successful!', data, error: null, status: true };
	} catch (error) {
		return { message: 'Update Failed!', data: null, error, status: false };
	}
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
        .select();

      if (insertError) {
        throw insertError
      }

      return { data: insertData, status: true, error: insertError, message: 'Record created!' }
    }

  } catch (error) {
    return { status, errors: error, message: 'Invalid request!' }
  }
}

export async function upsertSession(userId: string): Promise<InsertSessionResult> {
	let status = true;
	const oneHour = 60 * 60 * 1000;

	const expiryByType = (userType: string) => {
		switch (userType?.toLowerCase()) {
			case 'student':
				return new Date(Date.now() + 0.5 * oneHour);
			case 'teacher':
				return new Date(Date.now() + 2 * oneHour);
			case 'admin':
				return new Date(Date.now() + 5 * oneHour);
			case 'institution':
				return new Date(Date.now() + 24 * oneHour);
			default:
				return new Date(Date.now() + 1 * oneHour);
		}
	};

	try {
		const { data: userData, status: reqStatus, error: userError } = await supabase
			.from('users')
			.select('*')
			.eq('id', userId)
			.single();

		if (userError || !userData) {
      status = false;
			throw new Error(`${reqStatus}: User not found`);
		}

		const expiry = expiryByType(userData.user_type);
		const token = generateSessionToken(userId);

		const { data: sessionData, error: sessionError } = await supabase
			.from('sessions')
			.select('*')
			.eq('user_id', userId)
			.single();

		if (sessionError && sessionError.code !== 'PGRST116') {
			// 'PGRST116' is the code for "No rows returned"
      status = false
			throw sessionError;
		}

		if (sessionData) {
			// If session exists, update it
			const { data: updateData, error: updateError } = await supabase
				.from('sessions')
				.update({ token, expires: expiry })
				.eq('user_id', userId)
				.single();

			if (updateError) {
        status = false
				throw updateError;
			}

			return { data: updateData, status, error: null, message: 'Session updated!' };
		} else {
			// If no session exists, create a new one
			const { error: insertError } = await supabase
				.from('sessions')
				.insert({ user_id: userId, token, expires: expiry });

			if (insertError) {
        status = false;
				throw insertError;
			}

      const { data: insertData, error: fetchError } = await supabase.from('sessions').select('*').eq('user_id', userId);
      if (fetchError) {
        status = false;
				throw fetchError;
			}

			return { data: insertData, status, error: null, message: 'Session created!' };
		}
	} catch (error) {
    status = false;
		return { status, error, message: 'Invalid request!' };
	}
}

export async function findSessionById (id: string): Promise<InsertSessionResult> {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return { data, error, message: "Successful", status: true };
  } catch (error) {
    // console.error('Error finding session by id:', error);
    return { data: null, error, message: "Server Error", status: false };
  }
}

export async function findSessionByIdAndDelete (id: string): Promise<InsertSessionResult> {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return { data, error, message: "Successful", status: true };
  } catch (error) {
    // console.error('Error finding session by id:', error);
    return { data: null, error, message: "Server Error", status: false };
  }
}
