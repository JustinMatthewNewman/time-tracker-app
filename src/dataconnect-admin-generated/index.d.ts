import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export interface ClearMyColorSchemeData {
  user_update?: User_Key | null;
}

export interface ColorScheme_Key {
  id: UUIDString;
  __typename?: 'ColorScheme_Key';
}

export interface CreateTimeEntryData {
  timeEntry_insert: TimeEntry_Key;
}

export interface CreateTimeEntryVariables {
  userId: UUIDString;
  workLogId?: UUIDString | null;
  startTime: TimestampString;
  endTime: TimestampString;
  date: DateString;
  createdAt: TimestampString;
  description?: string | null;
  ticketNumber?: number | null;
}

export interface CreateUserFromGoogleData {
  user_insert: User_Key;
}

export interface CreateUserFromGoogleVariables {
  googleUid: string;
  username: string;
  email: string;
  createdAt: TimestampString;
  userTypeName?: string;
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

export interface CreateWorkLogOnlyData {
  workLog_insert: WorkLog_Key;
}

export interface CreateWorkLogOnlyVariables {
  userId: UUIDString;
  workLogId: UUIDString;
  name: string;
  description?: string | null;
  workLogDate: TimestampString;
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
    userType: {
      name: string;
    } & UserType_Key;
    colorScheme?: {
      id: UUIDString;
      name: string;
    } & ColorScheme_Key;
    performanceMode?: boolean | null;
    backgroundOpacity?: number | null;
    externalTicketLinkTemplate?: string | null;
    cardOpacity?: number | null;
    cardBlur?: number | null;
    bordersEnabled?: boolean | null;
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
      office?: string | null;
      ticketTitle?: string | null;
      ticketLink?: string | null;
    } & Ticket_Key;
    officeNumber?: string | null;
    createdAt: TimestampString;
  } & TimeEntry_Key;
}

export interface GetTimeEntryVariables {
  entryId: UUIDString;
}

export interface ListColorSchemesData {
  colorSchemes: ({
    id: UUIDString;
    name: string;
    themes: ({
      id: UUIDString;
      isDark: boolean;
      background: string;
      foreground: string;
      surface: string;
      surfaceForeground: string;
      overlay: string;
      overlayForeground: string;
      muted: string;
      default: string;
      defaultForeground: string;
      accent: string;
      accentForeground: string;
      border: string;
      separator: string;
    } & Theme_Key)[];
  } & ColorScheme_Key)[];
}

export interface ListMyTimeEntriesData {
  timeEntries: ({
    id: UUIDString;
    startTime: TimestampString;
    endTime: TimestampString;
    description?: string | null;
    ticket?: {
      id: UUIDString;
      ticketNumber: number;
      office?: string | null;
      ticketTitle?: string | null;
      ticketLink?: string | null;
    } & Ticket_Key;
    officeNumber?: string | null;
    workLog?: {
      id: UUIDString;
      name: string;
    } & WorkLog_Key;
  } & TimeEntry_Key)[];
}

export interface ListMyTimeEntriesVariables {
  limit?: number | null;
  offset?: number | null;
}

export interface ListTicketsData {
  tickets: ({
    id: UUIDString;
    ticketNumber: number;
    office?: string | null;
    ticketTitle?: string | null;
    ticketLink?: string | null;
  } & Ticket_Key)[];
}

export interface ListTicketsVariables {
  limit?: number | null;
  offset?: number | null;
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
      office?: string | null;
      ticketTitle?: string | null;
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
  limit?: number | null;
  offset?: number | null;
}

export interface ListTimeEntriesByTicketData {
  timeEntries: ({
    id: UUIDString;
    startTime: TimestampString;
    endTime: TimestampString;
    date: DateString;
    description?: string | null;
    workLog?: {
      id: UUIDString;
      name: string;
    } & WorkLog_Key;
    createdAt: TimestampString;
  } & TimeEntry_Key)[];
}

export interface ListTimeEntriesByTicketVariables {
  ticketNumber: number;
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
      office?: string | null;
      ticketTitle?: string | null;
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
      office?: string | null;
      ticketTitle?: string | null;
      ticketLink?: string | null;
    } & Ticket_Key;
    officeNumber?: string | null;
    createdAt: TimestampString;
  } & TimeEntry_Key)[];
}

export interface ListTimeEntriesVariables {
  userId: UUIDString;
}

export interface ListUserTypesData {
  userTypes: ({
    id: UUIDString;
    name: string;
  } & UserType_Key)[];
}

export interface ListUsersData {
  users: ({
    id: UUIDString;
    username: string;
    email?: string | null;
    userType: {
      id: UUIDString;
      name: string;
    } & UserType_Key;
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

export interface ListWorkLogsVariables {
  limit?: number | null;
  offset?: number | null;
}

export interface RestoreWorkLogData {
  workLog_update?: WorkLog_Key | null;
}

export interface RestoreWorkLogVariables {
  workLogId: UUIDString;
}

export interface SelectMyBackgroundOpacityData {
  user_update?: User_Key | null;
}

export interface SelectMyBackgroundOpacityVariables {
  backgroundOpacity: number;
}

export interface SelectMyBordersEnabledData {
  user_update?: User_Key | null;
}

export interface SelectMyBordersEnabledVariables {
  bordersEnabled: boolean;
}

export interface SelectMyCardStyleData {
  user_update?: User_Key | null;
}

export interface SelectMyCardStyleVariables {
  cardOpacity: number;
  cardBlur: number;
}

export interface SelectMyColorSchemeData {
  user_update?: User_Key | null;
}

export interface SelectMyColorSchemeVariables {
  colorSchemeId: UUIDString;
}

export interface SelectMyExternalTicketLinkTemplateData {
  user_update?: User_Key | null;
}

export interface SelectMyExternalTicketLinkTemplateVariables {
  externalTicketLinkTemplate?: string | null;
}

export interface SelectMyPerformanceModeData {
  user_update?: User_Key | null;
}

export interface SelectMyPerformanceModeVariables {
  performanceMode: boolean;
}

export interface SetUserTypeData {
  user_update?: User_Key | null;
}

export interface SetUserTypeVariables {
  userId: UUIDString;
  userTypeName: string;
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

export interface UpdateTicketData {
  ticket_update?: Ticket_Key | null;
}

export interface UpdateTicketVariables {
  ticketNumber: number;
  office?: string | null;
  ticketTitle?: string | null;
  ticketLink?: string | null;
}

export interface UpdateTimeEntryClearTicketData {
  timeEntry_update?: TimeEntry_Key | null;
}

export interface UpdateTimeEntryClearTicketVariables {
  entryId: UUIDString;
  description?: string | null;
}

export interface UpdateTimeEntryData {
  timeEntry_update?: TimeEntry_Key | null;
}

export interface UpdateTimeEntryVariables {
  entryId: UUIDString;
  description?: string | null;
  ticketNumber: number;
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
  office?: string | null;
  ticketTitle?: string | null;
  ticketLink?: string | null;
}

export interface UserType_Key {
  name: string;
  __typename?: 'UserType_Key';
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

/** Generated Node Admin SDK operation action function for the 'SetUserType' Mutation. Allow users to execute without passing in DataConnect. */
export function setUserType(dc: DataConnect, vars: SetUserTypeVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<SetUserTypeData>>;
/** Generated Node Admin SDK operation action function for the 'SetUserType' Mutation. Allow users to pass in custom DataConnect instances. */
export function setUserType(vars: SetUserTypeVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<SetUserTypeData>>;

/** Generated Node Admin SDK operation action function for the 'CreateTimeEntry' Mutation. Allow users to execute without passing in DataConnect. */
export function createTimeEntry(dc: DataConnect, vars: CreateTimeEntryVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateTimeEntryData>>;
/** Generated Node Admin SDK operation action function for the 'CreateTimeEntry' Mutation. Allow users to pass in custom DataConnect instances. */
export function createTimeEntry(vars: CreateTimeEntryVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateTimeEntryData>>;

/** Generated Node Admin SDK operation action function for the 'CreateWorkLogOnly' Mutation. Allow users to execute without passing in DataConnect. */
export function createWorkLogOnly(dc: DataConnect, vars: CreateWorkLogOnlyVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateWorkLogOnlyData>>;
/** Generated Node Admin SDK operation action function for the 'CreateWorkLogOnly' Mutation. Allow users to pass in custom DataConnect instances. */
export function createWorkLogOnly(vars: CreateWorkLogOnlyVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateWorkLogOnlyData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateTimeEntry' Mutation. Allow users to execute without passing in DataConnect. */
export function updateTimeEntry(dc: DataConnect, vars: UpdateTimeEntryVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateTimeEntryData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateTimeEntry' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateTimeEntry(vars: UpdateTimeEntryVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateTimeEntryData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateTimeEntryClearTicket' Mutation. Allow users to execute without passing in DataConnect. */
export function updateTimeEntryClearTicket(dc: DataConnect, vars: UpdateTimeEntryClearTicketVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateTimeEntryClearTicketData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateTimeEntryClearTicket' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateTimeEntryClearTicket(vars: UpdateTimeEntryClearTicketVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateTimeEntryClearTicketData>>;

/** Generated Node Admin SDK operation action function for the 'DeleteTimeEntry' Mutation. Allow users to execute without passing in DataConnect. */
export function deleteTimeEntry(dc: DataConnect, vars: DeleteTimeEntryVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteTimeEntryData>>;
/** Generated Node Admin SDK operation action function for the 'DeleteTimeEntry' Mutation. Allow users to pass in custom DataConnect instances. */
export function deleteTimeEntry(vars: DeleteTimeEntryVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteTimeEntryData>>;

/** Generated Node Admin SDK operation action function for the 'UpsertTicket' Mutation. Allow users to execute without passing in DataConnect. */
export function upsertTicket(dc: DataConnect, vars: UpsertTicketVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertTicketData>>;
/** Generated Node Admin SDK operation action function for the 'UpsertTicket' Mutation. Allow users to pass in custom DataConnect instances. */
export function upsertTicket(vars: UpsertTicketVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertTicketData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateTicket' Mutation. Allow users to execute without passing in DataConnect. */
export function updateTicket(dc: DataConnect, vars: UpdateTicketVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateTicketData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateTicket' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateTicket(vars: UpdateTicketVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateTicketData>>;

/** Generated Node Admin SDK operation action function for the 'SelectMyColorScheme' Mutation. Allow users to execute without passing in DataConnect. */
export function selectMyColorScheme(dc: DataConnect, vars: SelectMyColorSchemeVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<SelectMyColorSchemeData>>;
/** Generated Node Admin SDK operation action function for the 'SelectMyColorScheme' Mutation. Allow users to pass in custom DataConnect instances. */
export function selectMyColorScheme(vars: SelectMyColorSchemeVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<SelectMyColorSchemeData>>;

/** Generated Node Admin SDK operation action function for the 'ClearMyColorScheme' Mutation. Allow users to execute without passing in DataConnect. */
export function clearMyColorScheme(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ClearMyColorSchemeData>>;
/** Generated Node Admin SDK operation action function for the 'ClearMyColorScheme' Mutation. Allow users to pass in custom DataConnect instances. */
export function clearMyColorScheme(options?: OperationOptions): Promise<ExecuteOperationResponse<ClearMyColorSchemeData>>;

/** Generated Node Admin SDK operation action function for the 'SelectMyPerformanceMode' Mutation. Allow users to execute without passing in DataConnect. */
export function selectMyPerformanceMode(dc: DataConnect, vars: SelectMyPerformanceModeVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<SelectMyPerformanceModeData>>;
/** Generated Node Admin SDK operation action function for the 'SelectMyPerformanceMode' Mutation. Allow users to pass in custom DataConnect instances. */
export function selectMyPerformanceMode(vars: SelectMyPerformanceModeVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<SelectMyPerformanceModeData>>;

/** Generated Node Admin SDK operation action function for the 'SelectMyBackgroundOpacity' Mutation. Allow users to execute without passing in DataConnect. */
export function selectMyBackgroundOpacity(dc: DataConnect, vars: SelectMyBackgroundOpacityVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<SelectMyBackgroundOpacityData>>;
/** Generated Node Admin SDK operation action function for the 'SelectMyBackgroundOpacity' Mutation. Allow users to pass in custom DataConnect instances. */
export function selectMyBackgroundOpacity(vars: SelectMyBackgroundOpacityVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<SelectMyBackgroundOpacityData>>;

/** Generated Node Admin SDK operation action function for the 'SelectMyExternalTicketLinkTemplate' Mutation. Allow users to execute without passing in DataConnect. */
export function selectMyExternalTicketLinkTemplate(dc: DataConnect, vars?: SelectMyExternalTicketLinkTemplateVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<SelectMyExternalTicketLinkTemplateData>>;
/** Generated Node Admin SDK operation action function for the 'SelectMyExternalTicketLinkTemplate' Mutation. Allow users to pass in custom DataConnect instances. */
export function selectMyExternalTicketLinkTemplate(vars?: SelectMyExternalTicketLinkTemplateVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<SelectMyExternalTicketLinkTemplateData>>;

/** Generated Node Admin SDK operation action function for the 'SelectMyCardStyle' Mutation. Allow users to execute without passing in DataConnect. */
export function selectMyCardStyle(dc: DataConnect, vars: SelectMyCardStyleVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<SelectMyCardStyleData>>;
/** Generated Node Admin SDK operation action function for the 'SelectMyCardStyle' Mutation. Allow users to pass in custom DataConnect instances. */
export function selectMyCardStyle(vars: SelectMyCardStyleVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<SelectMyCardStyleData>>;

/** Generated Node Admin SDK operation action function for the 'SelectMyBordersEnabled' Mutation. Allow users to execute without passing in DataConnect. */
export function selectMyBordersEnabled(dc: DataConnect, vars: SelectMyBordersEnabledVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<SelectMyBordersEnabledData>>;
/** Generated Node Admin SDK operation action function for the 'SelectMyBordersEnabled' Mutation. Allow users to pass in custom DataConnect instances. */
export function selectMyBordersEnabled(vars: SelectMyBordersEnabledVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<SelectMyBordersEnabledData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateWorkLog' Mutation. Allow users to execute without passing in DataConnect. */
export function updateWorkLog(dc: DataConnect, vars: UpdateWorkLogVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateWorkLogData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateWorkLog' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateWorkLog(vars: UpdateWorkLogVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateWorkLogData>>;

/** Generated Node Admin SDK operation action function for the 'DeleteWorkLog' Mutation. Allow users to execute without passing in DataConnect. */
export function deleteWorkLog(dc: DataConnect, vars: DeleteWorkLogVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteWorkLogData>>;
/** Generated Node Admin SDK operation action function for the 'DeleteWorkLog' Mutation. Allow users to pass in custom DataConnect instances. */
export function deleteWorkLog(vars: DeleteWorkLogVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteWorkLogData>>;

/** Generated Node Admin SDK operation action function for the 'RestoreWorkLog' Mutation. Allow users to execute without passing in DataConnect. */
export function restoreWorkLog(dc: DataConnect, vars: RestoreWorkLogVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<RestoreWorkLogData>>;
/** Generated Node Admin SDK operation action function for the 'RestoreWorkLog' Mutation. Allow users to pass in custom DataConnect instances. */
export function restoreWorkLog(vars: RestoreWorkLogVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<RestoreWorkLogData>>;

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

/** Generated Node Admin SDK operation action function for the 'ListColorSchemes' Query. Allow users to execute without passing in DataConnect. */
export function listColorSchemes(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListColorSchemesData>>;
/** Generated Node Admin SDK operation action function for the 'ListColorSchemes' Query. Allow users to pass in custom DataConnect instances. */
export function listColorSchemes(options?: OperationOptions): Promise<ExecuteOperationResponse<ListColorSchemesData>>;

/** Generated Node Admin SDK operation action function for the 'ListTickets' Query. Allow users to execute without passing in DataConnect. */
export function listTickets(dc: DataConnect, vars?: ListTicketsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListTicketsData>>;
/** Generated Node Admin SDK operation action function for the 'ListTickets' Query. Allow users to pass in custom DataConnect instances. */
export function listTickets(vars?: ListTicketsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListTicketsData>>;

/** Generated Node Admin SDK operation action function for the 'ListTimeEntries' Query. Allow users to execute without passing in DataConnect. */
export function listTimeEntries(dc: DataConnect, vars: ListTimeEntriesVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListTimeEntriesData>>;
/** Generated Node Admin SDK operation action function for the 'ListTimeEntries' Query. Allow users to pass in custom DataConnect instances. */
export function listTimeEntries(vars: ListTimeEntriesVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListTimeEntriesData>>;

/** Generated Node Admin SDK operation action function for the 'GetTimeEntry' Query. Allow users to execute without passing in DataConnect. */
export function getTimeEntry(dc: DataConnect, vars: GetTimeEntryVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetTimeEntryData>>;
/** Generated Node Admin SDK operation action function for the 'GetTimeEntry' Query. Allow users to pass in custom DataConnect instances. */
export function getTimeEntry(vars: GetTimeEntryVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetTimeEntryData>>;

/** Generated Node Admin SDK operation action function for the 'ListWorkLogs' Query. Allow users to execute without passing in DataConnect. */
export function listWorkLogs(dc: DataConnect, vars?: ListWorkLogsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListWorkLogsData>>;
/** Generated Node Admin SDK operation action function for the 'ListWorkLogs' Query. Allow users to pass in custom DataConnect instances. */
export function listWorkLogs(vars?: ListWorkLogsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListWorkLogsData>>;

/** Generated Node Admin SDK operation action function for the 'ListTimeEntriesByWorkLog' Query. Allow users to execute without passing in DataConnect. */
export function listTimeEntriesByWorkLog(dc: DataConnect, vars: ListTimeEntriesByWorkLogVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListTimeEntriesByWorkLogData>>;
/** Generated Node Admin SDK operation action function for the 'ListTimeEntriesByWorkLog' Query. Allow users to pass in custom DataConnect instances. */
export function listTimeEntriesByWorkLog(vars: ListTimeEntriesByWorkLogVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListTimeEntriesByWorkLogData>>;

/** Generated Node Admin SDK operation action function for the 'ListTimeEntriesByTicket' Query. Allow users to execute without passing in DataConnect. */
export function listTimeEntriesByTicket(dc: DataConnect, vars: ListTimeEntriesByTicketVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListTimeEntriesByTicketData>>;
/** Generated Node Admin SDK operation action function for the 'ListTimeEntriesByTicket' Query. Allow users to pass in custom DataConnect instances. */
export function listTimeEntriesByTicket(vars: ListTimeEntriesByTicketVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListTimeEntriesByTicketData>>;

/** Generated Node Admin SDK operation action function for the 'ListMyTimeEntries' Query. Allow users to execute without passing in DataConnect. */
export function listMyTimeEntries(dc: DataConnect, vars?: ListMyTimeEntriesVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListMyTimeEntriesData>>;
/** Generated Node Admin SDK operation action function for the 'ListMyTimeEntries' Query. Allow users to pass in custom DataConnect instances. */
export function listMyTimeEntries(vars?: ListMyTimeEntriesVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListMyTimeEntriesData>>;

/** Generated Node Admin SDK operation action function for the 'ListTimeEntriesByDateRange' Query. Allow users to execute without passing in DataConnect. */
export function listTimeEntriesByDateRange(dc: DataConnect, vars: ListTimeEntriesByDateRangeVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListTimeEntriesByDateRangeData>>;
/** Generated Node Admin SDK operation action function for the 'ListTimeEntriesByDateRange' Query. Allow users to pass in custom DataConnect instances. */
export function listTimeEntriesByDateRange(vars: ListTimeEntriesByDateRangeVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListTimeEntriesByDateRangeData>>;

/** Generated Node Admin SDK operation action function for the 'ListUserTypes' Query. Allow users to execute without passing in DataConnect. */
export function listUserTypes(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListUserTypesData>>;
/** Generated Node Admin SDK operation action function for the 'ListUserTypes' Query. Allow users to pass in custom DataConnect instances. */
export function listUserTypes(options?: OperationOptions): Promise<ExecuteOperationResponse<ListUserTypesData>>;

