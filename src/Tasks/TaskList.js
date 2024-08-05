import React, { useMemo, useState } from 'react';
import { useFetchTasksQuery } from '../features/api/apiSlice';
import TaskItem from './TaskItem';
import { filterTasks, sortTasks } from '../utils/taskUtils';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TaskForm from './TaskForm';

const defaultTheme = createTheme();

const TaskList = () => {
  const [filter, setFilter] = useState({ completed: '', dueDate: '', priority: '' });
  const [sortBy, setSortBy] = useState('date');
  const { data: tasks = [], error, isLoading } = useFetchTasksQuery();

  const filteredTasks = useMemo(() => filterTasks(tasks, filter), [tasks, filter]);
  const sortedTasks = useMemo(() => sortTasks(filteredTasks, sortBy), [filteredTasks, sortBy]);

 

  if (isLoading) {
    return <Typography>Loading tasks...</Typography>;
  }

  if (error) {
    return <Typography color="error">Failed to load tasks: {error.data?.error || error.error}</Typography>;
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5">
            Your Tasks
          </Typography>
          <Box sx={{ mt: 1, width: '100%' }}>
            <TaskForm  />
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" margin="dense">
                  <InputLabel>Filter</InputLabel>
                  <Select
                    value={filter.completed}
                    onChange={e => setFilter({ ...filter, completed: e.target.value })}
                    label="Filter"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" margin="dense">
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    label="Sort By"
                  >
                    <MenuItem value="date">Date</MenuItem>
                    <MenuItem value="priority">Priority</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Box>
              {sortedTasks.map(task => ( 
                <TaskItem key={task._id} task={task}  />
              ))}
            </Box>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default TaskList;
