import React, { Component } from 'react';
import {
  Jumbotron,
  Button,
  Input,
  Label,
  FormGroup,
  Form,
  Col,
  FormFeedback,
  Row,
  Alert
} from 'reactstrap';

import axios from '../axios';

export class Login extends Component {
  constructor() {
    super();
    this.state = {
      email: {
        value: '',

        error: '',
        valid: false,
        touched: false
      },
      password: {
        value: '',
        error: '',
        valid: false,
        touched: false
      },
      error: 'Invalid email or password',
      visible: false
    };
  }

  componentDidMount() {
    axios
      .get('/users/current')
      .then(data => {
        this.props.history.push('/');
      })
      .catch(err => {});
  }

  handleSubmit = event => {
    event.preventDefault();

    if (this.state.password.valid && this.state.email.valid) {
      axios
        .post('users/login', {
          user: {
            email: this.state.email.value,
            password: this.state.password.value
          }
        })
        .then(data => {
          console.log('success');
          this.props.history.push('/');
        })
        .catch(error => {
          console.log('Error');

          this.setState({ visible: true });
        });
    }
  };

  handleChange = (event, field) => {
    switch (field) {
      case 'email':
        let oldEmail = this.state.email;
        this.setState(
          {
            email: {
              ...oldEmail,
              value: event.target.value,
              touched: true
            }
          },
          () => {
            this.checkEmailValidity();
          }
        );
        break;
      case 'password':
        let oldPassword = this.state.password;
        this.setState(
          {
            password: {
              ...oldPassword,
              value: event.target.value,
              touched: true
            }
          },
          () => {
            this.checkPasswordValidity(this.state.password.value);
          }
        );

        break;
      default:
        break;
    }
  };

  checkPasswordValidity = value => {
    let isValid = true;

    isValid = value.trim() !== '' && isValid;

    if (!isValid) {
      let oldPassword = this.state.password;
      this.setState({
        password: {
          ...oldPassword,
          valid: false,
          error: 'Password is required'
        }
      });
      return;
    }
    let oldPassword = this.state.password;
    this.setState({
      password: {
        ...oldPassword,
        valid: true,
        error: ''
      }
    });
  };
  onDismiss = () => {
    this.setState({ visible: false });
  };
  checkEmailValidity = () => {
    let isValid = true;

    isValid = this.state.email.value.trim() !== '' && isValid;

    if (!isValid) {
      let oldEmail = this.state.email;

      this.setState({
        email: {
          ...oldEmail,
          valid: false,
          error: 'email is required'
        }
      });
      return;
    }
    const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    isValid = pattern.test(this.state.email.value.trim()) && isValid;

    if (!isValid) {
      let oldEmail = this.state.email;
      this.setState({
        email: {
          ...oldEmail,
          valid: isValid,
          error: 'enter a valid email'
        }
      });
      return;
    }

    let oldEmail = this.state.email;
    this.setState({
      email: {
        ...oldEmail,
        valid: isValid,
        error: ''
      }
    });
  };
  render() {
    return (
      <Jumbotron>
        <Row>
          <Col sm='12' md={{ size: 8, offset: 4 }}>
            <h1>KeyDrive</h1>
          </Col>
        </Row>
        <br />
        <Row>
          <Col sm='12' md={{ size: 6, offset: 3 }}>
            <Form onSubmit={this.handleSubmit}>
              <FormGroup>
                <Label for='email'>Email</Label>
                <Input
                  value={this.state.email.value}
                  type='email'
                  name='email'
                  id='email'
                  placeholder='email'
                  onChange={event => this.handleChange(event, 'email')}
                  invalid={this.state.email.touched && !this.state.email.valid}
                  valid={this.state.email.valid}
                  required
                />

                <FormFeedback valid={this.state.email.valid}>
                  {this.state.email.error}
                </FormFeedback>
              </FormGroup>

              <FormGroup>
                <Label for='password'>Password</Label>
                <Input
                  value={this.state.password.value}
                  type='password'
                  name='password'
                  id='password'
                  placeholder='password'
                  onChange={event => this.handleChange(event, 'password')}
                  invalid={
                    this.state.password.touched && !this.state.password.valid
                  }
                  valid={this.state.password.valid}
                  required
                />

                <FormFeedback valid={this.state.password.valid}>
                  {this.state.password.error}
                </FormFeedback>
              </FormGroup>
              <hr />
              <Button color='success' size='lg'>
                Login
              </Button>
            </Form>
            <br />
            <Alert
              color='danger'
              isOpen={this.state.visible}
              toggle={this.onDismiss}
              fade
            >
              {this.state.error}
            </Alert>
          </Col>
        </Row>
      </Jumbotron>
    );
  }
}

export default Login;
