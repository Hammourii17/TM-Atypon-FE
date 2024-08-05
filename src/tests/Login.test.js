import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../../features/api/apiSlice';
import { useHistory } from 'react-router-dom';
import Login from '../Auth/Login';

jest.mock('react-redux', () => ({
    useDispatch: jest.fn(),
}));

jest.mock('../../features/api/apiSlice', () => ({
    useLoginMutation: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
    useHistory: jest.fn(),
}));

describe('Login', () => {
    beforeEach(() => {
        useDispatch.mockClear();
        useLoginMutation.mockClear();
        useHistory.mockClear();
    });

    test('should render login form', () => {
        const { getByLabelText, getByText } = render(<Login />);
        
        const emailInput = getByLabelText('Email');
        const passwordInput = getByLabelText('Password');
        const submitButton = getByText('Login');

        expect(emailInput).toBeInTheDocument();
        expect(passwordInput).toBeInTheDocument();
        expect(submitButton).toBeInTheDocument();
    });

    test('should call login mutation on form submission', () => {
        const mockLoginMutation = jest.fn();
        useLoginMutation.mockReturnValue([mockLoginMutation]);

        const { getByLabelText, getByText } = render(<Login />);
        
        const emailInput = getByLabelText('Email');
        const passwordInput = getByLabelText('Password');
        const submitButton = getByText('Login');

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        expect(mockLoginMutation).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password123',
        });
    });

    test('should redirect to dashboard on successful login', () => {
        const mockHistoryPush = jest.fn();
        useHistory.mockReturnValue({ push: mockHistoryPush });

        const { getByLabelText, getByText } = render(<Login />);
        
        const emailInput = getByLabelText('Email');
        const passwordInput = getByLabelText('Password');
        const submitButton = getByText('Login');

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        expect(mockHistoryPush).toHaveBeenCalledWith('/dashboard');
    });
});