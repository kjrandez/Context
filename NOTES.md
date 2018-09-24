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

NOTES:
- All pages that aren't columns should be closed by default, until manually
    opened in which case the state should be saved
- Upon indent of items, the page should be expanded
- Columns w/in columns shouldn't be allowed, render as collapsed page
- Pages which are recursive should have any iteration after the first
    instance automatically collapsed regardless of saved state

TEXT
annotation
align-left
align-justify
text-highlight
paragraph
menu
list
new-text-box ***

PAGE
document ***

sCRIPT
function ***
console

IMAGE
media ***

WEB
link ***

DISKFILE (Don't use)
floppy-disk
document-open
document-share
cloud

INK
draw ***

