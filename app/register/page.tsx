"use client";
import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import TextInputField from '@/components/shared/TextInputField/index';
import Button from '@/components/shared/Button/index';
import RadioGroup from '@/components/shared/RadioGroup/index';
import Checkbox from '@/components/shared/Checkbox/index';
import { useUtilsContext } from '@/context/UtilsContext';
import httpService from '@/services';
import { useRouter } from 'next/router';
import { startRegistration } from '@simplewebauthn/browser';

// export const metadata: Metadata = {
//     title: 'Join TestShield',
//   };

interface RegisterFormProps {
    username: string;
    email: string;
    membership_type: string;
    first_name: string;
    last_name: string;
    [key: string]: string;
}

const RegisterPage: React.FC = () => {
    const { notify } = useUtilsContext();
    const router = useRouter();
    const formRef = useRef<HTMLFormElement | null>(null);
    const [formData, setFormData] = useState(new FormData());
    const [formErrors, setFormErrors] = useState<RegisterFormProps | { [key: string]: string }>({
        membership_type: '',
    });
    const [isChecked, setIsChecked] = useState<boolean>(false);
    const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(true);

    const handleCheckboxChange = (checked: boolean) => {
        setIsChecked(checked);
        setFormData(() => {
            formData.set('rememberMe', checked.toString());
            validateForm();
            return formData;
        });
    };

    const handleRadioChange = (value: string) => {
        setFormData(() => {
            formData.set('membership_type', value);
            clearError('membership_type');
            validateForm();
            return formData;
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(() => {
            formData.set(name, value);
            validateForm();
            return formData;
        });
        clearError(name);
    };

    const clearError = (fieldName: string) => {
        setFormErrors((prevErrors) => {
            const { [fieldName]: removedError, ...restErrors } = prevErrors;
            return restErrors;
        });
    };

    const validateForm = () => {
        const optional = ['first_name', 'last_name']
        const requiredFields = ['username', 'email', 'membership_type', 'class'];
        for (let field of requiredFields) {
            if (!formData.get(field)) {
                setIsSubmitDisabled(true);
                return;
            }
        }
        setIsSubmitDisabled(false);
    };

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const formEntries = Object.fromEntries(formData.entries());
        const payload = {
            ...formEntries,
            userClass: formEntries.class,
        }
        // delete payload.class;
    
        try {
          // First, send user details to the server
          const registerResponse = await httpService.post('/api/auth/registration-options', payload);
    
          if (registerResponse.error) {
            if (registerResponse.redirect) {
              // Redirect to login if user already exists
              router.push(registerResponse.redirect);
              return;
            }
            throw new Error(registerResponse.error || 'Registration failed');
          }
    
          const { registrationOptions, userId } = registerResponse;
    
          // Start the WebAuthn registration process
          const attResp = await startRegistration(registrationOptions);
    
          // Verify the registration
          const verifyResponse = await httpService.post('/api/auth/verify-registration', { 
            attestation: attResp,
            userId: userId
          });
    
          if (verifyResponse.error) {
            throw new Error('Registration verification failed');
          }
    
          const { sessionToken } = verifyResponse;
    
          // Set the session token in a cookie
          document.cookie = `session_token=${sessionToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict; ${process.env.NODE_ENV === 'production' ? 'Secure' : ''}`;
    
          // Redirect to dashboard or home page
          router.push('/dashboard');
    
        } catch (error) {
          console.error('Registration error:', error);
          const isString = typeof error === 'string';
          notify("Registration failed", { description: isString ? error : JSON.stringify(error) , type: 'error' });
        }
      };

    useEffect(() => {
        validateForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData]);

    const radioOptions = [
        { label: "Teacher", value: "Teacher" },
        { label: "Student", value: "Student" },
    ];

    return (
        <div className='flex-col mt-8'>
            <h1 className='mb text-2xl font-semibold'>Register</h1>
            <span className="mb-6 text-gray-500 font-regular text-sm">Already have an account?
                <button className="text-blue-600 text-sm mx-1.5">
                    <Link href="/auth/login"> Sign in</Link>
                </button>
            </span>
            <form className='flex-col mt-6 space-y-6' onSubmit={handleRegister} ref={formRef}>
                {/* <TextInputField
                    label="First Name"
                    name="first_name"
                    errorMessage={formErrors?.first_name}
                    required
                    onChange={handleInputChange}
                />
                <TextInputField
                    label="Last Name"
                    name="last_name"
                    errorMessage={formErrors?.last_name}
                    required
                    onChange={handleInputChange}
                /> */}
                <TextInputField
                    label="Student ID"
                    name="username"
                    errorMessage={formErrors?.username}
                    required
                    onChange={handleInputChange}
                />
                <TextInputField
                    label="Email"
                    name="email"
                    type="email"
                    errorMessage={formErrors?.email}
                    required
                    onChange={handleInputChange}
                />
                <RadioGroup
                    label="Role"
                    options={radioOptions}
                    name='membership_type'
                    onChange={handleRadioChange}
                    errorMessage={formErrors?.membership_type}
                    required
                />
                <TextInputField
                    label="Class"
                    name="userClass"
                    errorMessage={formErrors?.class}
                    // required
                    onChange={handleInputChange}
                />
                <Checkbox
                    label='Remember Me'
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                />
                <Button type="submit" text="Register" disabled={isSubmitDisabled} title={isSubmitDisabled ? 'Complete the form to submit' : ''} />
            </form>
        </div>
    );
};

export default RegisterPage;