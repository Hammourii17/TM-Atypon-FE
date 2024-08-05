import React, { useState, useCallback } from 'react';
import Button from '@mui/material/Button';
import { useAddTaskMutation } from '../features/api/apiSlice';

const TaskForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [addTask, { isLoading, isError, error }] = useAddTaskMutation();

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        console.log({ title, description });
        const newTask = await addTask({ title, description }).unwrap();
        setTitle('');
        setDescription('');
        console.log('Task created successfully', newTask);
      } catch (err) {
        console.error('Failed to create task:', err);
      }
    },
    [title, description, addTask]
  );

  return (
    <div className="container mx-auto">
      <form onSubmit={handleSubmit}>
        <div>
          <label className="block text-gray-700">Title :</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border rounded w-full py-2 px-3"
            required
          />
        </div>
        <div>
          <label className="text-gray-700">Description : </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border rounded w-full"
            required
          />
        </div>
        {isError && <p className="text-red-500">{error.data?.error || error.error}</p>}
        <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
          Create Task
        </Button>
      </form>
    </div>
  );
};

export default TaskForm;
