import type { ConfigOptions } from "./types";

export class Config {
  host: string;
  authEndpoint: string;
  schemaUrl: string;

  constructor(config: ConfigOptions) {
    const { host, schemaUrl, authEndpoint } = config;

    this.host = host;
    this.schemaUrl = schemaUrl;
    this.authEndpoint = authEndpoint ?? "desktop_auth";
  }
}
