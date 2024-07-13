
export const MESSAGES: { [key: string]: string } = {
    MEMBER_TYPE_REQUIRED: 'Member type required',
    MEMBER_TYPE_INVALID: 'Invalid member type',
    ACT_FIRSTNAME_REQUIRED: 'First name is required',
    ACT_LASTNAME_REQUIRED: 'Last name is required',
    ACT_FULLNAME_REQUIRED: 'Full name is required',
    ACT_FULLNAME_INVALID: 'Fullname is invalid',
    ACT_EMAIL_REQUIRED: 'Email is required',
    ACT_EMAIL_INVALID: 'Invalid email',
    ACT_EMAIL_EXISTS: 'Email already exists',
    ACT_EMAIL_EXIST: 'Email already exists',
    ACT_INVALID_LOGIN: 'Invalid credentials',
    ACT_PASSWORD_REQUIRED: 'Password is required',
    INVALID_CREDENTIALS: 'Your credentials are incorrect',
    ACT_REGISTER: `You don't have an account please create one`,
  };
  
  export const lookupMessageByKey = (messageKey: string | number) => {
    if (!messageKey) return '';
  
    const foundMessageText = MESSAGES[messageKey] || '';
  
    return foundMessageText;
  };
  