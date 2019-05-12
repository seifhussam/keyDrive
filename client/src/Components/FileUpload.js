import React, { Component } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginFileMetadata from 'filepond-plugin-file-metadata';

export class FileUpload extends Component {
  constructor(props) {
    super(props);
    registerPlugin(FilePondPluginImagePreview);
    registerPlugin(FilePondPluginFileValidateSize);
    registerPlugin(FilePondPluginFileMetadata);
  }

  onFileRemove = () => {
    this.props.onReload();
  };
  render() {
    return (
      <FilePond
        allowMultiple
        maxFileSize='5MB'
        name={'file'}
        server='/api/upload'
        onremovefile={this.onFileRemove}
        onprocessfiles={this.onFileRemove}
        allowFileMetadata
        maxFiles='5'
      />
    );
  }
}

export default FileUpload;
