import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AdminGetUserData {
  user?: {
    id: UUIDString;
    username: string;
    email?: string | null;
    userType: {
      name: string;
    } & UserType_Key;
  } & User_Key;
}

export interface AdminGetUserVariables {
  userId: UUIDString;
}

export interface AdminListFeaturesData {
  features: ({
    id: UUIDString;
    name: string;
    description?: string | null;
  } & Feature_Key)[];
}

export interface AdminListTeamsData {
  teams: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    createdAt: TimestampString;
    members: ({
      user: {
        id: UUIDString;
        username: string;
        email?: string | null;
        userType: {
          name: string;
        } & UserType_Key;
      } & User_Key;
    })[];
  } & Team_Key)[];
}

export interface AdminListUserTypesData {
  userTypes: ({
    id: UUIDString;
    name: string;
    features: ({
      name: string;
      description?: string | null;
    } & Feature_Key)[];
  } & UserType_Key)[];
}

export interface AdminListUsersData {
  users: ({
    id: UUIDString;
    username: string;
    email?: string | null;
    createdAt: TimestampString;
    userType: {
      name: string;
    } & UserType_Key;
  } & User_Key)[];
}

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

export interface Feature_Key {
  name: string;
  __typename?: 'Feature_Key';
}

export interface GetMyUserData {
  user?: {
    id: UUIDString;
    userType: {
      name: string;
      features: ({
        name: string;
      } & Feature_Key)[];
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

export interface GetUserAccessByGoogleUidData {
  user?: {
    id: UUIDString;
    username: string;
    email?: string | null;
    userType: {
      name: string;
      features: ({
        name: string;
      } & Feature_Key)[];
    } & UserType_Key;
  } & User_Key;
}

export interface GetUserAccessByGoogleUidVariables {
  googleUid: string;
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

export interface TeamMember_Key {
  teamId: UUIDString;
  userId: UUIDString;
  __typename?: 'TeamMember_Key';
}

export interface Team_Key {
  id: UUIDString;
  __typename?: 'Team_Key';
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

export interface UserTypeFeature_Key {
  userTypeName: string;
  featureName: string;
  __typename?: 'UserTypeFeature_Key';
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

interface SetUserTypeRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SetUserTypeVariables): MutationRef<SetUserTypeData, SetUserTypeVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SetUserTypeVariables): MutationRef<SetUserTypeData, SetUserTypeVariables>;
  operationName: string;
}
export const setUserTypeRef: SetUserTypeRef;

export function setUserType(vars: SetUserTypeVariables): MutationPromise<SetUserTypeData, SetUserTypeVariables>;
export function setUserType(dc: DataConnect, vars: SetUserTypeVariables): MutationPromise<SetUserTypeData, SetUserTypeVariables>;

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

interface CreateWorkLogOnlyRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateWorkLogOnlyVariables): MutationRef<CreateWorkLogOnlyData, CreateWorkLogOnlyVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateWorkLogOnlyVariables): MutationRef<CreateWorkLogOnlyData, CreateWorkLogOnlyVariables>;
  operationName: string;
}
export const createWorkLogOnlyRef: CreateWorkLogOnlyRef;

export function createWorkLogOnly(vars: CreateWorkLogOnlyVariables): MutationPromise<CreateWorkLogOnlyData, CreateWorkLogOnlyVariables>;
export function createWorkLogOnly(dc: DataConnect, vars: CreateWorkLogOnlyVariables): MutationPromise<CreateWorkLogOnlyData, CreateWorkLogOnlyVariables>;

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

interface UpdateTicketRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTicketVariables): MutationRef<UpdateTicketData, UpdateTicketVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateTicketVariables): MutationRef<UpdateTicketData, UpdateTicketVariables>;
  operationName: string;
}
export const updateTicketRef: UpdateTicketRef;

export function updateTicket(vars: UpdateTicketVariables): MutationPromise<UpdateTicketData, UpdateTicketVariables>;
export function updateTicket(dc: DataConnect, vars: UpdateTicketVariables): MutationPromise<UpdateTicketData, UpdateTicketVariables>;

interface SelectMyColorSchemeRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SelectMyColorSchemeVariables): MutationRef<SelectMyColorSchemeData, SelectMyColorSchemeVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SelectMyColorSchemeVariables): MutationRef<SelectMyColorSchemeData, SelectMyColorSchemeVariables>;
  operationName: string;
}
export const selectMyColorSchemeRef: SelectMyColorSchemeRef;

export function selectMyColorScheme(vars: SelectMyColorSchemeVariables): MutationPromise<SelectMyColorSchemeData, SelectMyColorSchemeVariables>;
export function selectMyColorScheme(dc: DataConnect, vars: SelectMyColorSchemeVariables): MutationPromise<SelectMyColorSchemeData, SelectMyColorSchemeVariables>;

interface ClearMyColorSchemeRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<ClearMyColorSchemeData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<ClearMyColorSchemeData, undefined>;
  operationName: string;
}
export const clearMyColorSchemeRef: ClearMyColorSchemeRef;

export function clearMyColorScheme(): MutationPromise<ClearMyColorSchemeData, undefined>;
export function clearMyColorScheme(dc: DataConnect): MutationPromise<ClearMyColorSchemeData, undefined>;

interface SelectMyPerformanceModeRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SelectMyPerformanceModeVariables): MutationRef<SelectMyPerformanceModeData, SelectMyPerformanceModeVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SelectMyPerformanceModeVariables): MutationRef<SelectMyPerformanceModeData, SelectMyPerformanceModeVariables>;
  operationName: string;
}
export const selectMyPerformanceModeRef: SelectMyPerformanceModeRef;

export function selectMyPerformanceMode(vars: SelectMyPerformanceModeVariables): MutationPromise<SelectMyPerformanceModeData, SelectMyPerformanceModeVariables>;
export function selectMyPerformanceMode(dc: DataConnect, vars: SelectMyPerformanceModeVariables): MutationPromise<SelectMyPerformanceModeData, SelectMyPerformanceModeVariables>;

interface SelectMyBackgroundOpacityRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SelectMyBackgroundOpacityVariables): MutationRef<SelectMyBackgroundOpacityData, SelectMyBackgroundOpacityVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SelectMyBackgroundOpacityVariables): MutationRef<SelectMyBackgroundOpacityData, SelectMyBackgroundOpacityVariables>;
  operationName: string;
}
export const selectMyBackgroundOpacityRef: SelectMyBackgroundOpacityRef;

export function selectMyBackgroundOpacity(vars: SelectMyBackgroundOpacityVariables): MutationPromise<SelectMyBackgroundOpacityData, SelectMyBackgroundOpacityVariables>;
export function selectMyBackgroundOpacity(dc: DataConnect, vars: SelectMyBackgroundOpacityVariables): MutationPromise<SelectMyBackgroundOpacityData, SelectMyBackgroundOpacityVariables>;

interface SelectMyExternalTicketLinkTemplateRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: SelectMyExternalTicketLinkTemplateVariables): MutationRef<SelectMyExternalTicketLinkTemplateData, SelectMyExternalTicketLinkTemplateVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: SelectMyExternalTicketLinkTemplateVariables): MutationRef<SelectMyExternalTicketLinkTemplateData, SelectMyExternalTicketLinkTemplateVariables>;
  operationName: string;
}
export const selectMyExternalTicketLinkTemplateRef: SelectMyExternalTicketLinkTemplateRef;

export function selectMyExternalTicketLinkTemplate(vars?: SelectMyExternalTicketLinkTemplateVariables): MutationPromise<SelectMyExternalTicketLinkTemplateData, SelectMyExternalTicketLinkTemplateVariables>;
export function selectMyExternalTicketLinkTemplate(dc: DataConnect, vars?: SelectMyExternalTicketLinkTemplateVariables): MutationPromise<SelectMyExternalTicketLinkTemplateData, SelectMyExternalTicketLinkTemplateVariables>;

interface SelectMyCardStyleRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SelectMyCardStyleVariables): MutationRef<SelectMyCardStyleData, SelectMyCardStyleVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SelectMyCardStyleVariables): MutationRef<SelectMyCardStyleData, SelectMyCardStyleVariables>;
  operationName: string;
}
export const selectMyCardStyleRef: SelectMyCardStyleRef;

export function selectMyCardStyle(vars: SelectMyCardStyleVariables): MutationPromise<SelectMyCardStyleData, SelectMyCardStyleVariables>;
export function selectMyCardStyle(dc: DataConnect, vars: SelectMyCardStyleVariables): MutationPromise<SelectMyCardStyleData, SelectMyCardStyleVariables>;

interface SelectMyBordersEnabledRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SelectMyBordersEnabledVariables): MutationRef<SelectMyBordersEnabledData, SelectMyBordersEnabledVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SelectMyBordersEnabledVariables): MutationRef<SelectMyBordersEnabledData, SelectMyBordersEnabledVariables>;
  operationName: string;
}
export const selectMyBordersEnabledRef: SelectMyBordersEnabledRef;

export function selectMyBordersEnabled(vars: SelectMyBordersEnabledVariables): MutationPromise<SelectMyBordersEnabledData, SelectMyBordersEnabledVariables>;
export function selectMyBordersEnabled(dc: DataConnect, vars: SelectMyBordersEnabledVariables): MutationPromise<SelectMyBordersEnabledData, SelectMyBordersEnabledVariables>;

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

interface ListColorSchemesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListColorSchemesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListColorSchemesData, undefined>;
  operationName: string;
}
export const listColorSchemesRef: ListColorSchemesRef;

export function listColorSchemes(options?: ExecuteQueryOptions): QueryPromise<ListColorSchemesData, undefined>;
export function listColorSchemes(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListColorSchemesData, undefined>;

interface ListTicketsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListTicketsVariables): QueryRef<ListTicketsData, ListTicketsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: ListTicketsVariables): QueryRef<ListTicketsData, ListTicketsVariables>;
  operationName: string;
}
export const listTicketsRef: ListTicketsRef;

export function listTickets(vars?: ListTicketsVariables, options?: ExecuteQueryOptions): QueryPromise<ListTicketsData, ListTicketsVariables>;
export function listTickets(dc: DataConnect, vars?: ListTicketsVariables, options?: ExecuteQueryOptions): QueryPromise<ListTicketsData, ListTicketsVariables>;

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
  (vars?: ListWorkLogsVariables): QueryRef<ListWorkLogsData, ListWorkLogsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: ListWorkLogsVariables): QueryRef<ListWorkLogsData, ListWorkLogsVariables>;
  operationName: string;
}
export const listWorkLogsRef: ListWorkLogsRef;

export function listWorkLogs(vars?: ListWorkLogsVariables, options?: ExecuteQueryOptions): QueryPromise<ListWorkLogsData, ListWorkLogsVariables>;
export function listWorkLogs(dc: DataConnect, vars?: ListWorkLogsVariables, options?: ExecuteQueryOptions): QueryPromise<ListWorkLogsData, ListWorkLogsVariables>;

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

interface ListTimeEntriesByTicketRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListTimeEntriesByTicketVariables): QueryRef<ListTimeEntriesByTicketData, ListTimeEntriesByTicketVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListTimeEntriesByTicketVariables): QueryRef<ListTimeEntriesByTicketData, ListTimeEntriesByTicketVariables>;
  operationName: string;
}
export const listTimeEntriesByTicketRef: ListTimeEntriesByTicketRef;

export function listTimeEntriesByTicket(vars: ListTimeEntriesByTicketVariables, options?: ExecuteQueryOptions): QueryPromise<ListTimeEntriesByTicketData, ListTimeEntriesByTicketVariables>;
export function listTimeEntriesByTicket(dc: DataConnect, vars: ListTimeEntriesByTicketVariables, options?: ExecuteQueryOptions): QueryPromise<ListTimeEntriesByTicketData, ListTimeEntriesByTicketVariables>;

interface ListMyTimeEntriesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListMyTimeEntriesVariables): QueryRef<ListMyTimeEntriesData, ListMyTimeEntriesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: ListMyTimeEntriesVariables): QueryRef<ListMyTimeEntriesData, ListMyTimeEntriesVariables>;
  operationName: string;
}
export const listMyTimeEntriesRef: ListMyTimeEntriesRef;

export function listMyTimeEntries(vars?: ListMyTimeEntriesVariables, options?: ExecuteQueryOptions): QueryPromise<ListMyTimeEntriesData, ListMyTimeEntriesVariables>;
export function listMyTimeEntries(dc: DataConnect, vars?: ListMyTimeEntriesVariables, options?: ExecuteQueryOptions): QueryPromise<ListMyTimeEntriesData, ListMyTimeEntriesVariables>;

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

interface ListUserTypesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUserTypesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListUserTypesData, undefined>;
  operationName: string;
}
export const listUserTypesRef: ListUserTypesRef;

export function listUserTypes(options?: ExecuteQueryOptions): QueryPromise<ListUserTypesData, undefined>;
export function listUserTypes(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListUserTypesData, undefined>;

interface GetUserAccessByGoogleUidRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserAccessByGoogleUidVariables): QueryRef<GetUserAccessByGoogleUidData, GetUserAccessByGoogleUidVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserAccessByGoogleUidVariables): QueryRef<GetUserAccessByGoogleUidData, GetUserAccessByGoogleUidVariables>;
  operationName: string;
}
export const getUserAccessByGoogleUidRef: GetUserAccessByGoogleUidRef;

export function getUserAccessByGoogleUid(vars: GetUserAccessByGoogleUidVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserAccessByGoogleUidData, GetUserAccessByGoogleUidVariables>;
export function getUserAccessByGoogleUid(dc: DataConnect, vars: GetUserAccessByGoogleUidVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserAccessByGoogleUidData, GetUserAccessByGoogleUidVariables>;

interface AdminListUsersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<AdminListUsersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<AdminListUsersData, undefined>;
  operationName: string;
}
export const adminListUsersRef: AdminListUsersRef;

export function adminListUsers(options?: ExecuteQueryOptions): QueryPromise<AdminListUsersData, undefined>;
export function adminListUsers(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<AdminListUsersData, undefined>;

interface AdminListUserTypesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<AdminListUserTypesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<AdminListUserTypesData, undefined>;
  operationName: string;
}
export const adminListUserTypesRef: AdminListUserTypesRef;

export function adminListUserTypes(options?: ExecuteQueryOptions): QueryPromise<AdminListUserTypesData, undefined>;
export function adminListUserTypes(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<AdminListUserTypesData, undefined>;

interface AdminListFeaturesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<AdminListFeaturesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<AdminListFeaturesData, undefined>;
  operationName: string;
}
export const adminListFeaturesRef: AdminListFeaturesRef;

export function adminListFeatures(options?: ExecuteQueryOptions): QueryPromise<AdminListFeaturesData, undefined>;
export function adminListFeatures(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<AdminListFeaturesData, undefined>;

interface AdminGetUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AdminGetUserVariables): QueryRef<AdminGetUserData, AdminGetUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AdminGetUserVariables): QueryRef<AdminGetUserData, AdminGetUserVariables>;
  operationName: string;
}
export const adminGetUserRef: AdminGetUserRef;

export function adminGetUser(vars: AdminGetUserVariables, options?: ExecuteQueryOptions): QueryPromise<AdminGetUserData, AdminGetUserVariables>;
export function adminGetUser(dc: DataConnect, vars: AdminGetUserVariables, options?: ExecuteQueryOptions): QueryPromise<AdminGetUserData, AdminGetUserVariables>;

interface AdminListTeamsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<AdminListTeamsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<AdminListTeamsData, undefined>;
  operationName: string;
}
export const adminListTeamsRef: AdminListTeamsRef;

export function adminListTeams(options?: ExecuteQueryOptions): QueryPromise<AdminListTeamsData, undefined>;
export function adminListTeams(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<AdminListTeamsData, undefined>;

