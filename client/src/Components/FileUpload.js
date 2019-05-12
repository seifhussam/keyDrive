import React, { Component } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginFileMetadata from 'filepond-plugin-file-metadata';
import { Alert } from 'reactstrap';
import Aux from '../HOC/_aux';

export class FileUpload extends Component {
  constructor(props) {
    super(props);
    registerPlugin(FilePondPluginImagePreview);
    registerPlugin(FilePondPluginFileValidateSize);
    registerPlugin(FilePondPluginFileMetadata);

    this.state = {
      visible: false
    };
  }

  onDismiss = () => {
    this.setState({ visible: false });
  };
  onFileRemove = () => {
    this.props.onReload();
  };

  onWarning = err => {
    if (err) {
      this.setState({
        visible: true
      });
    }
  };

  render() {
    return (
      <Aux>
        <Alert
          color='warning'
          isOpen={this.state.visible}
          toggle={this.onDismiss}
        >
          Max files reached, you can not upload more than 5 files.
        </Alert>
        <FilePond
          allowMultiple
          maxFileSize='5MB'
          name={'file'}
          server='/api/upload'
          onremovefile={this.onFileRemove}
          onprocessfiles={this.onFileRemove}
          onwarning={err => this.onWarning(err)}
          allowFileMetadata
          maxFiles='5'
        />
      </Aux>
    );
  }
}

export default FileUpload;
