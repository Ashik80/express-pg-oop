import { Module } from "./module";
export declare class Bootstrap {
    private readonly app;
    constructor();
    mapModules(routePrefix: string, module: typeof Module): this;
    run(port?: number): void;
}
