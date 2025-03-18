import React from 'react';

import { Stack, useTheme } from '@mui/material';

import { resetDocument, useDocument, useInspectorDrawerOpen } from '../documents/editor/EditorContext';

import { type Config } from '../main';
import InspectorDrawer, { INSPECTOR_DRAWER_WIDTH } from './InspectorDrawer';
import TemplatePanel from './TemplatePanel';

function useDrawerTransition(cssProperty: 'margin-left' | 'margin-right', open: boolean) {
  const { transitions } = useTheme();
  return transitions.create(cssProperty, {
    easing: !open ? transitions.easing.sharp : transitions.easing.easeOut,
    duration: !open ? transitions.duration.leavingScreen : transitions.duration.enteringScreen,
  });
}

export default React.forwardRef(function App({ config }: { config: Config }, ref) {
  const inspectorDrawerOpen = useInspectorDrawerOpen();

  const marginRightTransition = useDrawerTransition('margin-right', inspectorDrawerOpen);

  const doc = useDocument();

  React.useEffect(() => {
    if (config.config) {
      resetDocument(config.config);
    }
  }, [config.config]);

  React.useImperativeHandle(
    ref,
    () => ({
      getConfig: () => doc,
    }),
    [doc]
  );

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
      <InspectorDrawer />

      <Stack
        sx={{
          marginRight: inspectorDrawerOpen ? `${INSPECTOR_DRAWER_WIDTH}px` : 0,
          transition: marginRightTransition,
          height: '100%',
        }}
      >
        <TemplatePanel config={config} />
      </Stack>
    </div>
  );
});
