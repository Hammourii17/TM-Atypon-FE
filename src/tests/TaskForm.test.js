import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskForm from '../TaskForm';

describe('TaskForm', () => {
    test('renders without errors', () => {
        render(<TaskForm />);
        expect(screen.getByTestId('task-form')).toBeInTheDocument();
    });

    test('updates task input value on change', () => {
        render(<TaskForm />);
        const taskInput = screen.getByTestId('task-input');
        fireEvent.change(taskInput, { target: { value: 'New Task' } });
        expect(taskInput.value).toBe('New Task');
    });

    test('calls addTask function on form submission', () => {
        const addTaskMock = jest.fn();
        render(<TaskForm addTask={addTaskMock} />);
        const taskInput = screen.getByTestId('task-input');
        const submitButton = screen.getByTestId('submit-button');
        fireEvent.change(taskInput, { target: { value: 'New Task' } });
        fireEvent.click(submitButton);
        expect(addTaskMock).toHaveBeenCalledWith('New Task');
    });
});