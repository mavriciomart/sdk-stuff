import md5 from "md5";
import { auth$ } from "./auth";
import { parseResponse, isTokenInvalid } from "./utils";
import type { AuthInformation } from "./auth";
import type { ConfigOptions, RequestMethods } from "./types";
import type { Subscription } from "rxjs";

type RequestOptions = {
  accountId?: string;
  userId?: string;
  action?: string;
};

const createAuthRequest = (
  config: ConfigOptions,
  credentials: string,
  accountName: string
) => {
  if (!config.host) {
    throw new Error("You have not specifiend an API host");
  }

  return new Promise((resolve, reject) => {
    fetch(`${config.host}/${config.authEndpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          credentials,
          account_name: accountName,
        },
      }),
    })
      .then(parseResponse)
      .then((response) => {
        if (response.ok) {
          resolve(response.json);
        }

        reject(response.json);
      })
      .catch((error) => reject(error));
  });
};

const buildUrl = (
  url: string,
  accountId: string | null,
  userId: string | null
) => url.replace(":account-id", accountId).replace(":user-id", userId);

export class ApiService {
  config: ConfigOptions;
  auth: AuthInformation;
  authSubscription: Subscription;

  constructor(config: ConfigOptions) {
    this.config = config;

    this.authSubscription = auth$.subscribe((auth) => {
      this.auth = auth;
    });
  }

  /**
   *
   * @param username Username/email used to log in
   * @param password Password used to log in
   * @param accountName Account name
   * @param credentials You can skip both username and password and provide a md5 hash of both e.g. md5(username:password)
   */
  authenticate(
    username: string | null,
    password: string | null,
    accountName: string,
    credentials?: string
  ) {
    const { config } = this;

    const authCredentials = credentials
      ? credentials
      : md5(`${username}:${password}`).toString();

    const authPromise = createAuthRequest(config, authCredentials, accountName);

    authPromise
      .then((response) => {
        // TODO: Add type for authentication request
        const credentials = {
          // @ts-ignore
          authToken: response.auth_token,
          credentials: authCredentials,
          // @ts-ignore
          accountId: response.data.account_id,
          // @ts-ignore
          currentAccountId: response.data.account_id,
          accountName: accountName,
          currentAccountName: accountName,
          // @ts-ignore
          userId: response.data.owner_id,
        };

        auth$.next({ ...credentials });
      })
      .catch((error) => {
        console.error(
          "KazooSDK: There has been an error while authenticating",
          error
        );
      });
    return authPromise;
  }

  signOut() {
    auth$.next({
      authToken: null,
      userId: null,
      credentials: null,
      accountId: null,
      accountName: null,
      currentAccountId: null,
      currentAccountName: null,
    });
  }

  sendRequest(
    endpoint: string,
    method: string,
    body: unknown = null,
    options: RequestOptions = {}
  ) {
    const { config } = this;

    const requestPromise = new Promise((resolve, reject) => {
      const credentials = this.auth;

      const request = (credentials) => {
        const {
          authToken,
          currentAccountId: authenticatedAccount,
          userId: authenticatedUser,
        } = credentials;

        const user = options.userId ?? authenticatedUser;
        const account = options.accountId ?? authenticatedAccount;
        const action = options.action ?? null;

        if (!authToken || !account) {
          reject("User has not been authorized");
        }

        // TODO: Add option to extend headers
        const headers = {
          "X-Auth-Token": authToken,
          "Content-Type": "application/json",
        };

        const requestUrl = buildUrl(config.host + endpoint, account, user);

        const bodyAction = {
          ...(action && {
            action,
          }),
        };
        const bodyData = {
          ...(body && { data: body }),
        };

        const requestBody = {
          ...bodyAction,
          ...bodyData,
        };
        const shouldSendBody = Object.keys(requestBody).length;

        fetch(requestUrl, {
          method,
          headers,
          ...(shouldSendBody && {
            body: JSON.stringify({ data: requestBody }),
          }),
        })
          .then(parseResponse)
          .then((response) => {
            if (response.ok) {
              resolve(response.json);
            }

            reject(response.json);
          })
          .catch((error) => reject(error));
      };

      if (isTokenInvalid(credentials.authToken)) {
        // re authenticate and run request with new credentials
        return this.authenticate(
          "",
          "",
          credentials.accountName,
          credentials.credentials
        )
          .then(() => request(this.auth))
          .catch((error) => reject(error));
      }

      return request(credentials);
    });

    return requestPromise;
  }
}
