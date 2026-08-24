import React from 'react';

interface FieldErrorProps {
    message?: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({ message }) => (
    message ? <p className="mt-1.5 text-[11px] font-medium text-rose-600" role="alert">{message}</p> : null
);

export default FieldError;
