import React from 'react';

import { Button } from '@mui/material';

import { resetDocument } from '../../documents/editor/EditorContext';
import type { TEditorConfiguration } from '../../documents/editor/core';

export default function SidebarButton({
  config,
  children,
}: {
  config: TEditorConfiguration;
  children: JSX.Element | string;
}) {
  const handleClick = () => {
    resetDocument(config);
  };
  return (
    <Button size="small" onClick={handleClick}>
      {children}
    </Button>
  );
}
