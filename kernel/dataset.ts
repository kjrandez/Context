import Async from "async";
import { Entity, Presentation, Backing, Transaction } from "./entity";

const lorem1 =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque vestibulum at erat eget suscipit. Nulla rhoncus libero sapien, id molestie nibh luctus in. Pellentesque tristique nulla sit amet eros sodales, quis luctus enim congue. Integer placerat viverra sollicitudin. In libero ligula, interdum nec pellentesque non, elementum vel dolor. Aenean ut nisl vulputate, interdum urna eget, placerat enim. Vestibulum felis turpis, elementum ac malesuada id, lacinia at justo. In laoreet mauris et nibh ullamcorper convallis. Maecenas faucibus ipsum at congue scelerisque. Aliquam sem purus, pharetra suscipit condimentum quis, imperdiet at ex. Vestibulum maximus mattis odio, sed elementum dolor feugiat eget. Aliquam consectetur, neque vitae porta dictum, ante dui posuere libero, id euismod nisi dolor at ipsum.";
const lorem2 =
    "Maecenas vitae eros non lacus tincidunt ultrices sit amet id massa. Praesent pretium ante sit amet sapien suscipit eleifend. In hac habitasse platea dictumst. Nulla erat nisi, elementum vitae tempor ut, vehicula sit amet nibh. Vestibulum cursus fermentum enim, vel mollis augue sodales ut. Suspendisse in mattis justo. In eget ipsum blandit dolor ultricies euismod. Mauris sit amet massa maximus, placerat nisi nec, dignissim ipsum. Donec sodales id lectus sit amet pulvinar. Pellentesque sodales felis fringilla ultrices tincidunt. Phasellus vehicula lorem sed felis pulvinar, id porta mi commodo.";
const lorem3 =
    "Donec imperdiet id lectus eu hendrerit. Curabitur sodales libero sit amet eros venenatis, nec venenatis lacus bibendum. Ut aliquam convallis diam vitae interdum. Maecenas laoreet tempus pretium. Suspendisse ac dui tortor. Nulla rutrum fermentum dui ut gravida. Curabitur egestas erat ut ligula fermentum convallis. Nulla maximus, eros non semper mollis, lacus nulla ullamcorper risus, eu condimentum risus tellus eu est. In ut urna pulvinar, aliquet ligula pharetra, interdum nunc. Praesent dignissim vehicula arcu, et semper dolor porta vel. Maecenas semper porta gravida. Proin tortor augue, mattis ut luctus in, semper vitae nisi. Vivamus egestas, mi mollis elementum egestas, nibh sapien euismod justo, ac cursus metus risus id ante. Nam placerat velit ac orci ullamcorper, id dapibus odio bibendum.";

function builders(ds: DataSet) {
    return {
        page: (entries: Entity[]) =>
            new Entity(ds, Presentation.Page, Backing.Internal, {
                entries: entries.map((entry, index) => ({
                    key: index,
                    element: entry
                }))
            }),
        text: (content: string) =>
            new Entity(ds, Presentation.Text, Backing.Internal, { content }),
        script: (content: string) =>
            new Entity(ds, Presentation.Script, Backing.Internal, { content }),
        image: (filename: string) =>
            new Entity(ds, Presentation.Image, Backing.Disk, { filename }),
        ink: () => new Entity(ds, Presentation.Ink, Backing.Internal, {})
    };
}

export default class DataSet {
    root: Entity;
    clipboard: Entity;
    private objMap: { [_: number]: Entity };
    private nextIndex: number;
    private nextTransaction: number;

    constructor(private queue: Async.QueueObject<Transaction>) {
        this.objMap = {};
        this.nextIndex = 1;
        this.nextTransaction = 0;

        const { page, text, script, image, ink } = builders(this);

        this.root = page([
            text("Hello world"),
            text("How are you doing **today**?"),
            text("I'm doing just fine thank you very much."),
            script("def something():\n\tprint('Hello world!')"),
            page([text("Introduction"), text(lorem1)]),
            page([
                page([text("Mas informacion"), text(lorem2)]),
                page([text("[Scope_0]"), image("lol2.png")])
            ]),
            ink(),
            page([text(lorem3)]),
            image("sw.png"),
            page([
                text(
                    "This is pretty funy if you actually think about it for a second."
                ),
                text("I really can't agree with that statement")
            ]),
            text("Just to finish it off right here."),
            text("Actually I'll go ahead and add a bit more to be sure...")
        ]);

        this.clipboard = page([]);
    }

    lookup(id: number) {
        if (id in this.objMap) return this.objMap[id];
        else throw new Error("entity not found in dataset");
    }

    entityCreated(inst: Entity): number {
        const id = this.nextIndex++;
        this.objMap[id] = inst;
        return id;
    }

    transactionStarted(trans: Transaction): number {
        const id = this.nextTransaction++;
        return id;
    }

    transactionCancelled(trans: Transaction): void {
        // Do anything?
    }

    transactionCompleted(trans: Transaction): void {
        this.queue.push(trans);
    }
}
