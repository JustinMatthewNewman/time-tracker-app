import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface ClearMyThemeData {
  user_update?: User_Key | null;
}

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

export interface DeleteWorkLogData {
  workLog_update?: WorkLog_Key | null;
}

export interface DeleteWorkLogVariables {
  workLogId: UUIDString;
}

export interface GetMyUserData {
  user?: {
    id: UUIDString;
    theme?: {
      id: UUIDString;
      name: string;
      background: string;
      foreground: string;
      isDark: boolean;
    } & Theme_Key;
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
    ticket?: {
      id: UUIDString;
      ticketNumber: number;
      ticketLink?: string | null;
    } & Ticket_Key;
    officeNumber?: string | null;
    createdAt: TimestampString;
  } & TimeEntry_Key;
}

export interface GetTimeEntryVariables {
  entryId: UUIDString;
}

export interface ListMyTimeEntriesData {
  timeEntries: ({
    id: UUIDString;
    startTime: TimestampString;
    endTime: TimestampString;
    ticket?: {
      id: UUIDString;
      ticketNumber: number;
      ticketLink?: string | null;
    } & Ticket_Key;
    officeNumber?: string | null;
    workLog?: {
      id: UUIDString;
      name: string;
    } & WorkLog_Key;
  } & TimeEntry_Key)[];
}

export interface ListThemesData {
  themes: ({
    id: UUIDString;
    name: string;
    background: string;
    foreground: string;
    isDark: boolean;
  } & Theme_Key)[];
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
    ticket?: {
      id: UUIDString;
      ticketNumber: number;
      ticketLink?: string | null;
    } & Ticket_Key;
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
    ticket?: {
      id: UUIDString;
      ticketNumber: number;
      ticketLink?: string | null;
    } & Ticket_Key;
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
    ticket?: {
      id: UUIDString;
      ticketNumber: number;
      ticketLink?: string | null;
    } & Ticket_Key;
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

export interface RestoreWorkLogData {
  workLog_update?: WorkLog_Key | null;
}

export interface RestoreWorkLogVariables {
  workLogId: UUIDString;
}

export interface SelectMyThemeData {
  user_update?: User_Key | null;
}

export interface SelectMyThemeVariables {
  themeId: UUIDString;
}

export interface Theme_Key {
  id: UUIDString;
  __typename?: 'Theme_Key';
}

export interface Ticket_Key {
  ticketNumber: number;
  __typename?: 'Ticket_Key';
}

export interface TimeEntry_Key {
  id: UUIDString;
  __typename?: 'TimeEntry_Key';
}

export interface UpdateTimeEntryClearTicketData {
  timeEntry_update?: TimeEntry_Key | null;
}

export interface UpdateTimeEntryClearTicketVariables {
  entryId: UUIDString;
  description?: string | null;
  officeNumber?: string | null;
}

export interface UpdateTimeEntryData {
  timeEntry_update?: TimeEntry_Key | null;
}

export interface UpdateTimeEntryVariables {
  entryId: UUIDString;
  description?: string | null;
  ticketNumber: number;
  officeNumber?: string | null;
}

export interface UpdateWorkLogData {
  workLog_update?: WorkLog_Key | null;
}

export interface UpdateWorkLogVariables {
  workLogId: UUIDString;
  name: string;
}

export interface UpsertTicketData {
  ticket_upsert: Ticket_Key;
}

export interface UpsertTicketVariables {
  ticketNumber: number;
  ticketLink?: string | null;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

export interface WorkLog_Key {
  id: UUIDString;
  __typename?: 'WorkLog_Key';
}

interface CreateUserFromGoogleRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserFromGoogleVariables): MutationRef<CreateUserFromGoogleData, CreateUserFromGoogleVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateUserFromGoogleVariables): MutationRef<CreateUserFromGoogleData, CreateUserFromGoogleVariables>;
  operationName: string;
}
export const createUserFromGoogleRef: CreateUserFromGoogleRef;

export function createUserFromGoogle(vars: CreateUserFromGoogleVariables): MutationPromise<CreateUserFromGoogleData, CreateUserFromGoogleVariables>;
export function createUserFromGoogle(dc: DataConnect, vars: CreateUserFromGoogleVariables): MutationPromise<CreateUserFromGoogleData, CreateUserFromGoogleVariables>;

interface CreateTimeEntryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTimeEntryVariables): MutationRef<CreateTimeEntryData, CreateTimeEntryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateTimeEntryVariables): MutationRef<CreateTimeEntryData, CreateTimeEntryVariables>;
  operationName: string;
}
export const createTimeEntryRef: CreateTimeEntryRef;

export function createTimeEntry(vars: CreateTimeEntryVariables): MutationPromise<CreateTimeEntryData, CreateTimeEntryVariables>;
export function createTimeEntry(dc: DataConnect, vars: CreateTimeEntryVariables): MutationPromise<CreateTimeEntryData, CreateTimeEntryVariables>;

interface UpdateTimeEntryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTimeEntryVariables): MutationRef<UpdateTimeEntryData, UpdateTimeEntryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateTimeEntryVariables): MutationRef<UpdateTimeEntryData, UpdateTimeEntryVariables>;
  operationName: string;
}
export const updateTimeEntryRef: UpdateTimeEntryRef;

export function updateTimeEntry(vars: UpdateTimeEntryVariables): MutationPromise<UpdateTimeEntryData, UpdateTimeEntryVariables>;
export function updateTimeEntry(dc: DataConnect, vars: UpdateTimeEntryVariables): MutationPromise<UpdateTimeEntryData, UpdateTimeEntryVariables>;

interface UpdateTimeEntryClearTicketRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTimeEntryClearTicketVariables): MutationRef<UpdateTimeEntryClearTicketData, UpdateTimeEntryClearTicketVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateTimeEntryClearTicketVariables): MutationRef<UpdateTimeEntryClearTicketData, UpdateTimeEntryClearTicketVariables>;
  operationName: string;
}
export const updateTimeEntryClearTicketRef: UpdateTimeEntryClearTicketRef;

export function updateTimeEntryClearTicket(vars: UpdateTimeEntryClearTicketVariables): MutationPromise<UpdateTimeEntryClearTicketData, UpdateTimeEntryClearTicketVariables>;
export function updateTimeEntryClearTicket(dc: DataConnect, vars: UpdateTimeEntryClearTicketVariables): MutationPromise<UpdateTimeEntryClearTicketData, UpdateTimeEntryClearTicketVariables>;

interface DeleteTimeEntryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteTimeEntryVariables): MutationRef<DeleteTimeEntryData, DeleteTimeEntryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteTimeEntryVariables): MutationRef<DeleteTimeEntryData, DeleteTimeEntryVariables>;
  operationName: string;
}
export const deleteTimeEntryRef: DeleteTimeEntryRef;

export function deleteTimeEntry(vars: DeleteTimeEntryVariables): MutationPromise<DeleteTimeEntryData, DeleteTimeEntryVariables>;
export function deleteTimeEntry(dc: DataConnect, vars: DeleteTimeEntryVariables): MutationPromise<DeleteTimeEntryData, DeleteTimeEntryVariables>;

interface UpsertTicketRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertTicketVariables): MutationRef<UpsertTicketData, UpsertTicketVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertTicketVariables): MutationRef<UpsertTicketData, UpsertTicketVariables>;
  operationName: string;
}
export const upsertTicketRef: UpsertTicketRef;

export function upsertTicket(vars: UpsertTicketVariables): MutationPromise<UpsertTicketData, UpsertTicketVariables>;
export function upsertTicket(dc: DataConnect, vars: UpsertTicketVariables): MutationPromise<UpsertTicketData, UpsertTicketVariables>;

interface SelectMyThemeRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SelectMyThemeVariables): MutationRef<SelectMyThemeData, SelectMyThemeVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SelectMyThemeVariables): MutationRef<SelectMyThemeData, SelectMyThemeVariables>;
  operationName: string;
}
export const selectMyThemeRef: SelectMyThemeRef;

export function selectMyTheme(vars: SelectMyThemeVariables): MutationPromise<SelectMyThemeData, SelectMyThemeVariables>;
export function selectMyTheme(dc: DataConnect, vars: SelectMyThemeVariables): MutationPromise<SelectMyThemeData, SelectMyThemeVariables>;

interface ClearMyThemeRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<ClearMyThemeData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<ClearMyThemeData, undefined>;
  operationName: string;
}
export const clearMyThemeRef: ClearMyThemeRef;

export function clearMyTheme(): MutationPromise<ClearMyThemeData, undefined>;
export function clearMyTheme(dc: DataConnect): MutationPromise<ClearMyThemeData, undefined>;

interface UpdateWorkLogRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateWorkLogVariables): MutationRef<UpdateWorkLogData, UpdateWorkLogVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateWorkLogVariables): MutationRef<UpdateWorkLogData, UpdateWorkLogVariables>;
  operationName: string;
}
export const updateWorkLogRef: UpdateWorkLogRef;

export function updateWorkLog(vars: UpdateWorkLogVariables): MutationPromise<UpdateWorkLogData, UpdateWorkLogVariables>;
export function updateWorkLog(dc: DataConnect, vars: UpdateWorkLogVariables): MutationPromise<UpdateWorkLogData, UpdateWorkLogVariables>;

interface DeleteWorkLogRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteWorkLogVariables): MutationRef<DeleteWorkLogData, DeleteWorkLogVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteWorkLogVariables): MutationRef<DeleteWorkLogData, DeleteWorkLogVariables>;
  operationName: string;
}
export const deleteWorkLogRef: DeleteWorkLogRef;

export function deleteWorkLog(vars: DeleteWorkLogVariables): MutationPromise<DeleteWorkLogData, DeleteWorkLogVariables>;
export function deleteWorkLog(dc: DataConnect, vars: DeleteWorkLogVariables): MutationPromise<DeleteWorkLogData, DeleteWorkLogVariables>;

interface RestoreWorkLogRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: RestoreWorkLogVariables): MutationRef<RestoreWorkLogData, RestoreWorkLogVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: RestoreWorkLogVariables): MutationRef<RestoreWorkLogData, RestoreWorkLogVariables>;
  operationName: string;
}
export const restoreWorkLogRef: RestoreWorkLogRef;

export function restoreWorkLog(vars: RestoreWorkLogVariables): MutationPromise<RestoreWorkLogData, RestoreWorkLogVariables>;
export function restoreWorkLog(dc: DataConnect, vars: RestoreWorkLogVariables): MutationPromise<RestoreWorkLogData, RestoreWorkLogVariables>;

interface CreateWorkLogRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateWorkLogVariables): MutationRef<CreateWorkLogData, CreateWorkLogVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateWorkLogVariables): MutationRef<CreateWorkLogData, CreateWorkLogVariables>;
  operationName: string;
}
export const createWorkLogRef: CreateWorkLogRef;

export function createWorkLog(vars: CreateWorkLogVariables): MutationPromise<CreateWorkLogData, CreateWorkLogVariables>;
export function createWorkLog(dc: DataConnect, vars: CreateWorkLogVariables): MutationPromise<CreateWorkLogData, CreateWorkLogVariables>;

interface ListUsersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUsersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListUsersData, undefined>;
  operationName: string;
}
export const listUsersRef: ListUsersRef;

export function listUsers(options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;
export function listUsers(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;

interface GetMyUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetMyUserData, undefined>;
  operationName: string;
}
export const getMyUserRef: GetMyUserRef;

export function getMyUser(options?: ExecuteQueryOptions): QueryPromise<GetMyUserData, undefined>;
export function getMyUser(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetMyUserData, undefined>;

interface ListThemesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListThemesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListThemesData, undefined>;
  operationName: string;
}
export const listThemesRef: ListThemesRef;

export function listThemes(options?: ExecuteQueryOptions): QueryPromise<ListThemesData, undefined>;
export function listThemes(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListThemesData, undefined>;

interface ListTimeEntriesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListTimeEntriesVariables): QueryRef<ListTimeEntriesData, ListTimeEntriesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListTimeEntriesVariables): QueryRef<ListTimeEntriesData, ListTimeEntriesVariables>;
  operationName: string;
}
export const listTimeEntriesRef: ListTimeEntriesRef;

export function listTimeEntries(vars: ListTimeEntriesVariables, options?: ExecuteQueryOptions): QueryPromise<ListTimeEntriesData, ListTimeEntriesVariables>;
export function listTimeEntries(dc: DataConnect, vars: ListTimeEntriesVariables, options?: ExecuteQueryOptions): QueryPromise<ListTimeEntriesData, ListTimeEntriesVariables>;

interface GetTimeEntryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTimeEntryVariables): QueryRef<GetTimeEntryData, GetTimeEntryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetTimeEntryVariables): QueryRef<GetTimeEntryData, GetTimeEntryVariables>;
  operationName: string;
}
export const getTimeEntryRef: GetTimeEntryRef;

export function getTimeEntry(vars: GetTimeEntryVariables, options?: ExecuteQueryOptions): QueryPromise<GetTimeEntryData, GetTimeEntryVariables>;
export function getTimeEntry(dc: DataConnect, vars: GetTimeEntryVariables, options?: ExecuteQueryOptions): QueryPromise<GetTimeEntryData, GetTimeEntryVariables>;

interface ListWorkLogsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListWorkLogsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListWorkLogsData, undefined>;
  operationName: string;
}
export const listWorkLogsRef: ListWorkLogsRef;

export function listWorkLogs(options?: ExecuteQueryOptions): QueryPromise<ListWorkLogsData, undefined>;
export function listWorkLogs(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListWorkLogsData, undefined>;

interface ListTimeEntriesByWorkLogRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListTimeEntriesByWorkLogVariables): QueryRef<ListTimeEntriesByWorkLogData, ListTimeEntriesByWorkLogVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListTimeEntriesByWorkLogVariables): QueryRef<ListTimeEntriesByWorkLogData, ListTimeEntriesByWorkLogVariables>;
  operationName: string;
}
export const listTimeEntriesByWorkLogRef: ListTimeEntriesByWorkLogRef;

export function listTimeEntriesByWorkLog(vars: ListTimeEntriesByWorkLogVariables, options?: ExecuteQueryOptions): QueryPromise<ListTimeEntriesByWorkLogData, ListTimeEntriesByWorkLogVariables>;
export function listTimeEntriesByWorkLog(dc: DataConnect, vars: ListTimeEntriesByWorkLogVariables, options?: ExecuteQueryOptions): QueryPromise<ListTimeEntriesByWorkLogData, ListTimeEntriesByWorkLogVariables>;

interface ListMyTimeEntriesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMyTimeEntriesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListMyTimeEntriesData, undefined>;
  operationName: string;
}
export const listMyTimeEntriesRef: ListMyTimeEntriesRef;

export function listMyTimeEntries(options?: ExecuteQueryOptions): QueryPromise<ListMyTimeEntriesData, undefined>;
export function listMyTimeEntries(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListMyTimeEntriesData, undefined>;

interface ListTimeEntriesByDateRangeRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListTimeEntriesByDateRangeVariables): QueryRef<ListTimeEntriesByDateRangeData, ListTimeEntriesByDateRangeVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListTimeEntriesByDateRangeVariables): QueryRef<ListTimeEntriesByDateRangeData, ListTimeEntriesByDateRangeVariables>;
  operationName: string;
}
export const listTimeEntriesByDateRangeRef: ListTimeEntriesByDateRangeRef;

export function listTimeEntriesByDateRange(vars: ListTimeEntriesByDateRangeVariables, options?: ExecuteQueryOptions): QueryPromise<ListTimeEntriesByDateRangeData, ListTimeEntriesByDateRangeVariables>;
export function listTimeEntriesByDateRange(dc: DataConnect, vars: ListTimeEntriesByDateRangeVariables, options?: ExecuteQueryOptions): QueryPromise<ListTimeEntriesByDateRangeData, ListTimeEntriesByDateRangeVariables>;

