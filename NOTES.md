### BASIC FUNCTIONALITY

All basic functionality preceeds snapshot / electron.
Priority items preceed disk persistence.

Text View

- Markdown rendering
- Intuitive transition between modes

Nested Pages

- Possible option to render only as a link (never nested)

Images

- Zoomed in view

Scripts

- Easy ability to append results
- Code highlight

Weblinks

- Link sanitizes href
- Looks up website information in background
- Rendering of Rich Preview

History viewer w/ time travel

- **PRIORITY** Undo/redo of transactions
- **PRIORITY** Travel forward or backward until specific transaction

Misc

- **PRIORITY** Re-examine function of store. Elements might just load value
from model directly via websocket, rather than keeping a full copy of the model in
local memory for each render tab. Then, sensitivity list is just trivially, whichever
components are currently mounted. No need to pay attention to which elements you need
to send models for, the browser just asks when it needs them. Trade-off network pipe usage
instead of repeated copies of dataset in memory. Eliminates possible bugs with state
incoherence. Experiment with effects of increased latency. UI blocks on websocket.

- Errors when dispatching an RPC need to be caught, reported
    and remote/browser need to be updated to a sanitized state
- Show modified or user-specified date at right side of header
- Nice tooltips over buttons, clips, etc.
- Implement columnization of many elements

Disk Persistence

- Mark each section of bytes with a 32-bit word indicating space & used/not-used
- Keep list of unused space starting from when the file is parsed
- Save and load as JSON
- Transactions append elements to dirty list, written out async
- Elements record their location in file

Requiring CEF/Electron

- Integrate native clipboard with internal clipboard
- Drag files in and out of external shell
    
### THEN,

1. Snapshot export
2. CEF/Electron window
3. Inline Matplotlib
4. Data source abstraction
5. Peer-to-peer synchronization
6. Background file tracking
7. Virtual filesystem
8. Cloud sync & Version control tracking
9. Tablet + stylus version

### BUGS

- Padding of parent page element causes glitch when dragging across edge of inner
- Breadcrumb titles don't update when modified externally
- Elements don't require second click in order to start dragging
- Elements on page not connected after navigation to subpage and then back again.

### ANSWERS

- Normally pages should start collapsed, but expanded state is saved between sessions (snapshots need to save that state also, probably needing a separate mechanism)
- Upon indent of items, the created page should be expanded
- Columns within columns shouldn't be allowed
- Pages which are recursive are just rendered as links only
- Pages display as nested by default unless recursive... (alt/ctrl-click to follow)
- Meta settings to display as link only (single/ctrl-click to follow)
- Selections should be sorted into original order before indent/unindent
- Display-related meta information needs to be associated with page entry, not with element itself
- Parent path information also needs to include keys for rare situations where, un-indent has an ambiguous placement location in the grandparent
- Elements should just set opacity to 0 and disable drop in order to avoid jerking around on lift

### QUESTIONS

- How to make the transition between rendered and markdown most seamless and intuitive?
- How to handle selection of text between contiguous contenteditable divs (especially considering rendering state might transition)
- How to handle paste of multi-media content into text and other elements
- How should columns be implemented, especially since adjacent files should be columnized, but without placing them into separate pages.
- How to allow multiple selected elements to be dragged and dropped
