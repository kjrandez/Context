import { hostname } from "os";
import WebSocket from "ws";
import { Rpc, Proxyable, Model } from "shared";

const lorem1 =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque vestibulum at erat eget suscipit. Nulla rhoncus libero sapien, id molestie nibh luctus in. Pellentesque tristique nulla sit amet eros sodales, quis luctus enim congue. Integer placerat viverra sollicitudin. In libero ligula, interdum nec pellentesque non, elementum vel dolor. Aenean ut nisl vulputate, interdum urna eget, placerat enim. Vestibulum felis turpis, elementum ac malesuada id, lacinia at justo. In laoreet mauris et nibh ullamcorper convallis. Maecenas faucibus ipsum at congue scelerisque. Aliquam sem purus, pharetra suscipit condimentum quis, imperdiet at ex. Vestibulum maximus mattis odio, sed elementum dolor feugiat eget. Aliquam consectetur, neque vitae porta dictum, ante dui posuere libero, id euismod nisi dolor at ipsum.";
const lorem2 =
    "Maecenas vitae eros non lacus tincidunt ultrices sit amet id massa. Praesent pretium ante sit amet sapien suscipit eleifend. In hac habitasse platea dictumst. Nulla erat nisi, elementum vitae tempor ut, vehicula sit amet nibh. Vestibulum cursus fermentum enim, vel mollis augue sodales ut. Suspendisse in mattis justo. In eget ipsum blandit dolor ultricies euismod. Mauris sit amet massa maximus, placerat nisi nec, dignissim ipsum. Donec sodales id lectus sit amet pulvinar. Pellentesque sodales felis fringilla ultrices tincidunt. Phasellus vehicula lorem sed felis pulvinar, id porta mi commodo.";
const lorem3 =
    "Donec imperdiet id lectus eu hendrerit. Curabitur sodales libero sit amet eros venenatis, nec venenatis lacus bibendum. Ut aliquam convallis diam vitae interdum. Maecenas laoreet tempus pretium. Suspendisse ac dui tortor. Nulla rutrum fermentum dui ut gravida. Curabitur egestas erat ut ligula fermentum convallis. Nulla maximus, eros non semper mollis, lacus nulla ullamcorper risus, eu condimentum risus tellus eu est. In ut urna pulvinar, aliquet ligula pharetra, interdum nunc. Praesent dignissim vehicula arcu, et semper dolor porta vel. Maecenas semper porta gravida. Proin tortor augue, mattis ut luctus in, semper vitae nisi. Vivamus egestas, mi mollis elementum egestas, nibh sapien euismod justo, ac cursus metus risus id ante. Nam placerat velit ac orci ullamcorper, id dapibus odio bibendum.";

class DataVoid implements Observer {
    entityCreated(inst: Entity): number {
        return 0;
    }
    transactionStarted(trans: Transaction): number {
        return 0;
    }
    transactionCancelled(trans: Transaction): void {}
    transactionCompleted(trans: Transaction): void {}
}

class DataSet implements Observer {
    root: Page;
    clipboard: Page;
    private objMap: { [_: number]: Entity };
    private nextIndex: number;
    private nextTransaction: number;

    constructor() {
        this.objMap = {};
        this.nextIndex = 0;
        this.nextTransaction = 0;

        // Cheat using global state, so we can avoid passing
        // the DataSet singleton to Entity constructors
        Entity.setObserver(this);
        Transaction.setObserver(this);

        this.root = new Page([
            new Text("Hello world"),
            new Text("How are you doing **today**?"),
            new Page([new Text("Introduction"), new Text(lorem1)]),
        ]);

        this.clipboard = new Page([]);
    }

    entityCreated(inst: Entity): number {
        const id = this.nextIndex++;
        this.objMap[id] = inst;
        return id;
    }

    transactionStarted(trans: Transaction): number {
        const id = this.nextTransaction++;
        // Do something...
        return id;
    }

    transactionCancelled(trans: Transaction): void {
        // Do something...
    }

    transactionCompleted(trans: Transaction): void {
        // Do something...
    }
}

interface Observer {
    entityCreated(inst: Entity): number;
    transactionStarted(trans: Transaction): number;
    transactionCancelled(trans: Transaction): void;
    transactionCompleted(trans: Transaction): void;
}

class Entity implements Proxyable {
    proxyableId = null;

    private static observer: Observer = new DataVoid();

    static setObserver(observer: Observer) {
        Entity.observer = observer;
    }

    id: number;

    constructor() {
        this.id = Entity.observer.entityCreated(this);
    }

    value(): any | null {
        return null;
    }

    type(): string {
        return this.constructor.name;
    }

    model(): Model<any> {
        return {
            id: this.id,
            type: this.type(),
            value: this.value(),
        };
    }
}

class Transaction {
    private static observer: Observer = new DataVoid();

    static setObserver(observer: Observer) {
        Transaction.observer = observer;
    }

    id: number;
    entity: Entity;
    others: Entity[];

    constructor(entity: Entity) {
        this.entity = entity;
        this.others = [];
        this.id = Transaction.observer.transactionStarted(this);
    }
}

interface PageEntry {
    key: number;
    element: Entity;
}

class Page extends Entity {
    private static nextKey = 100;
    private entries: PageEntry[];

    constructor(content: Entity[]) {
        super();
        this.entries = content.map((x) => Page.resolvedEntry(x));
    }

    value() {
        return {
            entries: this.entries,
            latestEntry: null,
        };
    }

    static resolvedEntry(item: Entity | PageEntry): PageEntry {
        if (item instanceof Entity)
            return {
                key: Page.nextKey++,
                element: item,
            };
        else return item;
    }
}

class Text extends Entity {
    constructor(public content: string) {
        super();
    }

    value() {
        return { content: this.content };
    }
}

class Host {
    constructor(private dataset: DataSet, private ws: WebSocket) {
        let send = (message: string) => ws.send(message);
        let hostService = {
            proxyableId: null,
            rootPage: () => dataset.root,
        };
        const rpc = new Rpc(hostService, send);

        ws.on("message", (msg) => {
            rpc.handleWebsocketReceive(JSON.parse(msg.toString()));
        });

        console.log("Connected");
    }
}

const dataset = new DataSet();
const server = new WebSocket.Server({ path: "/broadcast", port: 8085 });

server.on("connection", (ws) => {
    new Host(dataset, ws);
});
