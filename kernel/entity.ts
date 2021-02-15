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

export abstract class Entity implements Proxyable {
    proxyableId: number | null = null;

    private static observer: Observer = new DataVoid();

    static setObserver(observer: Observer) {
        Entity.observer = observer;
    }

    id: number;

    constructor() {
        this.id = Entity.observer.entityCreated(this);
    }

    abstract value(): any;

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

    protected newTransaction() {
        return new Transaction(this);
    }

    protected cancelTransaction(trans: Transaction) {
        Entity.observer.transactionCancelled(trans);
    }

    protected completeTransaction(trans: Transaction) {
        trans.result(this.value());
        Entity.observer.transactionCompleted(trans);
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
            value: this.value,
        };
    }
}

interface PageEntry {
    key: number;
    element: Entity;
}

export class Page extends Entity {
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

    append(inst: Entity) {
        const trans = this.newTransaction();
        trans.reference(inst);

        const entry = Page.resolvedEntry(inst);
        this.entries.push(entry);

        this.completeTransaction(trans);
    }

    remove(key: number) {
        const trans = this.newTransaction();
        try {
            const { index } = this.lookup(key);
            this.entries.splice(index, 1);
            this.completeTransaction(trans);
        } catch (err) {
            this.cancelTransaction(trans);
            throw err;
        }
    }

    insertBefore(inst: Entity, key: number) {
        const trans = this.newTransaction();
        trans.reference(inst);

        try {
            const { index } = this.lookup(key);
            this.entries.splice(index, 0, Page.resolvedEntry(inst));
            this.completeTransaction(trans);
        } catch (err) {
            this.cancelTransaction(trans);
            throw err;
        }
    }

    private lookup(key: number) {
        const index = this.entries.findIndex(
            (entry: PageEntry) => entry.key === key
        );
        if (index === -1) {
            throw new Error(`page entry key ${key} not present`);
        } else {
            const entry = this.entries[index];
            return { index, entry };
        }
    }

    private static resolvedEntry(item: Entity | PageEntry): PageEntry {
        if (item instanceof Entity)
            return {
                key: Page.nextKey++,
                element: item,
            };
        else return item;
    }
}

export class Text extends Entity {
    constructor(public content: string) {
        super();
    }

    value() {
        return { content: this.content };
    }

    splice(start: number, stop: number, addition: string) {
        const trans = this.newTransaction();

        if (start < 0 || start > this.content.length)
            throw new Error("Splice starts out of range");
        if (stop < 0 || stop > this.content.length)
            throw new Error("Splice stops out of range");
        if (start > stop) throw new Error("Splice start and stop reversed");

        this.content =
            this.content.slice(0, start) + addition + this.content.slice(stop);

        this.completeTransaction(trans);
    }
}

export class Script extends Text {}

export class Image extends Entity {
    constructor(public src: string, public alt: string) {
        super();
    }

    value() {
        return {
            src: this.src,
            alt: this.alt,
        };
    }
}
