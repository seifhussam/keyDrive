import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from 'react-router-dom';
import Login from './Containers/Login';
import Home from './Containers/Home';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.connecToServer = this.connecToServer.bind(this);
  }

  connecToServer() {
    fetch('/');
  }

  componentDidMount() {
    this.connecToServer();
  }

  render() {
    return (
      <Router>
        <Switch>
          <Route path='/login' component={Login} />
          <Route path='/' exact component={Home} />
          <Redirect to='/' />
        </Switch>
      </Router>
    );
  }
}

export default App;
