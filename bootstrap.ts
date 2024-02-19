import express from "express";
import * as core from "express-serve-static-core";
import { Module } from "./module";

export class Bootstrap {
  private readonly app: core.Express;

  constructor() {
    this.app = express();
    this.app.use(express.json());
  }

  mapModules(routePrefix: string, module: typeof Module) {
    this.app.use(routePrefix, new module().routes());
    return this;
  }

  run(port?: number) {
    const PORT = port || 3000;
    this.app.listen(PORT, () => console.log(`Running on port ${PORT}`));
  }
}
