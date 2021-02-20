import { Proxyable, Model } from "shared";

export interface Observer {
    entityCreated(inst: Entity): number;
    transactionStarted(trans: Transaction): number;
    transactionCancelled(trans: Transaction): void;
    transactionCompleted(trans: Transaction): void;
}

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

interface AgentCallbacks {
    startTrans: () => Transaction;
    cancelTrans: (trans: Transaction) => void;
    completeTrans: (trans: Transaction) => void;
}

export class Entity extends Proxyable {
    proxyableId: number | null = null;

    private static observer: Observer = new DataVoid();

    static setObserver(observer: Observer) {
        Entity.observer = observer;
    }

    private _id: number;
    private agent: Agent;

    constructor(private presentation: Presentation, private backing: Backing) {
        super();

        this._id = Entity.observer.entityCreated(this);

        let callbacks = {
            startTrans: () => new Transaction(this),
            cancelTrans: (trans: Transaction) =>
                Entity.observer.transactionCancelled(trans),
            completeTrans: (trans: Transaction) =>
                Entity.observer.transactionCompleted(trans)
        };

        this.agent = buildAgent(presentation, backing, callbacks);
    }

    resolveTarget(selector: string) {
        if (selector in this) return this;
        else return this.agent;
    }

    id(): number {
        return this._id;
    }

    type(): string {
        return Presentation[this.presentation];
    }

    model(): Model<ModelValue> {
        return {
            id: this.id(),
            type: this.type(),
            value: this.agent.value()
        };
    }
}

export enum Presentation {
    Text,
    Script,
    Page,
    File,
    Image
}

export class DiskFile {
    constructor(public path: string) {}
}

interface ModelValue {}

type Backing = DiskFile | ModelValue;

export class PageValue {
    constructor(public entries: PageEntry[]) {}
}

export class TextValue {
    constructor(public content: string) {}
}

export class FileValue {
    constructor(public filename: string) {}
}

function buildAgent(
    presentation: Presentation,
    backing: Backing,
    cb: AgentCallbacks
) {
    switch (presentation) {
        case Presentation.Text: // Same backing and agent as Text
        case Presentation.Script:
            if (backing instanceof TextValue)
                return new TextInternalAgent(cb, backing);
            break;
        case Presentation.Page:
            if (backing instanceof PageValue)
                return new PageInternalAgent(cb, backing);
            break;
        case Presentation.Image: // Same backing and agent as File
        case Presentation.File:
            if (backing instanceof DiskFile) return new FileAgent(cb, backing);
            break;
    }

    throw new Error("No suitable agent.");
}

abstract class Agent {
    protected cb: AgentCallbacks;

    constructor(cb: AgentCallbacks) {
        this.cb = cb;
    }

    abstract value(): ModelValue;
}

export interface PageEntry {
    key: number;
    element: Entity;
}

class PageInternalAgent extends Agent {
    private nextKey: number;

    constructor(cb: AgentCallbacks, private backing: PageValue) {
        super(cb);

        this.nextKey = 0;
        backing.entries.forEach((entry: PageEntry) => {
            if (entry.key >= this.nextKey) this.nextKey = entry.key + 1;
        });
    }

    value() {
        return this.backing;
    }

    append(inst: Entity) {
        const trans = this.cb.startTrans();
        trans.reference(inst);

        this.backing.entries.push(this.resolvedEntry(inst));

        this.cb.completeTrans(trans);
    }

    remove(key: number) {
        const trans = this.cb.startTrans();
        try {
            const { index } = this.lookup(key);
            this.backing.entries.splice(index, 1);
            this.cb.completeTrans(trans);
        } catch (err) {
            this.cb.cancelTrans(trans);
            throw err;
        }
    }

    insertBefore(inst: Entity, key: number) {
        const trans = this.cb.startTrans();
        trans.reference(inst);

        try {
            const { index } = this.lookup(key);
            this.backing.entries.splice(index, 0, this.resolvedEntry(inst));
            this.cb.completeTrans(trans);
        } catch (err) {
            this.cb.cancelTrans(trans);
            throw err;
        }
    }

    private lookup(key: number) {
        const index = this.backing.entries.findIndex(
            (entry: PageEntry) => entry.key === key
        );
        if (index === -1) {
            throw new Error(`page entry key ${key} not present`);
        } else {
            const entry = this.backing.entries[index];
            return { index, entry };
        }
    }

    private resolvedEntry(item: Entity | PageEntry): PageEntry {
        if (item instanceof Entity)
            return {
                key: this.nextKey++,
                element: item
            };
        else return item;
    }
}

class TextInternalAgent extends Agent {
    constructor(cb: AgentCallbacks, private backing: TextValue) {
        super(cb);
    }

    value() {
        return this.backing;
    }

    splice(start: number, stop: number, addition: string) {
        const trans = this.cb.startTrans();
        const { content } = this.backing;

        if (start < 0 || start > content.length)
            throw new Error("Splice starts out of range");
        if (stop < 0 || stop > content.length)
            throw new Error("Splice stops out of range");
        if (start > stop) throw new Error("Splice start and stop reversed");

        this.backing.content =
            content.slice(0, start) + addition + content.slice(stop);

        this.cb.completeTrans(trans);
    }
}

class FileAgent extends Agent {
    private cachedValue: FileValue;

    constructor(cb: AgentCallbacks, backing: DiskFile) {
        super(cb);

        this.cachedValue = new FileValue(backing.path);
    }

    value() {
        return this.cachedValue;
    }
}

export class Transaction {
    private static observer: Observer = new DataVoid();

    static setObserver(observer: Observer) {
        Transaction.observer = observer;
    }

    id: number;
    entity: Entity;
    others: Entity[];
    value: any;

    constructor(entity: Entity) {
        this.entity = entity;
        this.others = [];
        this.id = Transaction.observer.transactionStarted(this);
    }

    reference(entity: Entity) {
        this.others.push(entity);
    }

    result(value: any) {
        this.value = value;
    }

    model() {
        return {
            id: this.id,
            subject: this.entity,
            others: this.others,
            value: this.value
        };
    }
}
