import React from 'react';
import FileIcon, { defaultStyles } from 'react-file-icon';

export default function MyFiles(props) {
  return <FileIcon color='whitesmoke' extension={props.ext} />;
}
