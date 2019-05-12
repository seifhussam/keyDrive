import React, { Component } from 'react';
import {
  Navbar,
  NavbarBrand,
  NavbarToggler,
  Collapse,
  Nav,
  Row,
  Jumbotron
} from 'reactstrap';

import axios from '../axios';
import FileUpload from '../Components/FileUpload';
import MyFiles from '../Components/MyFiles';

export class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      files: []
    };
  }
  componentDidMount() {
    axios
      .get('/users/current')
      .then(data => {
        axios
          .get('/upload')
          .then(data => {
            this.setState({
              files: data.data
            });
          })
          .catch(err => {});
      })
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

  onReload = () => {
    axios.get('/upload').then(data => {
      this.setState({
        files: data.data
      });
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
          <FileUpload onReload={this.onReload} />
          <h2>Uploaded files</h2>
          {this.state.files.length > 0 ? (
            <Row>
              <MyFiles onReload={this.onReload} files={this.state.files} />
            </Row>
          ) : (
            <p>...</p>
          )}
        </Jumbotron>
      </div>
    );
  }
}

export default Home;
