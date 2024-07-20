import {
  RegistrationResponseJSON,
  AuthenticatorTransportFuture,
} from "@simplewebauthn/types";

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
interface AuthenticatorProps {
  onAuthSuccess: (email: string, userID: string, user: User) => void;
}
interface AuthData {
  student_id: string;
  username?: string;
  email?: string;
}
interface AuthResponse {
  message?: string;
  data?: User | undefined;
}
interface HandleAuthResponse {
  message?: string;
  status?: boolean;
  data?:
    | {
        user?: User | { [x: string]: any }; // user data
      }
    | { [x: string]: any };
}
interface UserWithCredId extends User {
  cred_id: string;
}

export { OptionsResponse, startRegistrationOptions, AuthenticatorProps, AuthData, AuthResponse, HandleAuthResponse, UserWithCredId };