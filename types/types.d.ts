// /types/db.ts

export type Test = {
    id: string; // uuid
    created_at: Date; // timestamp with time zone
    updated_at?: Date; // timestamp with time zone
    test_admin?: string; // uuid
    test_takers?: string[]; // ARRAY of uuid
    creator_id?: string; // uuid
    deadline?: Date; // timestamp with time zone
    title?: string; // text
    description?: string; // text
    secret_key?: string; // text
    url?: string; // text
    groups?: string; // text
  }
  
  export type Session = {
    id: number; // bigint
    created_at: Date; // timestamp with time zone
    user_id: string; // uuid
    expires?: Date; // date
    test_id?: string; // uuid
  }
  
  export type TestUser = {
    id: number; // bigint
    created_at: Date; // timestamp with time zone
    user_id?: string; // uuid
    test_id?: string; // uuid
    completed?: boolean; // boolean
  }
  
  export type User = {
    id: string; // uuid
    created_at: Date; // timestamp with time zone
    updated_at: Date; // timestamp with time zone
    last_login: Date; // timestamp with time zone
    username: string; // text
    email?: string; // text
    student_id?: string; // text
    class: string; // character varying
    challenge?: string; // text
    authn_options?: Record<string, any>; // jsonb
    additional_details?: Record<string, any>; // jsonb
    user_type: string; // USER-DEFINED (assuming it's a string)
  }
  
  export type Passkey = {
    created_at: Date; // timestamp with time zone
    last_use?: Date; // timestamp with time zone
    additional_details?: Record<string, any>; // jsonb
    cred_public_key?: Uint8Array | string; // bytea
    internal_user_id: string; // uuid
    counter?: number; // integer
    backup_eligible?: boolean; // boolean
    backup_status?: boolean; // boolean
    cred_id: string; // text
    device_type?: string; // text
    webauthn_user_id?: string; // text
    transports: string; // text
  }
  
  export type Question = {
    id: string; // uuid
    created_at: Date; // timestamp with time zone
    test_id?: string; // uuid
    metadata?: Record<string, any> |  {
      imageUrl?: string;
      codeSnippet?: string;
      tags?: string[];
    }; // json
    text?: string; // text
    type?: string; // text
  }
  
  export type Answer = {
    id: string; // uuid
    created_at: Date; // timestamp with time zone
    question_id?: string; // uuid
    is_correct?: boolean; // boolean
    text?: string; // text
  }
  
  export type Submission = {
    id: string; // uuid
    submitted_at: Date; // timestamp with time zone
    test_id?: string; // uuid
    user_id?: string; // uuid
    answers?: Record<string, any>; // json
  }
  
  export type Violation = {
    id: string; // uuid
    test_id: string; // uuid
    user_id: string; // uuid
    count?: number; // numeric
    created_at: Date; // timestamp with time zone
    updated_at: Date; // timestamp with time zone
    type?: string; // text
  }
  
//   // Types
// type TestDetails = {
//   id: string;
//   title: string;
//   description: string;
//   duration: number;
//   tags: string[];
//   groups: string[];
// };

// type Question = {
//   id: string;
//   testId: string;
//   text: string;
//   type: 'MCQ' | 'SCQ';
//   metadata: {
//     image?: string;
//     codeSnippet?: string;
//     tags?: string[];
//   };
// };

// type Answer = {
//   id: string;
//   questionId: string;
//   testId: string;
//   text: string;
//   isCorrect: boolean;
// };