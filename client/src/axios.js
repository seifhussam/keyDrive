import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:3000/api/',
  withCredentials: true
});

// let publicKey = 'Asymetric';

// Add a request interceptor

instance.interceptors.request.use(
  function(config) {
    // Do something before request is sent

    /*
     * config.data and config.params
     */
    console.log('Starting Request', config);

    // if (config.params) {
    //   //encrypt
    //   // config.params = CryptoJS.AES.encrypt(config.params, symmetricKey);
    // }

    // if (config.data) {
    //   //encrypt
    //   // config.data = CryptoJS.AES.encrypt(
    //   //   JSON.stringify(config.data),
    //   //   symmetricKey
    //   // );
    // }

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
    return response;
  },
  function(error) {
    // Do something with response error
    return Promise.reject(error);
  }
);

export default instance;
