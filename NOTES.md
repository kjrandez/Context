### Notes

Top-level = opened notebook...
Each client has a certain page that it's centered on.
Kernel needs to maintain a list of pages that are in focus by clients.

When an element is mutated, need to know whether that elementis under a focused page
If so, need to propagate change or the whole modified page to the client(s).

How to know whether an element is under a focused page? Is it possible without letting
the element know who it's parents are?

Want to avoid elements knowing their parents, forming an access-controlled sandbox

Especially because elements can have multiple parent nodes.

Maybe each page generates a sensitivity list?