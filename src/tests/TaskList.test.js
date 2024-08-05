import React from 'react';
import { render } from '@testing-library/react';
import TaskList from '../Tasks/TaskList';

describe('TaskList', () => {
    it('renders without crashing', () => {
        render(<TaskList />);
    });

    it('renders a loading message', () => {
        const { getByText } = render(<TaskList />);
        expect(getByText('Loading tasks...')).toBeInTheDocument();
    });

    it('renders an error message', () => {
        const { getByText } = render(<TaskList />);
        expect(getByText('Failed to load tasks: undefined')).toBeInTheDocument();
    });

    it('filters tasks based on input value', () => {
        const { getByPlaceholderText, getByText } = render(<TaskList />);
        const filterInput = getByPlaceholderText('Filter tasks');
        filterInput.value = 'Task 1';
        expect(getByText('Task 1')).toBeInTheDocument();
        expect(getByText('Task 2')).not.toBeInTheDocument();
    });
});