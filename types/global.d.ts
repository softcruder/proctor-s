// Global type for user data
import { RegistrationResponseJSON, AuthenticatorTransportFuture } from '@simplewebauthn/types';
interface OptionsResponse {
  publicKey?: string;
  transports?: AuthenticatorTransportFuture[];
  clientDataJSON?: string;
  attestationObject?: string;
  authenticatorData?: string;
}
interface startRegistrationOptions {
  response?: OptionsResponse;
  id?: string;
  rawId: string;
  type?: string;
  authenticatorAttachment?: string;
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
    auth_options?: startRegistrationOptions;
    challenge?: string;
    user_type?: string; // 'student' or 'teacher'

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
    additional_details?: object;
  }

  interface AuthenticatorProps {
    onAuthSuccess: (testID: string, userID: string, user: User) => void;
  }
  interface AuthData {
    username: string;
    test_id: string;
  }
  interface Errors {
    test_id?: string;
    [key: string]: string | undefined;
  }
  interface AuthResponse {
    message?: string;
    data?: User | undefined;
  }
  interface HandleAuthResponse {
    message?: string;
    status?: boolean;
    data?: {
      user?: User | object; // user data
    } | object;
  }
  interface UserWithCredId extends User {
    cred_id: string;
  }

  export { User, Passkey, UserWithCredId, HandleAuthResponse, AuthData, AuthResponse, AuthenticatorProps, Errors };