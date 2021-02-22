import { Store, ViewState } from ".";
import { ShellRelay } from "../types";

export default class ShellActions {
    private inkCanvasRef: React.RefObject<HTMLDivElement> | null = null;

    constructor(
        private store: Store,
        private state: ViewState,
        private relay: ShellRelay
    ) {
        window.onscroll = this.translateInkCanvas.bind(this);
        window.onresize = this.translateInkCanvas.bind(this);
    }

    selectionChanged() {
        // Check if selection is an ink element
        if (this.state.selection != null) {
            const node = this.store.lookupNode(this.state.selection);
            const model = this.store.lookupModel(node.element.id);
            if (model.type == "Ink") return;
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
        this.translateInkCanvas();
    }

    private removeInkCanvas() {
        this.relay.send("deleteCanvas");
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
