### Notes

Basic Functionality TODO:

=Browser
- Views for:
    - Text (Markdown editor)
    - Nested Pages
    - Column Pages
- Integration of blueprint.js visuals
- Drag + drop of items and pages
- Indent key function
- Drop from external to browser
- Buffer viewer w/ element preview popup
- Rendering options:
    - Page - Expand/collapse or just direct link

=Kernel
- Complete RPC availability via console
- Undo/Redo function
- Executable block
- Cloneability / Atomicity
- Buffer for copied items
- Persistence w/ Disk

THEN,
1. Snapshot export
2. Virtual filesystem
3. Peer-to-peer synchronization

FIXES:
- Keys for multiple identical elements
- Make sure recursive pages can't cause infinite loop
    (collapsed by default)
- Complete RPC in console
- Select needs to select actual item, not all items with same key



NOTES:
- All pages that aren't columns should be closed by default, until manually
    opened in which case the state should be saved
- Upon indent of items, the page should be expanded
- Columns w/in columns shouldn't be allowed, render as collapsed page
- Pages which are recursive should have any iteration after the first
    instance automatically collapsed regardless of saved state