import React from 'react';
import ReactDOM, { type Container } from 'react-dom/client';

import { CssBaseline, ThemeProvider } from '@mui/material';

import App from './App';
import theme from './theme';
import { type TEditorConfiguration } from './documents/editor/core';

export interface Config {
  config?: TEditorConfiguration;
  name: string;
  id: string;
}

export const mountEmailBuilder = (element: Container, config: Config) => {
  ReactDOM.createRoot(element).render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline>
          <App config={config} />
        </CssBaseline>
      </ThemeProvider>
    </React.StrictMode>
  );
};

if (import.meta.env.DEV) {
  mountEmailBuilder(document.getElementById('root')!, { name: 'New Email', id: 'aksjdh' });
}
