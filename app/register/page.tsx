"use client";
import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import TextInputField from '@/components/shared/TextInputField/index';
import Button from '@/components/shared/Button/index';
import RadioGroup from '@/components/shared/RadioGroup/index';
import Checkbox from '@/components/shared/Checkbox/index';
import { registerSchema } from '@/schemas/validations/register';

interface RegisterFormProps {
    username: string;
    email: string;
    membership_type: string;
    first_name: string;
    last_name: string;
    [key: string]: string;
}

const RegisterPage: React.FC = () => {
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

    const validateForm = useCallback(() => {
        const requiredFields = ['first_name', 'last_name', 'username', 'email', 'membership_type'];
        for (let field of requiredFields) {
            if (!formData.get(field)) {
                setIsSubmitDisabled(true);
                return;
            }
        }
        setIsSubmitDisabled(false);
    });

    const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const formEntries = Object.fromEntries(data.entries());
        const otherFormEntries = Object.fromEntries(formData.entries());
        const allDat = { ...formEntries, ...otherFormEntries };
        const validationResult = registerSchema.safeParse(allDat);
        if (!validationResult.success) {
            const formattedErrors: { [key: string]: string } = validationResult.error.errors.reduce((acc, error) => {
                const path = error.path.join('.'); // Join the path array to a string
                acc[path] = error.message; // Map path to message
                return acc;
            }, {} as { [key: string]: string });
            setFormErrors(formattedErrors);
            return;
        } else {
            // Perform registration logic here
            console.log(allDat); // To check the form data
        }
    };

    useEffect(() => {
        validateForm();
    }, [formData, validateForm]);

    const radioOptions = [
        { label: "Teacher", value: "Teacher" },
        { label: "Student", value: "Student" },
    ];

    return (
        <div className='flex-col'>
            <h1 className='mb-2 text-2xl font-semibold'>Register</h1>
            <span className="mb-6 text-gray-500 font-regular text-sm">Already have an account?
                <button className="text-blue-500 text-sm mx-1.5">
                    <Link href="/auth/login"> Sign in</Link>
                </button>
            </span>
            <form className='flex-col mt-6 space-y-6' onSubmit={handleRegister} ref={formRef}>
                <TextInputField
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
                />
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