"use client";
import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import TextInputField from '@/components/shared/TextInputField/index';
import Button from '@/components/shared/Button/index';
import RadioGroup from '@/components/shared/RadioGroup/index';
import Checkbox from '@/components/shared/Checkbox/index';
import { useUtilsContext } from '@/context/UtilsContext';
import httpService from '@/services';
import { useRouter } from 'next/navigation';
import { startRegistration } from '@simplewebauthn/browser';


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
        user_type: '',
    });
    const [isChecked, setIsChecked] = useState<boolean>(false);
    const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckboxChange = (checked: boolean) => {
        setIsChecked(checked);
        setFormData(() => {
            formData.set('rememberMe', checked.toString());
            validateForm('rememberMe');
            return formData;
        });
    };

    const handleRadioChange = (value: string) => {
        setFormData(() => {
            formData.set('user_type', value);
            clearError('user_type');
            validateForm('user_type');
            return formData;
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(() => {
            formData.set(name, value);
            validateForm(name);
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

    const validateForm = useCallback((fieldName: string) => {
        const requiredFields = ['username', 'email', 'student_id', 'user_type', 'userClass'];
        for (let field of requiredFields) {
            if (!formData.get(fieldName)) {
                console.log(formData.get(field), field)
                setIsSubmitDisabled(true);
                return;
            }
        }
        setIsSubmitDisabled(false);
    }, [formData]);

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const formEntries = Object.fromEntries(formData.entries());
        const payload = {
            ...formEntries,
            // userClass: formEntries.class,
        }
        setIsLoading(true);
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
            setIsLoading(false);
            notify(registerResponse.error, { type: 'danger' });
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
            setIsLoading(false);
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
          notify("Registration failed", { description: isString ? error : '', type: 'danger' });
          setIsLoading(false);
        }
      };

    // useEffect(() => {
    //     validateForm();
    // }, [formData, validateForm]);

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
                /> */}
                <TextInputField
                    label="Name"
                    name="username"
                    errorMessage={formErrors?.username}
                    placeholder='FirstName LastName'
                    required
                    onChange={handleInputChange}
                />
                <TextInputField
                    label="Student ID"
                    name="student_id"
                    errorMessage={formErrors?.student_id}
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
                    name='user_type'
                    onChange={handleRadioChange}
                    errorMessage={formErrors?.user_type}
                    required
                />
                <TextInputField
                    label="Class"
                    name="userClass"
                    errorMessage={formErrors?.userClass}
                    // required
                    onChange={handleInputChange}
                />
                <Checkbox
                    label='Remember Me'
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                />
                <Button type="submit" text="Register" disabled={isSubmitDisabled} title={isSubmitDisabled ? 'Complete the form to submit' : ''} isLoading={isLoading} />
            </form>
        </div>
    );
};

export default RegisterPage;