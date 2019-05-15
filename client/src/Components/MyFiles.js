import React from 'react';
import { Card, CardTitle, Button, Col } from 'reactstrap';
import FileIcon, { defaultStyles } from 'react-file-icon';

import axios from '../axios';

export default function MyFiles(props) {
  const deleteFile = file => {
    axios
      .delete('/upload/delete/', { params: { file: file } })
      .then(data => {
        props.onReload();
      })
      .catch(err => {});
  };

  const downloadFile = file => {
    axios
      .get('/upload/download/', {
        responseType: 'blob',
        params: { file: file.filePath }
      })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', file.fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch(err => {});
  };
  const getExtention = file => {
    return /[.]/.exec(file) ? /[^.]+$/.exec(file)[0] : undefined;
  };
  return props.files.map(file => {
    return (
      <Col key={file.filePath} md='3'>
        <br />
        <Card body>
          <CardTitle>{file.fileName}</CardTitle>
          <FileIcon
            color='whitesmoke'
            {...defaultStyles[
              getExtention(file.fileName) ? getExtention(file.fileName) : 'txt'
            ]}
          />
          <hr />

          <Button color='primary' onClick={() => downloadFile(file)} block>
            Download
          </Button>

          <Button
            color='danger'
            onClick={() => deleteFile(file.filePath)}
            block
          >
            Delete
          </Button>
        </Card>
      </Col>
    );
  });
}
