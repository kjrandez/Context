ConText (working title) is an object-oriented virtual filesystem with cloud storage and version control integration, intended to facilitate data comprehension, documentation, and organization. Users can interact with the object system through a scrapbook style browser, or through any traditional desktop software running on Windows.

Anything that can be modelled by a serializable Python object can be put into the object system. Out of the box, the ConText browser provides visual rendering for Text, Ink, Image, File, Hyperlink, and Page objects, making it suitable for notekeeping.

Pages are objects that contain other objects (including other pages). Thus they can function as documents, directories, or both simultaneously. Regular files can be organized within the virtual object system without being moved on the physical filesystem. Users can maintain their existing hard drive organization.

If ConText detects that any objects are files in cloud storage, it will leverage the synchronization service so those objects are available in ConText running on other devices. If it detects any objects are in a repository, it will track the version of those objects as they are accessed.

Objects in ConText are first-class Python objects, so Python code written by users or developers can interact with them directly. The user can execute code that interacts with objects on a page or with the data stored inside them. Integration of IPython and Matplotlib will provide a SciPy-oriented script execution directly in the browser, similar to Jupyter Notebook / Google Colab.

New object types offering custom functionality can be coded as Python classes. Custom visual rendering of objects within the browser can be implemented in ES6 + React.js. More complex utilities can be implemented through back-end modules communicating with ConText via websocket.

ConText object classes must fulfill certain obligations such as encapsulating all persistent data as a JSON-serializable value, and defining all mutibility of the data through a transaction API which integrates with the system's persistence, synchronization, and version control. 

ConText instances can be shared as a notebook file. When the same notebook is opened on multiple devices, the instances can be allowed to synchronize with eachother for collaboration using a peer-to-peer mechanism. This is as opposed to hosting a collaborative editor on a public-facing web server.
