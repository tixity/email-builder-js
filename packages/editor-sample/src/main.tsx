import React, { createRef } from 'react';
import ReactDOM, { type Container } from 'react-dom/client';

import { CssBaseline, ThemeProvider } from '@mui/material';
import { renderToStaticMarkup, TReaderDocument } from '@usewaypoint/email-builder';

import App from './App';
import { MediaProvider } from './App/useMediaContext';
import { TemplatesProvider } from './App/useTemplatesContext';
import { VarProvider } from './App/useVarContext';
import { type TEditorConfiguration } from './documents/editor/core';
import theme from './theme';

export interface MediaAsset {
  name: string;
  url: string;
  thumbUrl: string;
  width?: number;
  height?: number;
}

export interface MediaRoot {
  key: string;
  label: string;
  access: 'ro' | 'rw';
}

export interface Config {
  config?: TEditorConfiguration;
  name: string;
  id: string;
  onSave: (config: { name: string; id: string; config: TEditorConfiguration }) => Promise<void> | void;
  vars?: Record<string, string[]>;
  templates?: Record<string, { label: string; html: string }>;
  media?: {
    list: (root?: string) => Promise<{ roots: MediaRoot[]; files: MediaAsset[]; root: string }>;
    upload: (file: File, root: string) => Promise<MediaAsset>;
    replace: (name: string, file: File, root: string) => Promise<MediaAsset>;
    rename: (name: string, newName: string, root: string) => Promise<MediaAsset>;
    delete: (name: string, root: string) => Promise<void>;
    usage?: (name: string, root: string) => Promise<{ count: number; names: string[] }>;
  };
}

export const init = (element: Container, config: Config) => {
  const ref = createRef<{ getConfig: () => TReaderDocument }>();

  ReactDOM.createRoot(element).render(
    <React.StrictMode>
      <VarProvider value={config.vars}>
        <TemplatesProvider value={config.templates ?? {}}>
          <MediaProvider value={config.media}>
            <ThemeProvider theme={theme}>
              <CssBaseline>
                <App config={config} ref={ref} />
              </CssBaseline>
            </ThemeProvider>
          </MediaProvider>
        </TemplatesProvider>
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
    templates: {
      events: {
        html: '<div style="color: red">Thi sis nice</div>',
        label: 'Upcoming Events',
      },
    },
  });

  // render a config via render
  console.log(render());
}
