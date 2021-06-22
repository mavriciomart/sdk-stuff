import { sdk as commioSDK } from "./sdk/sdk";

// DEMO
const sdk = commioSDK({
  schemaUrl: "https://example.com/oas3/openapi.yml",
  host: "https://sandbox.example.com:8443/v2",
});
// @ts-ignore
window.sdk = sdk;

sdk.Auth$.subscribe((data) => {
  // @ts-ignore
  document.querySelector("#form").style.display = data.authToken
    ? "none"
    : "block";
  document.querySelector("#auth-status").innerHTML = data.authToken
    ? "Authenticated"
    : "Unauthenticated";
});

document.querySelector("#form").addEventListener("submit", (e) => {
  e.preventDefault();
  // @ts-ignore
  const form = new FormData(e.target);
  const username = form.get("username") as string;
  const password = form.get("password") as string;
  const accountName = form.get("account") as string;

  sdk.authenticate(username, password, accountName);
});

setTimeout(() => {
  Object.entries(sdk.Crossbar).forEach((tag) => {
    const title = tag[0];
    const methods = tag[1];
    let list = "";

    Object.entries(methods).forEach(
      (method) => (list += `<li>${method[0]}</li>`)
    );

    const tagElement = `
            <details>
              <summary>${title}</summary>
              <ul>
               ${list}
              </ul>
            </details>`;
    document.querySelector("#methods").innerHTML += tagElement;
  });
}, 1000);
