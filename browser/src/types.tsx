export interface ShellRelay {
    send: (msg: string) => void;
    receive: (msg: string) => void;
}
