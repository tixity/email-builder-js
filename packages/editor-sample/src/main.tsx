import React, { createRef } from 'react';
import ReactDOM, { type Container } from 'react-dom/client';

import { CssBaseline, ThemeProvider } from '@mui/material';

import App from './App';
import theme from './theme';
import { type TEditorConfiguration } from './documents/editor/core';
import { VarProvider } from './App/useVarContext';
import { renderToStaticMarkup, TReaderDocument } from '@usewaypoint/email-builder';
import { render } from 'react-dom';

export interface Config {
  config?: TEditorConfiguration;
  name: string;
  id: string;
  onSave: (config: { name: string; id: string; config: TEditorConfiguration }) => Promise<void> | void;
  vars?: Record<string, string[]>;
}

export const init = (element: Container, config: Config) => {
  const ref = createRef<{ getConfig: () => TReaderDocument }>();

  ReactDOM.createRoot(element).render(
    <React.StrictMode>
      <VarProvider value={config.vars}>
        <ThemeProvider theme={theme}>
          <CssBaseline>
            <App config={config} ref={ref} />
          </CssBaseline>
        </ThemeProvider>
      </VarProvider>
    </React.StrictMode>
  );

  return {
    render: () => (ref.current ? renderToStaticMarkup(ref.current.getConfig(), { rootBlockId: 'root' }) : null),
  };
};

if (import.meta.env.DEV) {
  const { render } = init(document.getElementById('root')!, {
    name: 'New Email',
    id: 'aksjdh',
    onSave: (config) => {
      console.log(config);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 1000);
      });
    },
    vars: {
      User: ['user_id', 'user_name', 'email'],
      Date: ['today', 'now', 'tomorrow'],
    },
  });

  // render a config via render
  console.log(render());
}
