import React, { useCallback, useContext, useState } from 'react';

import { Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { HtmlProps, HtmlPropsSchema } from '@usewaypoint/block-html';

import { TemplatesContext } from '../../../useTemplatesContext';

import BaseSidebarPanel from './helpers/BaseSidebarPanel';
import MultiStylePropertyPanel from './helpers/style-inputs/MultiStylePropertyPanel';

type HtmlSidebarPanelProps = {
  data: HtmlProps;
  setData: (v: HtmlProps) => void;
};
export default function HtmlSidebarPanel({ data, setData }: HtmlSidebarPanelProps) {
  const [, setErrors] = useState<Zod.ZodError | null>(null);
  const templates = useContext(TemplatesContext);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('__default__');

  const updateData = useCallback(
    (d: unknown) => {
      const res = HtmlPropsSchema.safeParse(d);
      if (res.success) {
        setData(res.data);
        setErrors(null);
      } else {
        setErrors(res.error);
      }
    },
    [setData]
  );

  const handleTemplateInsert = useCallback(() => {
    const selectedTemplateObj = templates?.[selectedTemplate];
    if (selectedTemplateObj) {
      updateData({
        ...data,
        props: { ...data.props, contents: selectedTemplateObj.html },
      });
    }
  }, [selectedTemplate, templates, data, updateData]);

  const handleChange = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      const contents = ev.target.value;
      updateData({ ...data, props: { ...data.props, contents } });
    },
    [data, updateData]
  );

  return (
    <BaseSidebarPanel title="Html block" showVars>
      {templates && Object.keys(templates).length > 0 && (
        <Stack direction="row" alignItems="center" spacing={1} justifyContent="stretch">
          <FormControl fullWidth>
            <InputLabel id="email-builder-template-label">Template</InputLabel>
            <Select
              value={selectedTemplate}
              label="Template"
              onChange={(event) => setSelectedTemplate(event.target.value)}
              fullWidth
              labelId="email-builder-template-label"
            >
              <MenuItem key="__default__" value="__default__">
                Please Select
              </MenuItem>
              {Object.keys(templates).map((key) => (
                <MenuItem key={key} value={key}>
                  {templates[key].label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handleTemplateInsert}>
            Insert
          </Button>
        </Stack>
      )}

      <TextField fullWidth rows={5} multiline value={data.props?.contents ?? ''} onChange={handleChange} />
      <MultiStylePropertyPanel
        names={['color', 'backgroundColor', 'fontFamily', 'fontSize', 'textAlign', 'padding']}
        value={data.style}
        onChange={(style) => updateData({ ...data, style })}
      />
    </BaseSidebarPanel>
  );
}
