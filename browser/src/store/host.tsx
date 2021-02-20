import { Proxy } from "shared";

export default class HostActions {
    constructor(private host: Proxy) {}

    async instantiate(
        presentation: string,
        backing: string,
        backingValue: object
    ): Promise<Proxy> {
        return await this.host.call("instantiate", [
            presentation,
            backing,
            backingValue
        ]);
    }
}
