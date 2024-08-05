import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Signup from '../Auth/Signup';

describe('Signup Component', () => {
    it('renders without crashing', () => {
        render(<Signup />);
    });

    it('submits the form with valid input', () => {
        const { getByLabelText, getByText } = render(<Signup />);
        const emailInput = getByLabelText('Email');
        const passwordInput = getByLabelText('Password');
        const confirmPasswordInput = getByLabelText('Confirm Password');
        const submitButton = getByText('Sign Up');

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        // Add your assertions here to check if the form is submitted successfully
    });

    it('displays an error message for invalid input', () => {
        const { getByLabelText, getByText } = render(<Signup />);
        const emailInput = getByLabelText('Email');
        const passwordInput = getByLabelText('Password');
        const confirmPasswordInput = getByLabelText('Confirm Password');
        const submitButton = getByText('Sign Up');

        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        // Add your assertions here to check if the error message is displayed
    });
});
