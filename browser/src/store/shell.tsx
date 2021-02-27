import { InkValue } from "shared";
import { Store, ViewState } from ".";
import { ShellRelay } from "../types";

export default class ShellActions {
    private inkCanvasRef: React.RefObject<HTMLDivElement> | null = null;
    private inkData: InkValue = { strokes: [] };

    constructor(
        private store: Store,
        private state: ViewState,
        private relay: ShellRelay
    ) {
        relay.receive = this.receive.bind(this);

        window.onscroll = this.translateInkCanvas.bind(this);
        window.onresize = this.translateInkCanvas.bind(this);
    }

    receive(message: string) {
        let parts = message.split(" ");
        if (parts[0] == "strokeAdded") {
            this.inkData.strokes.push({
                width: 2,
                color: { r: 0, g: 0, b: 0 },
                points: parts[1]
            });
        } else if (parts[0] == "strokeErased") {
        }
    }

    selectionChanged() {
        // Check if selection is an ink element
        if (this.state.selection != null) {
            const node = this.store.lookupNode(this.state.selection);
            const model = this.store.lookupModel(node.element.id);
            if (model.type == "Ink") {
                this.inkData = model.value as InkValue;
                return;
            }
        }

        // All other cases, remove Ink Canvas
        this.removeInkCanvas();
    }

    dragging() {
        this.removeInkCanvas();
    }

    inkRefChanged(ref: React.RefObject<HTMLDivElement>) {
        // Ref is only received if it is on an edited Ink entity
        this.inkCanvasRef = ref;
        this.showInkCanvas();
    }

    private removeInkCanvas() {
        this.relay.send("deleteCanvas");
    }

    private showInkCanvas() {
        this.translateInkCanvas();
        this.relay.send(
            `populateCanvas ${JSON.stringify(this.inkData.strokes)}`
        );
    }

    private translateInkCanvas() {
        if (this.inkCanvasRef !== null) {
            if (this.inkCanvasRef.current !== null) {
                const {
                    top,
                    left,
                    width,
                    height
                } = this.inkCanvasRef.current.getBoundingClientRect();
                this.relay.send(`moveCanvas ${top} ${left} ${width} ${height}`);
            }
        }
    }
}
