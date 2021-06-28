import React from 'react';
import ReactDOM from 'react-dom';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import { ThemeProvider } from '@fluentui/react';

import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const version = require('../package.json').version;

initializeIcons();

const Content = () => {
  // NOTE: This template uses @fluentui/react version 8.
  // To use version 7, start from https://aka.ms/fabric7pen
  return (
    <ThemeProvider>
      <App version={version} />
    </ThemeProvider>
  );
};

ReactDOM.render(
  <Content />, 
  document.getElementById("content")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
