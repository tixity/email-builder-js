import React, { useContext } from 'react';

import { Box, Menu } from '@mui/material';

import { TemplatesContext } from '../../../../../App/useTemplatesContext';
import { TEditorBlock } from '../../../../editor/core';

import BlockButton from './BlockButton';
import { BUTTONS } from './buttons';

type BlocksMenuProps = {
  anchorEl: HTMLElement | null;
  setAnchorEl: (v: HTMLElement | null) => void;
  onSelect: (block: TEditorBlock) => void;
};
export default function BlocksMenu({ anchorEl, setAnchorEl, onSelect }: BlocksMenuProps) {
  const templates = useContext(TemplatesContext) ?? {};

  const buttons = [...BUTTONS];

  if (Object.keys(templates).length === 0) {
    buttons.splice(
      buttons.findIndex((b) => b.label === 'Templates'),
      1
    );
  }

  const onClose = () => {
    setAnchorEl(null);
  };

  const onClick = (block: TEditorBlock) => {
    onSelect(block);
    setAnchorEl(null);
  };

  if (anchorEl === null) {
    return null;
  }

  return (
    <Menu
      open
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Box sx={{ p: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
        {buttons.map((k, i) => (
          <BlockButton key={i} label={k.label} icon={k.icon} onClick={() => onClick(k.block())} />
        ))}
      </Box>
    </Menu>
  );
}
