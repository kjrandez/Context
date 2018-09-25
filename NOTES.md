### Notes

Basic Functionality TODO:

=Browser
- Views & side-menus for:
    - Text (Markdown editor)
    - Nested Pages & Column Pages
    - Files, Images, Scripts, Weblinks
- Integration of blueprint.js visuals
- Navigation between pages
- Drag + drop of items and pagesand external things
- Indent key function
- Buffer viewer w/ element preview popup
- History viewer w/ time travel


=Kernel
- Basic elements: Page, Text->Script, Website, File->Image
- Undo/Redo function
- Cloneability / Atomicity
- Buffer for copied items
- Persistence w/ Disk

=Bugs
- Sensitivity list not being updated when new elements added to hierarchy
- Padding of parent page element causes glitch when dragging across edge of inner

THEN,
1. Snapshot export
2. Dedicated CEF browser window
3. Inline Matplotlib
4. Data source vs. type differentiation
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