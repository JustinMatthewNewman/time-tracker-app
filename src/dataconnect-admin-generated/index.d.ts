import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export interface CreateTimeEntryData {
  timeEntry_insert: TimeEntry_Key;
}

export interface CreateTimeEntryVariables {
  userId: UUIDString;
  startTime: TimestampString;
  endTime: TimestampString;
  date: DateString;
  createdAt: TimestampString;
  description?: string | null;
  ticketNumber?: string | null;
  officeNumber?: string | null;
}

export interface CreateUserFromGoogleData {
  user_insert: User_Key;
}

export interface CreateUserFromGoogleVariables {
  googleUid: string;
  username: string;
  email: string;
  createdAt: TimestampString;
}

export interface CreateWorkLogData {
  workLog_insert: WorkLog_Key;
  seg1: TimeEntry_Key;
  seg2: TimeEntry_Key;
  seg3: TimeEntry_Key;
  seg4: TimeEntry_Key;
  seg5: TimeEntry_Key;
  seg6: TimeEntry_Key;
  seg7: TimeEntry_Key;
  seg8: TimeEntry_Key;
  seg9: TimeEntry_Key;
  seg10: TimeEntry_Key;
  seg11: TimeEntry_Key;
  seg12: TimeEntry_Key;
  seg13: TimeEntry_Key;
  seg14: TimeEntry_Key;
  seg15: TimeEntry_Key;
  seg16: TimeEntry_Key;
  seg17: TimeEntry_Key;
  seg18: TimeEntry_Key;
  seg19: TimeEntry_Key;
  seg20: TimeEntry_Key;
  seg21: TimeEntry_Key;
  seg22: TimeEntry_Key;
  seg23: TimeEntry_Key;
  seg24: TimeEntry_Key;
  seg25: TimeEntry_Key;
  seg26: TimeEntry_Key;
  seg27: TimeEntry_Key;
  seg28: TimeEntry_Key;
  seg29: TimeEntry_Key;
  seg30: TimeEntry_Key;
  seg31: TimeEntry_Key;
  seg32: TimeEntry_Key;
}

export interface CreateWorkLogVariables {
  userId: UUIDString;
  workLogId: UUIDString;
  name: string;
  description?: string | null;
  workLogDate: TimestampString;
}

export interface DeleteTimeEntryData {
  timeEntry_delete?: TimeEntry_Key | null;
}

export interface DeleteTimeEntryVariables {
  entryId: UUIDString;
}

export interface GetMyUserData {
  user?: {
    id: UUIDString;
  } & User_Key;
}

export interface GetTimeEntryData {
  timeEntry?: {
    id: UUIDString;
    user: {
      id: UUIDString;
      username: string;
      email?: string | null;
    } & User_Key;
    startTime: TimestampString;
    endTime: TimestampString;
    date: DateString;
    description?: string | null;
    ticketNumber?: string | null;
    officeNumber?: string | null;
    createdAt: TimestampString;
  } & TimeEntry_Key;
}

export interface GetTimeEntryVariables {
  entryId: UUIDString;
}

export interface ListTimeEntriesByDateRangeData {
  timeEntries: ({
    id: UUIDString;
    user: {
      id: UUIDString;
    } & User_Key;
    startTime: TimestampString;
    endTime: TimestampString;
    date: DateString;
    description?: string | null;
    ticketNumber?: string | null;
    officeNumber?: string | null;
    createdAt: TimestampString;
  } & TimeEntry_Key)[];
}

export interface ListTimeEntriesByDateRangeVariables {
  userId: UUIDString;
  startDate: DateString;
  endDate: DateString;
}

export interface ListTimeEntriesByWorkLogData {
  timeEntries: ({
    id: UUIDString;
    startTime: TimestampString;
    endTime: TimestampString;
    date: DateString;
    description?: string | null;
    ticketNumber?: string | null;
    officeNumber?: string | null;
    createdAt: TimestampString;
  } & TimeEntry_Key)[];
}

export interface ListTimeEntriesByWorkLogVariables {
  workLogId: UUIDString;
}

export interface ListTimeEntriesData {
  timeEntries: ({
    id: UUIDString;
    user: {
      id: UUIDString;
      username: string;
      email?: string | null;
    } & User_Key;
    startTime: TimestampString;
    endTime: TimestampString;
    date: DateString;
    description?: string | null;
    ticketNumber?: string | null;
    officeNumber?: string | null;
    createdAt: TimestampString;
  } & TimeEntry_Key)[];
}

export interface ListTimeEntriesVariables {
  userId: UUIDString;
}

export interface ListUsersData {
  users: ({
    id: UUIDString;
    username: string;
    email?: string | null;
    createdAt: TimestampString;
  } & User_Key)[];
}

export interface ListWorkLogsData {
  workLogs: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    workLogDate: TimestampString;
    createdAt: TimestampString;
  } & WorkLog_Key)[];
}

export interface TimeEntry_Key {
  id: UUIDString;
  __typename?: 'TimeEntry_Key';
}

export interface UpdateTimeEntryData {
  timeEntry_update?: TimeEntry_Key | null;
}

export interface UpdateTimeEntryVariables {
  entryId: UUIDString;
  description?: string | null;
  ticketNumber?: string | null;
  officeNumber?: string | null;
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

/** Generated Node Admin SDK operation action function for the 'CreateTimeEntry' Mutation. Allow users to execute without passing in DataConnect. */
export function createTimeEntry(dc: DataConnect, vars: CreateTimeEntryVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateTimeEntryData>>;
/** Generated Node Admin SDK operation action function for the 'CreateTimeEntry' Mutation. Allow users to pass in custom DataConnect instances. */
export function createTimeEntry(vars: CreateTimeEntryVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateTimeEntryData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateTimeEntry' Mutation. Allow users to execute without passing in DataConnect. */
export function updateTimeEntry(dc: DataConnect, vars: UpdateTimeEntryVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateTimeEntryData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateTimeEntry' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateTimeEntry(vars: UpdateTimeEntryVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateTimeEntryData>>;

/** Generated Node Admin SDK operation action function for the 'DeleteTimeEntry' Mutation. Allow users to execute without passing in DataConnect. */
export function deleteTimeEntry(dc: DataConnect, vars: DeleteTimeEntryVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteTimeEntryData>>;
/** Generated Node Admin SDK operation action function for the 'DeleteTimeEntry' Mutation. Allow users to pass in custom DataConnect instances. */
export function deleteTimeEntry(vars: DeleteTimeEntryVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteTimeEntryData>>;

/** Generated Node Admin SDK operation action function for the 'CreateWorkLog' Mutation. Allow users to execute without passing in DataConnect. */
export function createWorkLog(dc: DataConnect, vars: CreateWorkLogVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateWorkLogData>>;
/** Generated Node Admin SDK operation action function for the 'CreateWorkLog' Mutation. Allow users to pass in custom DataConnect instances. */
export function createWorkLog(vars: CreateWorkLogVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateWorkLogData>>;

/** Generated Node Admin SDK operation action function for the 'ListUsers' Query. Allow users to execute without passing in DataConnect. */
export function listUsers(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListUsersData>>;
/** Generated Node Admin SDK operation action function for the 'ListUsers' Query. Allow users to pass in custom DataConnect instances. */
export function listUsers(options?: OperationOptions): Promise<ExecuteOperationResponse<ListUsersData>>;

/** Generated Node Admin SDK operation action function for the 'GetMyUser' Query. Allow users to execute without passing in DataConnect. */
export function getMyUser(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<GetMyUserData>>;
/** Generated Node Admin SDK operation action function for the 'GetMyUser' Query. Allow users to pass in custom DataConnect instances. */
export function getMyUser(options?: OperationOptions): Promise<ExecuteOperationResponse<GetMyUserData>>;

/** Generated Node Admin SDK operation action function for the 'ListTimeEntries' Query. Allow users to execute without passing in DataConnect. */
export function listTimeEntries(dc: DataConnect, vars: ListTimeEntriesVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListTimeEntriesData>>;
/** Generated Node Admin SDK operation action function for the 'ListTimeEntries' Query. Allow users to pass in custom DataConnect instances. */
export function listTimeEntries(vars: ListTimeEntriesVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListTimeEntriesData>>;

/** Generated Node Admin SDK operation action function for the 'GetTimeEntry' Query. Allow users to execute without passing in DataConnect. */
export function getTimeEntry(dc: DataConnect, vars: GetTimeEntryVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetTimeEntryData>>;
/** Generated Node Admin SDK operation action function for the 'GetTimeEntry' Query. Allow users to pass in custom DataConnect instances. */
export function getTimeEntry(vars: GetTimeEntryVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetTimeEntryData>>;

/** Generated Node Admin SDK operation action function for the 'ListWorkLogs' Query. Allow users to execute without passing in DataConnect. */
export function listWorkLogs(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListWorkLogsData>>;
/** Generated Node Admin SDK operation action function for the 'ListWorkLogs' Query. Allow users to pass in custom DataConnect instances. */
export function listWorkLogs(options?: OperationOptions): Promise<ExecuteOperationResponse<ListWorkLogsData>>;

/** Generated Node Admin SDK operation action function for the 'ListTimeEntriesByWorkLog' Query. Allow users to execute without passing in DataConnect. */
export function listTimeEntriesByWorkLog(dc: DataConnect, vars: ListTimeEntriesByWorkLogVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListTimeEntriesByWorkLogData>>;
/** Generated Node Admin SDK operation action function for the 'ListTimeEntriesByWorkLog' Query. Allow users to pass in custom DataConnect instances. */
export function listTimeEntriesByWorkLog(vars: ListTimeEntriesByWorkLogVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListTimeEntriesByWorkLogData>>;

/** Generated Node Admin SDK operation action function for the 'ListTimeEntriesByDateRange' Query. Allow users to execute without passing in DataConnect. */
export function listTimeEntriesByDateRange(dc: DataConnect, vars: ListTimeEntriesByDateRangeVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListTimeEntriesByDateRangeData>>;
/** Generated Node Admin SDK operation action function for the 'ListTimeEntriesByDateRange' Query. Allow users to pass in custom DataConnect instances. */
export function listTimeEntriesByDateRange(vars: ListTimeEntriesByDateRangeVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListTimeEntriesByDateRangeData>>;

