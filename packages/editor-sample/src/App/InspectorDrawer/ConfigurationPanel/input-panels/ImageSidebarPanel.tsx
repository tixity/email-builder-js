import React, { useContext, useEffect, useState } from 'react';

import {
  VerticalAlignBottomOutlined,
  VerticalAlignCenterOutlined,
  VerticalAlignTopOutlined,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import CachedOutlined from '@mui/icons-material/CachedOutlined';
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined';
import DriveFileRenameOutlineOutlined from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import { ImageProps, ImagePropsSchema } from '@usewaypoint/block-image';

import { MediaContext } from '../../../useMediaContext';
import { MediaAsset, MediaRoot } from '../../../../main';

import BaseSidebarPanel from './helpers/BaseSidebarPanel';
import RadioGroupInput from './helpers/inputs/RadioGroupInput';
import TextDimensionInput from './helpers/inputs/TextDimensionInput';
import TextInput from './helpers/inputs/TextInput';
import MultiStylePropertyPanel from './helpers/style-inputs/MultiStylePropertyPanel';

type ImageSidebarPanelProps = {
  data: ImageProps;
  setData: (v: ImageProps) => void;
};
export default function ImageSidebarPanel({ data, setData }: ImageSidebarPanelProps) {
  const [, setErrors] = useState<Zod.ZodError | null>(null);
  const media = useContext(MediaContext);

  const [libraryOpen, setLibraryOpen] = useState(false);
  const [roots, setRoots] = useState<MediaRoot[]>([]);
  const [currentRoot, setCurrentRoot] = useState('');
  const [files, setFiles] = useState<MediaAsset[]>([]);
  const [librarySearch, setLibrarySearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Styled replacements for window.alert / confirm / prompt (this is a generic
  // MUI app — no host dialog helpers to rely on).
  const [snack, setSnack] = useState<string | null>(null);
  const notify = (msg: string) => setSnack(msg);

  const [confirmDlg, setConfirmDlg] = useState<{
    title: string;
    message: string;
    danger: boolean;
    resolve: (ok: boolean) => void;
  } | null>(null);
  const askConfirm = (title: string, message: string, danger = false) =>
    new Promise<boolean>((resolve) => setConfirmDlg({ title, message, danger, resolve }));

  const [promptDlg, setPromptDlg] = useState<{ title: string; label: string; resolve: (v: string | null) => void } | null>(
    null
  );
  const [promptVal, setPromptVal] = useState('');
  const askPrompt = (title: string, label: string, value: string) => {
    setPromptVal(value);
    return new Promise<string | null>((resolve) => setPromptDlg({ title, label, resolve }));
  };

  const currentAccess = roots.find((r) => r.key === currentRoot)?.access ?? 'ro';

  const updateData = (d: unknown) => {
    const res = ImagePropsSchema.safeParse(d);
    if (res.success) {
      setData(res.data);
      setErrors(null);
    } else {
      setErrors(res.error);
    }
  };

  const setUrl = (url: string) => updateData({ ...data, props: { ...data.props, url } });

  // Sidebar quick-upload always targets the default read-write root.
  const onUpload = async (file: File | undefined) => {
    if (!file || !media || busy) return;
    setBusy(true);
    try {
      const asset = await media.upload(file, 'media');
      setUrl(asset.url);
    } catch (e) {
      notify('Upload failed: ' + (e instanceof Error ? e.message : 'error'));
    } finally {
      setBusy(false);
    }
  };

  const loadRoot = async (root?: string) => {
    if (!media) return;
    try {
      const res = await media.list(root);
      setRoots(res.roots);
      setCurrentRoot(res.root);
      setFiles(res.files);
    } catch (e) {
      notify('Could not load media library: ' + (e instanceof Error ? e.message : 'error'));
      setFiles([]);
    }
  };

  const openLibrary = async () => {
    if (!media) return;
    setLibrarySearch('');
    setLibraryOpen(true);
    await loadRoot();
  };

  // Upload a batch serially, then refresh the list once, so the busy state and
  // the grid reflect the whole batch (not just the first upload to finish).
  const uploadFilesToCurrentRoot = async (list: File[]) => {
    if (!media || list.length === 0 || busy) return;
    setBusy(true);
    try {
      for (const file of list) {
        try {
          await media.upload(file, currentRoot);
        } catch (e) {
          notify('Upload failed: ' + (e instanceof Error ? e.message : 'error'));
        }
      }
      await loadRoot(currentRoot);
    } finally {
      setBusy(false);
    }
  };

  const replaceAsset = async (name: string, file: File | undefined) => {
    if (!file || !media || busy) return;
    setBusy(true);
    try {
      await media.replace(name, file, currentRoot);
      await loadRoot(currentRoot);
    } catch (e) {
      notify('Replace failed: ' + (e instanceof Error ? e.message : 'error'));
    } finally {
      setBusy(false);
    }
  };

  // Look up how many templates reference a file, for a warning before a
  // rename/delete that would change or drop its URL.
  const usageSuffix = async (name: string) => {
    if (!media?.usage) return '';
    try {
      const u = await media.usage(name, currentRoot);
      if (!u || u.count < 1) return '';
      const listed = u.names.slice(0, 5).join(', ') + (u.names.length > 5 ? '…' : '');
      return `\n\nIt is used in ${u.count} template(s): ${listed}.\nThis will break those references.`;
    } catch {
      return '';
    }
  };

  // `busy` is held across the whole prompt/confirm flow (and the row buttons are
  // disabled while it is), so only one dialog request can be pending at a time —
  // a second click can't clobber the single-slot confirm/prompt state.
  const renameAsset = async (name: string) => {
    if (!media || busy) return;
    setBusy(true);
    try {
      const next = await askPrompt('Rename image', 'New name', name);
      if (!next || next === name) return;
      const warn = await usageSuffix(name);
      if (warn && !(await askConfirm('Rename image', `Rename "${name}"?${warn}`, true))) return;
      await media.rename(name, next, currentRoot);
      await loadRoot(currentRoot);
    } catch (e) {
      notify('Rename failed: ' + (e instanceof Error ? e.message : 'error'));
    } finally {
      setBusy(false);
    }
  };

  const removeAsset = async (name: string) => {
    if (!media || busy) return;
    setBusy(true);
    try {
      const warn = await usageSuffix(name);
      if (!(await askConfirm('Delete image', `Delete "${name}"? This cannot be undone.${warn}`, true))) return;
      await media.delete(name, currentRoot);
      await loadRoot(currentRoot);
    } catch (e) {
      notify('Delete failed: ' + (e instanceof Error ? e.message : 'error'));
    } finally {
      setBusy(false);
    }
  };

  const filteredFiles = files.filter((a) =>
    a.name.toLowerCase().includes(librarySearch.trim().toLowerCase())
  );

  // Paste an image (e.g. a screenshot) straight into the open library.
  // Disabled while a confirm/prompt dialog is up, so a paste can't upload behind it.
  useEffect(() => {
    if (!libraryOpen || currentAccess !== 'rw' || confirmDlg !== null || promptDlg !== null) return;
    const onPaste = (e: ClipboardEvent) => {
      const imgs = Array.from(e.clipboardData?.items ?? [])
        .filter((it) => it.kind === 'file' && it.type.startsWith('image/'))
        .map((it) => it.getAsFile())
        .filter((f): f is File => f !== null);
      if (imgs.length) {
        e.preventDefault();
        uploadFilesToCurrentRoot(imgs);
      }
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [libraryOpen, currentAccess, currentRoot, confirmDlg, promptDlg]);

  return (
    <BaseSidebarPanel title="Image block" showVars>
      {media && (
        <Stack direction="row" spacing={1}>
          <Button component="label" size="small" variant="outlined" disabled={busy}>
            {busy ? 'Uploading…' : 'Upload'}
            <input
              type="file"
              hidden
              accept="image/png,image/jpeg,image/gif,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                onUpload(file);
              }}
            />
          </Button>
          <Button size="small" variant="outlined" onClick={openLibrary}>
            Browse library
          </Button>
        </Stack>
      )}

      <TextInput
        label="Source URL"
        defaultValue={data.props?.url ?? ''}
        onChange={(v) => {
          const url = v.trim().length === 0 ? null : v.trim();
          updateData({ ...data, props: { ...data.props, url } });
        }}
      />

      <TextInput
        label="Alt text"
        defaultValue={data.props?.alt ?? ''}
        onChange={(alt) => updateData({ ...data, props: { ...data.props, alt } })}
      />
      <TextInput
        label="Click through URL"
        defaultValue={data.props?.linkHref ?? ''}
        onChange={(v) => {
          const linkHref = v.trim().length === 0 ? null : v.trim();
          updateData({ ...data, props: { ...data.props, linkHref } });
        }}
      />
      <Stack direction="row" spacing={2}>
        <TextDimensionInput
          label="Width"
          defaultValue={data.props?.width}
          onChange={(width) => updateData({ ...data, props: { ...data.props, width } })}
        />
        <TextDimensionInput
          label="Height"
          defaultValue={data.props?.height}
          onChange={(height) => updateData({ ...data, props: { ...data.props, height } })}
        />
      </Stack>

      <RadioGroupInput
        label="Alignment"
        defaultValue={data.props?.contentAlignment ?? 'middle'}
        onChange={(contentAlignment) => updateData({ ...data, props: { ...data.props, contentAlignment } })}
      >
        <ToggleButton value="top">
          <VerticalAlignTopOutlined fontSize="small" />
        </ToggleButton>
        <ToggleButton value="middle">
          <VerticalAlignCenterOutlined fontSize="small" />
        </ToggleButton>
        <ToggleButton value="bottom">
          <VerticalAlignBottomOutlined fontSize="small" />
        </ToggleButton>
      </RadioGroupInput>

      <MultiStylePropertyPanel
        names={['backgroundColor', 'textAlign', 'padding']}
        value={data.style}
        onChange={(style) => updateData({ ...data, style })}
      />

      <Dialog
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        PaperProps={{ sx: { width: '90vw', maxWidth: '90vw', height: '90vh', maxHeight: '90vh' } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Media library
          <IconButton aria-label="Close" onClick={() => setLibraryOpen(false)}>
            <CloseOutlined />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box
            onDragOver={
              currentAccess === 'rw'
                ? (e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }
                : undefined
            }
            onDragLeave={currentAccess === 'rw' ? () => setDragOver(false) : undefined}
            onDrop={
              currentAccess === 'rw'
                ? (e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const imgs = Array.from(e.dataTransfer?.files ?? []).filter((f) => f.type.startsWith('image/'));
                    if (imgs.length) uploadFilesToCurrentRoot(imgs);
                  }
                : undefined
            }
            sx={{
              maxWidth: 1100,
              mx: 'auto',
              width: '100%',
              flex: 1,
              minHeight: 0,
              pt: 1,
              borderRadius: 1,
              outline: dragOver ? '2px dashed' : '2px dashed transparent',
              outlineColor: dragOver ? 'primary.main' : 'transparent',
              outlineOffset: -4,
              transition: 'outline-color .12s',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
              {roots.length > 1 && (
                <ToggleButtonGroup
                  size="small"
                  exclusive
                  value={currentRoot}
                  onChange={(_, val) => {
                    if (val) loadRoot(val);
                  }}
                >
                  {roots.map((r) => (
                    <ToggleButton key={r.key} value={r.key} sx={{ textTransform: 'none' }}>
                      {r.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              )}
              <Box sx={{ flex: 1 }} />
              {currentAccess === 'rw' && (
                <Button component="label" size="small" variant="contained" disabled={busy}>
                  {busy ? 'Uploading…' : 'Upload image'}
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/png,image/jpeg,image/gif,image/webp"
                    onChange={(e) => {
                      const list = Array.from(e.target.files ?? []);
                      e.target.value = '';
                      uploadFilesToCurrentRoot(list);
                    }}
                  />
                </Button>
              )}
            </Stack>

            <TextField
              fullWidth
              size="small"
              placeholder="Search images"
              value={librarySearch}
              onChange={(e) => setLibrarySearch(e.target.value)}
              sx={{ mb: 2 }}
            />

            {filteredFiles.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                {files.length === 0 ? 'No images here yet.' : 'No images match your search.'}
              </Typography>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: 1.5,
                }}
              >
                {filteredFiles.map((a) => (
                  <Box
                    key={a.name}
                    onClick={() => {
                      setUrl(a.url);
                      setLibraryOpen(false);
                    }}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'border-color .12s',
                      '&:hover': { borderColor: 'primary.main' },
                    }}
                  >
                    <Box
                      sx={{
                        height: 110,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.100',
                      }}
                    >
                      <img
                        src={a.thumbUrl}
                        alt={a.name}
                        loading="lazy"
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, minWidth: 0 }}>
                      <Typography variant="caption" noWrap title={a.name} sx={{ flex: 1, minWidth: 0 }}>
                        {a.name}
                      </Typography>
                      {currentAccess === 'rw' && (
                        <IconButton
                          size="small"
                          component="label"
                          disabled={busy}
                          aria-label="Replace image"
                          title="Replace (keeps the same URL)"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <CachedOutlined fontSize="small" />
                          <input
                            type="file"
                            hidden
                            accept="image/png,image/jpeg,image/gif,image/webp"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              e.target.value = '';
                              replaceAsset(a.name, f);
                            }}
                          />
                        </IconButton>
                      )}
                      {currentAccess === 'rw' && (
                        <IconButton
                          size="small"
                          disabled={busy}
                          aria-label="Rename image"
                          onClick={(e) => {
                            e.stopPropagation();
                            renameAsset(a.name);
                          }}
                        >
                          <DriveFileRenameOutlineOutlined fontSize="small" />
                        </IconButton>
                      )}
                      {currentAccess === 'rw' && (
                        <IconButton
                          size="small"
                          disabled={busy}
                          aria-label="Delete image"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeAsset(a.name);
                          }}
                        >
                          <DeleteOutlineOutlined fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDlg !== null} onClose={() => { confirmDlg?.resolve(false); setConfirmDlg(null); }}>
        <DialogTitle>{confirmDlg?.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
            {confirmDlg?.message}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { confirmDlg?.resolve(false); setConfirmDlg(null); }}>Cancel</Button>
          <Button
            variant="contained"
            color={confirmDlg?.danger ? 'error' : 'primary'}
            onClick={() => { confirmDlg?.resolve(true); setConfirmDlg(null); }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={promptDlg !== null}
        onClose={() => { promptDlg?.resolve(null); setPromptDlg(null); }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>{promptDlg?.title}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label={promptDlg?.label}
            value={promptVal}
            onChange={(e) => setPromptVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                promptDlg?.resolve(promptVal.trim() || null);
                setPromptDlg(null);
              }
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { promptDlg?.resolve(null); setPromptDlg(null); }}>Cancel</Button>
          <Button variant="contained" onClick={() => { promptDlg?.resolve(promptVal.trim() || null); setPromptDlg(null); }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack !== null}
        autoHideDuration={5000}
        onClose={() => setSnack(null)}
        message={snack ?? ''}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </BaseSidebarPanel>
  );
}
