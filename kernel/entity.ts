import { Proxyable, Model } from "shared";
import DataSet from "./dataset";
import path from "path";

interface AgentCallbacks {
    startTrans: () => Transaction;
    cancelTrans: (trans: Transaction) => void;
    completeTrans: (trans: Transaction) => void;
}

export class Entity extends Proxyable {
    private _id: number;
    private agent: Agent;
    private callbacks: AgentCallbacks;

    constructor(
        ds: DataSet,
        private presentation: Presentation,
        private backing: Backing,
        private backingValue: object
    ) {
        super();

        this._id = ds.entityCreated(this);

        this.callbacks = {
            startTrans: () => new Transaction(ds, this),
            cancelTrans: (trans: Transaction) => ds.transactionCancelled(trans),
            completeTrans: (trans: Transaction) =>
                ds.transactionCompleted(trans)
        };

        this.agent = this.buildAgent();
    }

    resolveTarget(selector: string) {
        if (selector in this) return this;
        else return this.agent;
    }

    id(): number {
        return this._id;
    }

    // Becomes equivalent to presentation
    type(): string {
        return this.presentation;
    }

    model(): Model<ModelValue> {
        return {
            id: this.id(),
            type: this.type(),
            value: this.agent.value()
        };
    }

    changePresentation(presentation: Presentation) {
        this.presentation = presentation;
        this.agent = this.buildAgent();
    }

    changeBacking(backing: Backing, backingValue: object) {
        this.backing = backing;
        this.backingValue = backingValue;
        this.agent = this.buildAgent();
    }

    private buildAgent() {
        switch (this.presentation) {
            case Presentation.Text: // Same backing and agent as Text
            case Presentation.Script:
                if (this.backing === Backing.Internal)
                    return new TextInternalAgent(
                        this.callbacks,
                        this.backingValue as TextValue
                    );
                break;
            case Presentation.Page:
                if (this.backing === Backing.Internal)
                    return new PageInternalAgent(
                        this.callbacks,
                        this.backingValue as PageValue
                    );
                break;
            case Presentation.Image: // Same backing and agent as File
            case Presentation.File:
                if (this.backing === Backing.Disk)
                    return new FileAgent(
                        this.callbacks,
                        this.backingValue as DiskFile
                    );
                break;
            case Presentation.Ink:
                if (this.backing === Backing.Internal)
                    return new InkAgent(
                        this.callbacks,
                        this.backingValue as InkValue
                    );
                break;
        }

        throw new Error("No suitable agent.");
    }
}

export enum Presentation {
    Text = "Text",
    Script = "Script",
    Page = "Page",
    File = "File",
    Image = "Image",
    Ink = "Ink"
}

export enum Backing {
    Disk = "Disk",
    Internal = "Internal"
}

interface DiskFile {
    path: string;
}

interface ModelValue {}

interface PageValue extends ModelValue {
    entries: PageEntry[];
}

interface TextValue extends ModelValue {
    content: string;
}

interface Stroke {
    width: number;
    color: { r: number; g: number; b: number };
    points: string;
}

interface InkValue extends ModelValue {
    strokes: Stroke[];
}

interface FileValue {
    path: string;
    name: string;
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

class NopAgent extends Agent {
    constructor(cb: AgentCallbacks, private backing: null) {
        super(cb);
    }

    value() {
        return {};
    }
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

        this.cachedValue = {
            path: backing.path,
            name: path.basename(backing.path, path.extname(backing.path))
        };
    }

    value() {
        return this.cachedValue;
    }
}

class InkAgent extends Agent {
    constructor(cb: AgentCallbacks, private backing: InkValue) {
        super(cb);
    }

    value() {
        return this.backing;
    }

    splice(start: number, stop: number, addition: Stroke[]) {
        const trans = this.cb.startTrans();

        this.backing.strokes.splice(start, stop - start, ...addition);

        this.cb.completeTrans(trans);
    }
}

export class Transaction {
    id: number;
    entity: Entity;
    others: Entity[];
    value: any;

    constructor(ds: DataSet, entity: Entity) {
        this.entity = entity;
        this.others = [];
        this.id = ds.transactionStarted(this);
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
