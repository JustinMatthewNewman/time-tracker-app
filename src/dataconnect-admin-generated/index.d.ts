import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export interface CreateUserFromGoogleData {
  user_insert: User_Key;
}

export interface CreateUserFromGoogleVariables {
  googleUid: string;
  username: string;
  email: string;
  createdAt: TimestampString;
}

export interface ListUsersData {
  users: ({
    id: UUIDString;
    username: string;
    email?: string | null;
    createdAt: TimestampString;
  } & User_Key)[];
}

export interface TimeEntry_Key {
  id: UUIDString;
  __typename?: 'TimeEntry_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

export interface WorkLog_Key {
  id: UUIDString;
  __typename?: 'WorkLog_Key';
}

/** Generated Node Admin SDK operation action function for the 'CreateUserFromGoogle' Mutation. Allow users to execute without passing in DataConnect. */
export function createUserFromGoogle(dc: DataConnect, vars: CreateUserFromGoogleVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateUserFromGoogleData>>;
/** Generated Node Admin SDK operation action function for the 'CreateUserFromGoogle' Mutation. Allow users to pass in custom DataConnect instances. */
export function createUserFromGoogle(vars: CreateUserFromGoogleVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateUserFromGoogleData>>;

/** Generated Node Admin SDK operation action function for the 'ListUsers' Query. Allow users to execute without passing in DataConnect. */
export function listUsers(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListUsersData>>;
/** Generated Node Admin SDK operation action function for the 'ListUsers' Query. Allow users to pass in custom DataConnect instances. */
export function listUsers(options?: OperationOptions): Promise<ExecuteOperationResponse<ListUsersData>>;

