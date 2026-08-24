import React, { forwardRef, useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { FieldError } from './FieldError';

export type ValidationKind = 'name' | 'email' | 'phone' | 'password' | 'url' | 'requiredText' | 'positiveNumber' | 'dateAfter';

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    validation?: ValidationKind;
    compareTo?: string;
    error?: string;
    showError?: boolean;
}

const getValidationError = (value: string, kind?: ValidationKind, required?: boolean, compareTo?: string) => {
    const trimmedValue = value.trim();
    if (required && !trimmedValue) return 'This field is required.';
    if (!trimmedValue) return undefined;

    switch (kind) {
        case 'requiredText':
            return undefined;
        case 'positiveNumber':
            return Number(value) > 0 ? undefined : 'Value must be greater than 0.';
        case 'dateAfter':
            return compareTo && value < compareTo ? 'Draw date must be on or after the sale end date.' : undefined;
        case 'name':
            return /^[A-Za-z][A-Za-z .'’-]*$/.test(trimmedValue)
                ? undefined
                : 'Name can contain only letters and spaces.';
        case 'email':
            return /^\S+@\S+\.\S+$/.test(trimmedValue) ? undefined : 'Please enter a valid email address.';
        case 'phone':
            return /^\d{10}$/.test(trimmedValue) ? undefined : 'Phone number must be exactly 10 digits.';
        case 'password':
            return value.length >= 6 ? undefined : 'Password must be at least 6 characters.';
        case 'url':
            try {
                new URL(trimmedValue);
                return undefined;
            } catch {
                return 'Please enter a valid URL.';
            }
        default:
            return undefined;
    }
};

export const ValidatedInput = forwardRef<HTMLInputElement, ValidatedInputProps>(function ValidatedInput(
    { validation, error, showError = true, onChange, onBlur, className = '', required, compareTo, ...props },
    ref
) {
    const [liveError, setLiveError] = useState<string | undefined>();
    const displayedError = error ?? liveError;

    useEffect(() => {
        if (error !== undefined) {
            setLiveError(error);
        } else if (validation === 'dateAfter') {
            setLiveError(getValidationError(String(props.value ?? ''), validation, required, compareTo));
        }
    }, [compareTo, error, props.value, required, validation]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLiveError(getValidationError(event.target.value, validation, required, compareTo));
        onChange?.(event);
    };

    return (
        <>
            <input
                {...props}
                ref={ref}
                required={required}
                aria-invalid={Boolean(displayedError)}
                onChange={handleChange}
                onBlur={(event) => {
                    setLiveError(getValidationError(event.target.value, validation, required, compareTo));
                    onBlur?.(event);
                }}
                className={`${className} ${displayedError ? 'border-rose-400' : ''}`}
            />
            {showError && <FieldError message={displayedError} />}
        </>
    );
});

export const PasswordInput = forwardRef<HTMLInputElement, Omit<ValidatedInputProps, 'type'>>(function PasswordInput(
    props,
    ref
) {
    const [visible, setVisible] = useState(false);
    return (
        <div className="relative">
            <ValidatedInput
                {...props}
                ref={ref}
                type={visible ? 'text' : 'password'}
                validation="password"
                className={`${props.className || ''} pr-10`}
            />
            <button
                type="button"
                aria-label={visible ? 'Hide password' : 'Show password'}
                onClick={() => setVisible((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-1"
            >
                {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
        </div>
    );
});

export default ValidatedInput;