import React, { useMemo, useState } from 'react';
import { useFetchTasksQuery } from '../features/api/apiSlice';
import { filterTasks, sortTasks } from '../utils/taskUtils';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TaskForm from './TaskForm';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import Grid from '@mui/material/Grid';
import  { useRef } from 'react';
import { Button } from '@mui/material';
import TaskItem from './TaskItem';


const defaultTheme = createTheme();

const TaskList = () => {
  const [filter, setFilter] = useState({ completed: '', dueDate: '', priority: '' });
  const [sortBy, setSortBy] = useState('date');
  const { data: tasks = [], error, isLoading } = useFetchTasksQuery();

  const filteredTasks = useMemo(() => filterTasks(tasks, filter), [tasks, filter]);
  const sortedTasks = useMemo(() => sortTasks(filteredTasks, sortBy), [filteredTasks, sortBy]);
  const taskFormRef = useRef();
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
        <Typography component="h1" variant="h5" align="center" sx={{ marginTop: 4 }}>
          Your Tasks
        </Typography>
        <Button variant="outlined" onClick={() => taskFormRef.current.openModal()}>
        Open Task Form
      </Button>
      <TaskForm ref={taskFormRef} />

        <Grid container spacing={2} sx={{ mb: 2 }}>

            <FormControl  variant="outlined" margin="dense">
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


            <FormControl  variant="outlined" margin="dense">
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

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="task table">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedTasks.map(task => (
                <TaskItem key={task._id} task={task} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </ThemeProvider>
  );
};

export default TaskList;
