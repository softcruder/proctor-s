// Global type for data

type User = {
    id: string;
    student_id: string;
    class: string;
    username: string;
    created_at: string | Date;
    updated_at: string| Date;
    last_login: string | Date;
    auth_options?: startRegistrationOptions;
    challenge?: string;
    user_type?: UserType; // 'student', 'teacher' or 'institution' capitalized
    email?: string;
    [x: string]: any;
  };

  interface Passkey {
    [x: string]: any;
    cred_id: string;
    cred_public_key?: Uint8Array;
    internal_user_id?: string;
    webauthn_user_id?: string;
    counter?: number;
    backup_eligible?: boolean;
    backup_status?: boolean;
    transports?: string | undefined | AuthenticatorTransport;
    created_at: string;
    last_use?: string;
    device_type?: string;
    additional_details?: {[x: string]: any};
  }

 
  type RegistrationData = {
    student_id: string;
    username?: string;
    email?: string;
    user_type: UserType;
    class: string;
  }

  type APIResponse = {
    status: boolean;
    message?: string;
    error?: string;
    errors?: Errors | {[x: string]: any};
    data?: Data | {[x: string]: any;};
    [x: string]: any;
  }

  export { User, Passkey, UserWithCredId, HandleAuthResponse, AuthData, AuthResponse, AuthenticatorProps, Errors };