import React from 'react';

import {
  CodeOutlined,
  DataObjectOutlined,
  EditOutlined,
  MonitorOutlined,
  PhoneIphoneOutlined,
  PreviewOutlined,
  SaveOutlined,
} from '@mui/icons-material';
import { Box, IconButton, Stack, SxProps, TextField, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { Reader } from '@usewaypoint/email-builder';

import EditorBlock from '../../documents/editor/EditorBlock';
import {
  setSelectedMainTab,
  setSelectedScreenSize,
  useDocument,
  useSelectedMainTab,
  useSelectedScreenSize,
} from '../../documents/editor/EditorContext';
import { Config } from '../../main';
import ToggleInspectorPanelButton from '../InspectorDrawer/ToggleInspectorPanelButton';

import DownloadJson from './DownloadJson';
import HtmlPanel from './HtmlPanel';
import ImportJson from './ImportJson';
import JsonPanel from './JsonPanel';

export default function TemplatePanel({ config }: { config: Config }) {
  const document = useDocument();
  const selectedMainTab = useSelectedMainTab();
  const selectedScreenSize = useSelectedScreenSize();
  const [name, setName] = React.useState(config.name);

  let mainBoxSx: SxProps = {
    height: '100%',
  };
  if (selectedScreenSize === 'mobile') {
    mainBoxSx = {
      ...mainBoxSx,
      margin: '32px auto',
      width: 370,
      height: 800,
      boxShadow:
        'rgba(33, 36, 67, 0.04) 0px 10px 20px, rgba(33, 36, 67, 0.04) 0px 2px 6px, rgba(33, 36, 67, 0.04) 0px 0px 1px',
    };
  }

  const handleScreenSizeChange = (_: unknown, value: unknown) => {
    switch (value) {
      case 'mobile':
      case 'desktop':
        setSelectedScreenSize(value);
        return;
      default:
        setSelectedScreenSize('desktop');
    }
  };

  const handleMainTabChange = (_: unknown, value: unknown) => {
    switch (value) {
      case 'preview':
      case 'editor':
      case 'json':
      case 'html':
        setSelectedMainTab(value);
        return;
      default:
        setSelectedMainTab('editor');
    }
  };

  const renderMainPanel = () => {
    switch (selectedMainTab) {
      case 'editor':
        return (
          <Box sx={mainBoxSx}>
            <EditorBlock id="root" />
          </Box>
        );
      case 'preview':
        return (
          <Box sx={mainBoxSx}>
            <Reader document={document} rootBlockId="root" />
          </Box>
        );
      case 'html':
        return import.meta.env.DEV ? <HtmlPanel /> : null;
      case 'json':
        return <JsonPanel />;
      // return import.meta.env.DEV ? <JsonPanel /> : null;
    }
  };

  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>();
  const [savedRecently, setSavedRecently] = React.useState(false);
  const handleSave = async () => {
    setSaving(true);
    try {
      await config.onSave({ name, id: config.id, config: document });
      setSavedRecently(true);
      setSaveError(null);
      setTimeout(() => setSavedRecently(false), 2000);
    } catch (e) {
      setSaveError('Failed to save');
      console.log(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack
        sx={{
          height: 49,
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 'appBar',
          px: 1,
        }}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Stack direction="row" spacing={2} alignItems={'center'} sx={{ whiteSpace: 'nowrap' }}>
          <TextField
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            variant="outlined"
            inputProps={{ style: { paddingBlock: 4, fontSize: 16 } }}
          />
        </Stack>
        <Stack px={2} direction="row" gap={2} width="100%" justifyContent="space-between" alignItems="center">
          <Stack direction="row">
            <Tooltip title="Save">
              <IconButton onClick={handleSave}>
                <SaveOutlined />
              </IconButton>
            </Tooltip>
            {saveError && (
              <Stack direction="row" alignItems="center" style={{ color: 'red' }}>
                {saveError}
              </Stack>
            )}
            <Stack
              direction="row"
              alignItems="center"
              style={{ opacity: savedRecently || saving ? 1 : 0, transition: 'opacity 0.5s ease-in-out' }}
            >
              {saving ? 'Saving...' : 'Saved'}
            </Stack>
          </Stack>
          <Stack direction="row" spacing={2}>
            <ToggleButtonGroup value={selectedMainTab} exclusive size="small" onChange={handleMainTabChange}>
              <ToggleButton value="editor">
                <Tooltip title="Edit">
                  <EditOutlined fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="preview">
                <Tooltip title="Preview">
                  <PreviewOutlined fontSize="small" />
                </Tooltip>
              </ToggleButton>
              {import.meta.env.DEV && (
                <ToggleButton value="html">
                  <Tooltip title="HTML output">
                    <CodeOutlined fontSize="small" />
                  </Tooltip>
                </ToggleButton>
              )}
              {/* {import.meta.env.DEV && ( */}
              <ToggleButton value="json">
                <Tooltip title="JSON output">
                  <DataObjectOutlined fontSize="small" />
                </Tooltip>
              </ToggleButton>
              {/* )} */}
            </ToggleButtonGroup>
            <DownloadJson />
            <ImportJson />
            <ToggleButtonGroup value={selectedScreenSize} exclusive size="small" onChange={handleScreenSizeChange}>
              <ToggleButton value="desktop">
                <Tooltip title="Desktop view">
                  <MonitorOutlined fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="mobile">
                <Tooltip title="Mobile view">
                  <PhoneIphoneOutlined fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
            {/* <ShareButton /> */}
          </Stack>
        </Stack>
        <ToggleInspectorPanelButton />
      </Stack>
      <Box sx={{ height: 'calc(100% - 49px)', overflow: 'auto', minWidth: 370 }}>{renderMainPanel()}</Box>
    </>
  );
}
