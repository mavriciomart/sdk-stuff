import { auth$ } from "./auth";
import { Config } from "./config";
import { ApiService } from "./api";
import { parseSchema } from "./utils";
import type { ConfigOptions, SchemaPaths } from "./types";

class SDK {
  #api: ApiService;
  config: ConfigOptions;
  Auth$: typeof auth$;
  Crossbar: Record<string, () => Promise<unknown>>;

  constructor(options: ConfigOptions) {
    this.config = options;
    this.#api = new ApiService(options);
    this.Auth$ = auth$;
    this.initializeSDK();
  }

  async initializeSDK() {
    const apiSchema = await parseSchema(this.config.schemaUrl);
    this.Crossbar = this.#getMethods(apiSchema.paths);
  }

  /**
   *
   * @param username Username/email used to log in
   * @param password Password used to log in
   * @param accountName Account name
   * @param credentials You can skip both username and password and provide a md5 hash of both e.g. md5(usernema:password)
   */
  authenticate(
    username: string | null,
    password: string | null,
    accountName: string,
    credentials?: string
  ) {
    return this.#api.authenticate(username, password, accountName, credentials);
  }

  signOut() {
    this.#api.signOut();
  }

  #getMethods(paths: SchemaPaths) {
    // /account/<account-id>/...
    const endpoints = Object.keys(paths);
    let methods = {};

    endpoints.forEach((endpoint) => {
      const path = paths[endpoint];
      // get / post / put ...
      const pathMethods = Object.keys(path);

      let functions = {};
      let tag = "default";
      pathMethods.forEach((method) => {
        const { operationId, tags } = path[method];
        const name = operationId;
        const fn = this.#getRouteFunction(endpoint, method);
        tag = tags[0] ?? "default";

        functions = { ...functions, [name]: fn };
      });
      methods = { ...methods, [tag]: { ...methods[tag], ...functions } };
    });

    return methods;
  }

  #getRouteFunction(endpoint: string, method: string) {
    const api = this.#api;
    return function (body: Record<string, unknown>) {
      return api.sendRequest(endpoint, method.toUpperCase(), body);
    };
  }
}

export const sdk = (config: ConfigOptions) => new SDK(new Config(config));
