### Notes

Basic Functionality TODO:

=Browser
- Views & side-menus for:
    - Text (Markdown editor)
    - Nested Pages
    - Column Pages
    - Images, Scripts, Files, Websites
- Integration of blueprint.js visuals
- Drag + drop of items and pagesand external things
- Indent key function
- Buffer viewer w/ element preview popup
- Rendering options:
    - Page - Expand/collapse or just direct link

=Kernel
- Basic elements: Page, Text, Image, Script, File, Website
- Undo/Redo function
- Cloneability / Atomicity
- Buffer for copied items
- Persistence w/ Disk

THEN,
1. Snapshot export
2. Virtual filesystem
3. Peer-to-peer synchronization
4. Tablet + stylus version

NOTES:
- All pages that aren't columns should be closed by default, until manually
    opened in which case the state should be saved
- Upon indent of items, the page should be expanded
- Columns w/in columns shouldn't be allowed, render as collapsed page
- Pages which are recursive should have any iteration after the first
    instance automatically collapsed regardless of saved state
