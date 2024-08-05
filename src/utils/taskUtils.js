
export const sortTasks = (tasks, sortBy) => {
  const tasksCopy = [...tasks]; 
  if (sortBy === 'date') {
    return tasksCopy.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  } else if (sortBy === 'priority') {
    const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
    return tasksCopy.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }
  return tasksCopy;
};
export const filterTasks = (tasks, filter) => { // filter tasks based on the filter object
  return tasks.filter((task) => {
    if (filter.completed && !task.completed) {
      return false;
    }
    if (filter.dueDate && task.dueDate !== filter.dueDate) {
      return false;
    }
    if (filter.priority && task.priority !== filter.priority) {
      return false;
    }
    return true;
  });
}