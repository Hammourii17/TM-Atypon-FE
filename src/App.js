import React, { useEffect } from 'react';
import { Route, Switch, BrowserRouter as Router } from 'react-router-dom';
import Header from './layout/Header';
import Footer from './layout/Footer';
import Login from './auth/Login';
import Signup from './Auth/Signup';
import TaskList from './Tasks/TaskList';
import './App.css';
import { useDispatch } from 'react-redux';

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
    dispatch(login({ token }));
    }
  }, [dispatch]);
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="container mx-auto p-4">
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/signup" component={Signup} />
            <Route path="/" component={TaskList} exact />
          </Switch>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
