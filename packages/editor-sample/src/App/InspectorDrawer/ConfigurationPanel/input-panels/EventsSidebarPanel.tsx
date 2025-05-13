import React, { useContext, useState } from 'react';

import { MenuItem, Select } from '@mui/material';
import { EventsPropsSchema } from '@usewaypoint/block-events';
import { HtmlProps } from '@usewaypoint/block-html';

import { EventsContext } from '../../../useEventsContext';

import BaseSidebarPanel from './helpers/BaseSidebarPanel';
import MultiStylePropertyPanel from './helpers/style-inputs/MultiStylePropertyPanel';

type HtmlSidebarPanelProps = {
  data: HtmlProps;
  setData: (v: HtmlProps) => void;
};
export default function HtmlSidebarPanel({ data, setData }: HtmlSidebarPanelProps) {
  const [, setErrors] = useState<Zod.ZodError | null>(null);
  const events = useContext(EventsContext);

  const key = Object.keys(events).find((key) => events[key].html === data.props?.contents) ?? '__default__';

  const updateData = (d: unknown) => {
    console.log(d);
    const res = EventsPropsSchema.safeParse(d);
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
            props: { ...data.props, contents: events[event.target.value]?.html ?? 'Please Select' },
          })
        }
        fullWidth
        labelId="email-builder-category-label"
      >
        <MenuItem key="__default__" value="__default__">
          Please Select
        </MenuItem>
        {Object.keys(events).map((key) => (
          <MenuItem key={key} value={key}>
            {events[key].label}
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
