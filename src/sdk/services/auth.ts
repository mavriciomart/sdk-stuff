import { BehaviorSubject } from "rxjs";

export type AuthInformation = {
  credentials: string;
  authToken: string;
  userId: string;
  accountId: string;
  accountName: string;
  currentAccountId: string;
  currentAccountName: string;
};

export const auth$ = new BehaviorSubject<AuthInformation>({
  credentials: null,
  authToken: null,
  userId: null,
  accountId: null,
  accountName: null,
  currentAccountId: null,
  currentAccountName: null,
});
