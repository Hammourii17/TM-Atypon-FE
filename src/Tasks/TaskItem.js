import React, { useCallback, useState } from 'react';
import { useDeleteTaskMutation, useUpdateTaskMutation } from '../features/api/apiSlice';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
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
  const [ setError] = useState('');

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
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border rounded w-full py-2 px-3"
              required
            />
          </TableCell>
          <TableCell>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border rounded w-full py-2 px-3"
              required
            />
          </TableCell>
          <TableCell>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="border rounded w-full py-2 px-3"
            />
          </TableCell>
          <TableCell>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="border rounded w-full py-2 px-3"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
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
