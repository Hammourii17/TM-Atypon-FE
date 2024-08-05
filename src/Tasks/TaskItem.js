import React, { useCallback, useState } from 'react';
import { useDeleteTaskMutation, useUpdateTaskMutation } from '../features/api/apiSlice';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const TaskItem = ({ task }) => {
  const [deleteTask] = useDeleteTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [dueDate, setDueDate] = useState(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
  const [priority, setPriority] = useState(task.priority || 'Low');
  const [completed, setCompleted] = useState(task.completed);
  const [setError] = useState('');

  const handleDelete = useCallback(async () => {
    try {
      await deleteTask(task._id).unwrap();
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  }, [deleteTask, task._id]);

  const handleUpdate = useCallback(async () => {
    try {
      await updateTask({ id: task._id, title, description, dueDate, priority, completed }).unwrap();
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update task');
      console.error('Failed to update task', err);
    }
  }, [title, description, dueDate, priority, completed, task._id, updateTask, setError]);

  const handleComplete = useCallback(async () => {
    try {
      await updateTask({ id: task._id, completed: !completed }).unwrap();
      setCompleted(!completed);
    } catch (err) {
      console.error('Failed to update task', err);
    }
  }, [completed, task._id, updateTask]);

  return (
    <TableRow>
      {isEditing ? (
        <>
          <TableCell>
            <TextField
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              label="Title"
              variant="outlined"
              fullWidth
              required
            />
          </TableCell>
          <TableCell>
            <TextField
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              label="Description"
              variant="outlined"
              multiline
              fullWidth
              required
            />
          </TableCell>
          <TableCell>
            <TextField
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              label="Due Date"
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              fullWidth
            />
          </TableCell>
          <TableCell>
            <FormControl variant="outlined" fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                label="Priority"
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </Select>
            </FormControl>
          </TableCell>
          <TableCell>{completed ? 'Completed' : 'Pending'}</TableCell>
          <TableCell>
            <IconButton onClick={handleUpdate} color="primary">
              <CheckIcon />
            </IconButton>
            <IconButton onClick={() => setIsEditing(false)} color="secondary">
              <CloseIcon />
            </IconButton>
          </TableCell>
        </>
      ) : (
        <>
          <TableCell>{task.title}</TableCell>
          <TableCell>{task.description}</TableCell>
          <TableCell>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Invalid Date'}</TableCell>
          <TableCell>{task.priority}</TableCell>
          <TableCell>{completed ? 'Completed' : 'Pending'}</TableCell>
          <TableCell>
            <IconButton onClick={() => setIsEditing(true)} color="primary">
              <EditIcon />
            </IconButton>
            <IconButton onClick={handleDelete} color="secondary">
              <DeleteIcon />
            </IconButton>
            <IconButton onClick={handleComplete} color={completed ? 'default' : 'success'}>
              {completed ? <CloseIcon /> : <CheckIcon />}
            </IconButton>
          </TableCell>
        </>
      )}
    </TableRow>
  );
};

export default TaskItem;
