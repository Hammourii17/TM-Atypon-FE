import React, { useCallback, useState } from 'react';
import { useDeleteTaskMutation, useUpdateTaskMutation } from '../features/api/apiSlice';

const TaskItem = ({ task }) => {
  const [deleteTask] = useDeleteTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [dueDate, setDueDate] = useState(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
  const [priority, setPriority] = useState(task.priority || 'Low');
  const [completed, setCompleted] = useState(task.completed);
  const [error, setError] = useState('');

  const handleDelete = useCallback ( async () => {
    try {
      await deleteTask(task._id).unwrap();

    } catch (err) {
      console.error('Failed to delete task', err);
    }
  },);

  const handleUpdate = useCallback  (async () => {

    try {
      await updateTask({ id: task._id, title, description, dueDate, priority, completed }).unwrap();
      setIsEditing(false);

    } catch (err) {
      setError('Failed to update task');
      console.error('Failed to update task', err);
    }
  },[title, description, dueDate, priority, completed]
);

  const handleComplete = useCallback (async () => {
    try {
      await updateTask({ id: task._id, completed: !completed }).unwrap();
      setCompleted(!completed);

    } catch (err) {
      console.error('Failed to update task', err);
    }
  },  [completed]
);

  return (
    <div className={`border rounded p-4 mb-4 ${completed ? 'bg-green-100' : ''}`}>
      {isEditing ? (
        <form onSubmit={handleUpdate}>
          <div className="mb-4">
            <label className="block text-gray-700">Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border rounded w-full py-2 px-3"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border rounded w-full py-2 px-3"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Due Date:</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="border rounded w-full py-2 px-3"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Priority:</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="border rounded w-full py-2 px-3"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded mr-2">
            Update
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="bg-gray-500 text-white py-2 px-4 rounded"
          >
            Cancel
          </button>
        </form>
      ) : (
        <>
          <h3 className="text-xl">{task.title}</h3>
          <p>{task.description}</p>
          <p>Due Date: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Invalid Date'}</p>
          <p>Priority: {task.priority}</p>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-yellow-500 text-white py-1 px-3 rounded mr-2"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white py-1 px-3 rounded mr-2"
          >
            Delete
          </button>
          <button
            onClick={handleComplete}
            className={`py-1 px-3 rounded ${completed ? 'bg-gray-500' : 'bg-green-500'} text-white`}
          >
            {completed ? 'Undo Complete' : 'Mark Complete'}
          </button>
        </>
      )}
    </div>
  );
};

export default TaskItem;
