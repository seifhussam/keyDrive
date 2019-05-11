import React, { Component } from 'react';
import {
  Navbar,
  NavbarBrand,
  NavbarToggler,
  Collapse,
  Nav,
  Jumbotron
} from 'reactstrap';

import axios from '../axios';
import FileUpload from '../Components/FileUpload';

export class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    };
  }
  componentDidMount() {
    axios
      .get('/users/current')
      .then(data => {})
      .catch(err => {
        this.props.history.push('/login');
      });
  }
  logout = () => {
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    this.props.history.push('/login');
  };
  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  };
  render() {
    return (
      <div>
        <Navbar color='light' light expand='md'>
          <NavbarBrand href='/'>KeyDrive</NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className='ml-auto' navbar>
              <button
                className='btn btn-outline-success my-2 my-sm-0'
                onClick={this.logout}
              >
                Logout
              </button>
            </Nav>
          </Collapse>
        </Navbar>
        <Jumbotron>
          <h2> File upload </h2>
          <FileUpload />
        </Jumbotron>
      </div>
    );
  }
}

export default Home;
