# sdk-stuff

## How it works

The sdk should be initialized with the required properties:

- schemaUrl: The url of your OpenAPI schema
- host

On startup `sdk.ts` initializes the `ApiService` which takes care of providing methods for authentication and sending requests. It also fetches the `schemaUrl` and parses it. If the schema object is a `Crossbar` object is created with properties for each of the endpoints tags, e.g _accounts_, _alerts_, _callflows_, etc.

We also create a function for the endpoints belonging to each tag. This functions are created using the endpoint `operationId` as the function name.

The `Crossbar` object has a structure like this:

```javascript
Crossbar = {
  about: {
    GetAbout: function,
  },
  accounts: {
    PutAccounts: function,
    GetAccountsAccountId: function,
  },
  ...
};
```

The functions receive an argument called `data` of the following type:

```typescript
export type SDKMethodData = {
  params: { accountId?: string };
  body: Record<string, unknown>;
};
```

The `params` property has properties that will be replaced in the method url. For example in `/accounts/{ACCOUNT_ID}` "{ACCOUNT_ID}" will be replaced by the value in `data.params.accountId`.

If no value is provided for `accountId` we'll use the `currentAccountId` in **Auth$**

## What is Auth$ ?

`Auth$` is a rxjs Subject, this allows us to track auth status over time, both inside of the sdk, or the application using it.

On user authentication Auth$ will save the account ID, name, and the user ID. It also saves a `currentAccountId` that's used for the api requests.

## Usage

```typescript
import { sdk as commioSDK } from "commio-sdk";

// Intialize it
const sdk = commioSDK({
  schemaUrl: "example.com/schema.yml",
  host: "sandbox.example.com/v2",
});

// Authenticate as a user
sdk.authenticate("username", "password", "account name");

// Use it
sdk.Crossbar.accounts.GetAccountsAccountId().then().catch(); // It will use the currentAccountId

sdk.Crossbar.accounts.GetAccountsAccountId({
  params: { accountId: "1234567890" },
}); // Will use the passed account id
```

## How to run

1. Replace the schemaUrl and host url in `src/index.ts``
2. Run with `yarn dev`
