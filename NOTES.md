### BASIC FUNCTIONALITY

All basic functionality preceeds snapshot / electron.
Priority items preceed disk persistence.

Text View

- Markdown rendering
- Intuitive transition between modes

Nested Pages

- **PRIORITY** Intuitive method of navigating to a nested page
- Possible option to render only as a link (never nested)
- **PRIORITY** Indent to create nested page from selected elements

Column Pages

- **PRIORITY** Render adjacent pages as columns
- **PRIORITY** Command to separate columns
- **PRIORITY** Insert above/below/within columns

Files

- **PRIORITY** Find in Explorer
- **PRIORITY** Default open action
- **PRIORITY** Open python file through File element

Images

- Zoomed in view

Scripts

- Easy ability to append results
- **PRIORITY** Tab inside editor indents
- Code highlight

Weblinks

- Link sanitizes href
- Looks up website information in background
- Rendering of Rich Preview

Navigation between pages

- **PRIORITY** Kernel needs to send truncated model for path pages
- **PRIORITY** Open specific path based on hash url window.location.hash

History viewer w/ time travel

- **PRIORITY** Undo/redo of transactions
- **PRIORITY** Travel forward or backward until specific transaction

Misc

- Errors when dispatching an RPC need to be caught, reported
    and remote/browser need to be updated to a sanitized state
- Show modified or user-specified date at right side of header
- Nice tooltips over buttons, clips, etc.

Disk Persistence

- Mark each section of bytes with a 32-bit word indicating space & used/not-used
- Keep list of unused space starting from when the file is parsed
- Save and load as JSON
- Transactions append elements to dirty list, written out async
- Elements record their location in file

Requiring Electron

- Integrate native clipboard with internal clipboard
- Drag files in and out of external shell
    
Then,

1. Snapshot export
2. Electron window
3. Inline Matplotlib
4. Data source abstraction
5. Peer-to-peer synchronization
6. Background file tracking
7. Virtual filesystem
8. Cloud sync & Version control tracking
9. Tablet + stylus version

### BUGS

- Padding of parent page element causes glitch when dragging across edge of inner
- Header for collapsed nested pages doesn't update instantly
- Breadcrumb titles don't update when modified externally
- Recursive pages now cause stack overflow in kernel

### ANSWERS

- All pages that aren't columns should be closed by default, until manually
    opened in which case the state should be saved
- Upon indent of items, the page should be expanded
- Columns w/in columns shouldn't be allowed, render as collapsed page
- Pages which are recursive should have any iteration after the first
    instance automatically collapsed regardless of saved state

### QUESTIONS

- How should rendering options be implemented in situations where the same
    element might be rendered differently depending on its location
- How to maintain parent path information for breadcrumbs
- How to handle selections of markdown elements vs. within markdown elements
    considering the transition from text -> rendered.
- How to handle selections between contiguous text elements
- How to handle paste of multi-media content into text and other elements
