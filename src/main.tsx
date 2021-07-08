import { initializeIcons } from '@fluentui/react/lib/Icons'
import React from 'react'
import ReactDOM from 'react-dom'
import { ThemeProvider } from '@fluentui/react'

import './index.css'
import App from './App'
import pkg from '../package.json'


initializeIcons()

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider>
      <App version={pkg.version} />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
