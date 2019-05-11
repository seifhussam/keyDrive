import axios from 'axios';
const instance = axios.create({
  baseURL: 'http://localhost:3000/api/',
  withCredentials: true
});

// Add a request interceptor
axios.interceptors.request.use(
  function(config) {
    // Do something before request is sent
    console.log(config);

    return config;
  },
  function(error) {
    // Do something with request error
    return Promise.reject(error.response);
  }
);

// Add a response interceptor
axios.interceptors.response.use(
  function(response) {
    // Do something with response data
    return response;
  },
  function(error) {
    // Do something with response error
    return Promise.reject(error);
  }
);

export default instance;
