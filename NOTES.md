### Notes

Basic Functionality TODO:

- Text View
    - Update to use contenteditable div
    - Markdown rendering
    - Intuitive transition between modes
- Nested Pages
    - Intuitive method of navigating to a nested page
    - Possible option to render only as a link (never nested)
- Column Pages
    - Render adjacent pages as columns
    - Command to separate columns
    - Insert above/below/within columns
- Files
    - Implement file select for add menu (ELECTRON)
    - Find in Explorer
    - Default open action
    - Open python file through File element
- Images
    - Zoomed in view
- Scripts
    - Easy ability to append results
    - Tab inside editor indents
- Weblinks
    - Link sanitizes href
    - Looks up website information in background
    - Rendering of Rich Preview
- Navigation between pages
    - Kernel needs to send truncated model for path pages
    - Open specific path based on hash url window.location.hash
- Pasteboard (ELECTRON FOR CLIPBOARD INTEGRATION)
    - Implement special page as pasteboard container
    - Elements appear in pasteboard
    - Implement pasteboard buttons in action menu
    - Drag and drop in and out of pasteboard
    - Implement cloneability vs atomicity
- History viewer w/ time travel
    - Undo/redo of transactions
    - Travel forward or backward until specific transaction
- Keyboard shortcuts
    - Indent creates page out of selected elements
    - shift-click follow page, ctrl-click follow in new tab
- Disk Persistence
    - Start with ever growing list of data
    - Break into sectors with byte indicating used/available space (?)
    - Save and load as JSON
    - Transactions append elements to dirty list, written out async
    - Elements record their location in file
- Misc
    - Errors when dispatching an RPC need to be caught, reported
        and remote/browser need to be updated to a sanitized state
    - Indent-dedent and pasteboard options for multiple selections
    
=Bugs
- Padding of parent page element causes glitch when dragging across edge of inner
- Header for collapsed nested pages doesn't update instantly
- Breadcrumb titles don't update when modified externally
- Recursive pages now cause stack overflow in kernel

THEN,
1. Snapshot export
2. Electron window + External D&D
3. Inline Matplotlib
4. Data source abstraction
5. Peer-to-peer synchronization
6. Background file tracking
7. Virtual filesystem
8. Cloud sync & Version control tracking
9. Tablet + stylus version

ANSWERS:
- All pages that aren't columns should be closed by default, until manually
    opened in which case the state should be saved
- Upon indent of items, the page should be expanded
- Columns w/in columns shouldn't be allowed, render as collapsed page
- Pages which are recursive should have any iteration after the first
    instance automatically collapsed regardless of saved state

QUESTIONS:
- How should rendering options be implemented in situations where the same
    element might be rendered differently depending on its location
- How to maintain parent path information for breadcrumbs
- How to handle selections of markdown elements vs. within markdown elements
    considering the transition from text -> rendered.
- How to handle selections between contiguous text elements
- How to handle paste of multi-media content into text and other elemnets