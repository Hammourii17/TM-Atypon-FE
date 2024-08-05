import React from 'react';
import { render, screen } from '@testing-library/react';
import TaskList from '../TaskList';

test('renders task list with correct number of tasks', () => {
    const tasks = [
        { id: 1, title: 'Task 1' },
        { id: 2, title: 'Task 2' },
        { id: 3, title: 'Task 3' },
    ];

    render(<TaskList tasks={tasks} />);

    const taskItems = screen.getAllByTestId('task-item');
    expect(taskItems.length).toBe(tasks.length);
});