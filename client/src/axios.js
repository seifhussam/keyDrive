import axios from 'axios';
import { aes_encrypt } from './utils/encryption';

const instance = axios.create({
  baseURL: 'http://localhost:3000/api/',
  withCredentials: true
});

const publicKey = 'Asymetric';
const symmetricKey = 'Symetric';

// Add a request interceptor

instance.interceptors.request.use(
  function(config) {
    // Do something before request is sent

    /*
     * config.data and config.params
     */
    // console.log('Starting Request', config);

    if (config.data) {
      //encrypt

      config.data = {
        enc: aes_encrypt(JSON.stringify(config.data), symmetricKey)
      };
      console.log(config.data);
    }

    return config;
  },
  function(error) {
    // Do something with request error
    return Promise.reject(error.response);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  function(response) {
    // Do something with response data
    console.log(response);

    return response;
  },
  function(error) {
    // Do something with response error
    return Promise.reject(error);
  }
);

export default instance;
