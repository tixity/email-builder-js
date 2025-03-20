import React, { useCallback, useContext } from 'react';

import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, Typography } from '@mui/material';
import { VarContext } from '../../../../useVarContext';

type SidebarPanelProps = {
  title: string;
  children: React.ReactNode;
  showVars?: boolean;
};

function setReactControlledValue(
  el: HTMLInputElement | HTMLTextAreaElement,
  newValue: string,
  position: number,
  length: number = 0
) {
  const prototype = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const { set: valueSetter } = Object.getOwnPropertyDescriptor(prototype, 'value')!;

  valueSetter!.call(el, newValue);
  el.dispatchEvent(new Event('input', { bubbles: true }));

  setTimeout(() => {
    el.focus();

    if (el.setSelectionRange) {
      el.setSelectionRange(position, position + length);
    }
  }, 0);
}

export default function BaseSidebarPanel({ title, children, showVars }: SidebarPanelProps) {
  const vars = useContext(VarContext);
  const [category, setCategory] = React.useState<string>(vars ? Object.keys(vars)[0] : '');

  const currentVars = category && vars ? vars[category] : undefined;

  const handleChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      setCategory(event.target.value);
    },
    [setCategory]
  );

  const insertText = useCallback((key: string) => {
    key = `{$${key}}`;
    if (currentFocus) {
      const newValue =
        currentFocus.value.slice(0, currentSelectionStart) + key + currentFocus.value.slice(currentSelectionEnd);
      setReactControlledValue(currentFocus, newValue, currentSelectionStart, key.length);
    }
  }, []);

  let currentFocus: any = null;
  let currentSelectionStart: any = null;
  let currentSelectionEnd: any = null;

  const saveFocus = useCallback(() => {
    if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
      currentFocus = document.activeElement;
      currentSelectionStart = (currentFocus as HTMLInputElement).selectionStart;
      currentSelectionEnd = (currentFocus as HTMLInputElement).selectionEnd;
    }
  }, []);

  return (
    <Box>
      {!!vars && showVars && (
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          justifyContent="stretch"
          sx={{
            p: 2,
            pb: 1,
            position: 'sticky',
            top: 0,
            background: 'white',
            zIndex: 100,
            borderBottom: '1px solid #eee',
          }}
        >
          <FormControl fullWidth>
            <InputLabel id="email-builder-category-label">Category</InputLabel>
            <Select
              value={category}
              label="Category"
              onChange={handleChange}
              fullWidth
              labelId="email-builder-category-label"
              onMouseDownCapture={saveFocus}
            >
              {Object.keys(vars).map((key) => (
                <MenuItem key={key} value={key}>
                  {key}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="email-builder-variable-label">Variable</InputLabel>
            <Select
              multiline
              fullWidth
              labelId="email-builder-variable-label"
              label="Variable"
              onMouseDownCapture={saveFocus}
            >
              {currentVars &&
                currentVars.map((key) => (
                  <MenuItem key={key} value={key} onClick={() => insertText(key)}>
                    {key}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Stack>
      )}

      <Box sx={{ p: 2 }}>
        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          {title}
        </Typography>
        <Stack spacing={5} mb={3}>
          {children}
        </Stack>
      </Box>
    </Box>
  );
}
