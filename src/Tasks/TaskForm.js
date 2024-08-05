import React, { useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Modal, Box, TextField, Button, Typography } from '@mui/material';
import { useAddTaskMutation } from '../features/api/apiSlice';

const TaskForm = forwardRef((props, ref) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [addTask, { isLoading, isError, error }] = useAddTaskMutation();
  const [open, setOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    openModal: () => setOpen(true),
    closeModal: () => setOpen(false),
  }));

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        console.log({ title, description });
        const newTask = await addTask({ title, description }).unwrap();
        setTitle('');
        setDescription('');
        setOpen(false);
        console.log('Task created successfully', newTask);
      } catch (err) {
        console.error('Failed to create task:', err);
      }
    },
    [title, description, addTask]
  );

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h6" component="h2">
          Create Task
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Box>
          {isError && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error.data?.error || error.error}
            </Typography>
          )}
          <Box sx={{ mt: 2 }}>
            <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
              Create Task
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
});

export default TaskForm;