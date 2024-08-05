import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './auth/Login';
import Signup from './auth/Signup';
import TaskList from './Tasks/TaskList';
import TaskForm from './Tasks/TaskForm';

import Footer from './layout/Footer';

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? <Component {...props} /> : <Redirect to="/login" />
      }
    />
  );
};

const Routes = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <Router>

      <main className="container mx-auto p-4">
        <Switch>
          <Route path="/login" render={() => (
            isAuthenticated ? <Redirect to="/tasks" /> : <Login />
          )} />
          <Route path="/signup" render={() => (
            isAuthenticated ? <Redirect to="/tasks" /> : <Signup />
          )} />
          <ProtectedRoute path="/tasks" component={TaskList} />
          <ProtectedRoute path="/create-task" component={TaskForm} />
          <Route path="/" exact>
            <Redirect to={isAuthenticated ? "/tasks" : "/login"} />
          </Route>
        </Switch>
      </main>
      <Footer />
    </Router>
  );
};

export default Routes;
