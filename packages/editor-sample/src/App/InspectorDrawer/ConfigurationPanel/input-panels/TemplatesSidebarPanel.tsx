import React, { useContext, useState } from 'react';

import { MenuItem, Select } from '@mui/material';
import { TemplatesProps, TemplatesPropsSchema } from '@usewaypoint/block-templates';

import { TemplatesContext } from '../../../useTemplatesContext';

import BaseSidebarPanel from './helpers/BaseSidebarPanel';
import MultiStylePropertyPanel from './helpers/style-inputs/MultiStylePropertyPanel';

type TemplatesSidebarPanelProps = {
  data: TemplatesProps;
  setData: (v: TemplatesProps) => void;
};
export default function TemplatesSidebarPanel({ data, setData }: TemplatesSidebarPanelProps) {
  const [, setErrors] = useState<Zod.ZodError | null>(null);
  const templates = useContext(TemplatesContext) ?? {};

  const key = Object.keys(templates).find((key) => templates[key].html === data.props?.contents) ?? '__default__';

  const updateData = (d: unknown) => {
    console.log(d);
    const res = TemplatesPropsSchema.safeParse(d);
    if (res.success) {
      setData(res.data);
      setErrors(null);
    } else {
      setErrors(res.error);
    }
  };

  return (
    <BaseSidebarPanel title="Template block">
      <Select
        value={key}
        label="Template"
        onChange={(event) =>
          updateData({
            ...data,
            props: { ...data.props, contents: templates[event.target.value]?.html ?? 'Please Select' },
          })
        }
        fullWidth
        labelId="email-builder-category-label"
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
      <MultiStylePropertyPanel
        names={['color', 'backgroundColor', 'fontFamily', 'fontSize', 'textAlign', 'padding']}
        value={data.style}
        onChange={(style) => updateData({ ...data, style })}
      />
    </BaseSidebarPanel>
  );
}
