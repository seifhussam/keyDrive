import React, { Component } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';

import axios from '../axios';

// Register the plugin

export class FileUpload extends Component {
  constructor(props) {
    super(props);
    registerPlugin(FilePondPluginImagePreview);
    registerPlugin(FilePondPluginFileValidateSize);
  }

  onFileRemove = item => {
    console.log(item);
    axios
      .delete('upload/revert/', { params: { file: item.serverId } })
      .then(data => {
        console.log(data);
        return true;
      })
      .catch(err => {
        return false;
      });
  };
  render() {
    return (
      <FilePond
        allowMultiple
        maxFileSize='5MB'
        name={'file'}
        server='/api/upload'
      />
    );
  }
}

export default FileUpload;
