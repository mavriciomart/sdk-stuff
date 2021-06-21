import { sdk } from "./sdk";

const SDK = sdk({
  schemaUrl: "/oas3/openapi.yml",
  host: "https://example.com:8443/v2",
});

// DEMO
window.sdk = SDK;
