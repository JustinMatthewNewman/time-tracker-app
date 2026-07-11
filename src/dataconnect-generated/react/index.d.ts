import { CreateUserFromGoogleData, CreateUserFromGoogleVariables, CreateTimeEntryData, CreateTimeEntryVariables, UpdateTimeEntryData, UpdateTimeEntryVariables, UpdateTimeEntryClearTicketData, UpdateTimeEntryClearTicketVariables, DeleteTimeEntryData, DeleteTimeEntryVariables, UpsertTicketData, UpsertTicketVariables, SelectMyThemeData, SelectMyThemeVariables, ClearMyThemeData, UpdateWorkLogData, UpdateWorkLogVariables, DeleteWorkLogData, DeleteWorkLogVariables, RestoreWorkLogData, RestoreWorkLogVariables, CreateWorkLogData, CreateWorkLogVariables, ListUsersData, GetMyUserData, ListThemesData, ListTimeEntriesData, ListTimeEntriesVariables, GetTimeEntryData, GetTimeEntryVariables, ListWorkLogsData, ListTimeEntriesByWorkLogData, ListTimeEntriesByWorkLogVariables, ListMyTimeEntriesData, ListTimeEntriesByDateRangeData, ListTimeEntriesByDateRangeVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateUserFromGoogle(options?: useDataConnectMutationOptions<CreateUserFromGoogleData, FirebaseError, CreateUserFromGoogleVariables>): UseDataConnectMutationResult<CreateUserFromGoogleData, CreateUserFromGoogleVariables>;
export function useCreateUserFromGoogle(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserFromGoogleData, FirebaseError, CreateUserFromGoogleVariables>): UseDataConnectMutationResult<CreateUserFromGoogleData, CreateUserFromGoogleVariables>;

export function useCreateTimeEntry(options?: useDataConnectMutationOptions<CreateTimeEntryData, FirebaseError, CreateTimeEntryVariables>): UseDataConnectMutationResult<CreateTimeEntryData, CreateTimeEntryVariables>;
export function useCreateTimeEntry(dc: DataConnect, options?: useDataConnectMutationOptions<CreateTimeEntryData, FirebaseError, CreateTimeEntryVariables>): UseDataConnectMutationResult<CreateTimeEntryData, CreateTimeEntryVariables>;

export function useUpdateTimeEntry(options?: useDataConnectMutationOptions<UpdateTimeEntryData, FirebaseError, UpdateTimeEntryVariables>): UseDataConnectMutationResult<UpdateTimeEntryData, UpdateTimeEntryVariables>;
export function useUpdateTimeEntry(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateTimeEntryData, FirebaseError, UpdateTimeEntryVariables>): UseDataConnectMutationResult<UpdateTimeEntryData, UpdateTimeEntryVariables>;

export function useUpdateTimeEntryClearTicket(options?: useDataConnectMutationOptions<UpdateTimeEntryClearTicketData, FirebaseError, UpdateTimeEntryClearTicketVariables>): UseDataConnectMutationResult<UpdateTimeEntryClearTicketData, UpdateTimeEntryClearTicketVariables>;
export function useUpdateTimeEntryClearTicket(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateTimeEntryClearTicketData, FirebaseError, UpdateTimeEntryClearTicketVariables>): UseDataConnectMutationResult<UpdateTimeEntryClearTicketData, UpdateTimeEntryClearTicketVariables>;

export function useDeleteTimeEntry(options?: useDataConnectMutationOptions<DeleteTimeEntryData, FirebaseError, DeleteTimeEntryVariables>): UseDataConnectMutationResult<DeleteTimeEntryData, DeleteTimeEntryVariables>;
export function useDeleteTimeEntry(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteTimeEntryData, FirebaseError, DeleteTimeEntryVariables>): UseDataConnectMutationResult<DeleteTimeEntryData, DeleteTimeEntryVariables>;

export function useUpsertTicket(options?: useDataConnectMutationOptions<UpsertTicketData, FirebaseError, UpsertTicketVariables>): UseDataConnectMutationResult<UpsertTicketData, UpsertTicketVariables>;
export function useUpsertTicket(dc: DataConnect, options?: useDataConnectMutationOptions<UpsertTicketData, FirebaseError, UpsertTicketVariables>): UseDataConnectMutationResult<UpsertTicketData, UpsertTicketVariables>;

export function useSelectMyTheme(options?: useDataConnectMutationOptions<SelectMyThemeData, FirebaseError, SelectMyThemeVariables>): UseDataConnectMutationResult<SelectMyThemeData, SelectMyThemeVariables>;
export function useSelectMyTheme(dc: DataConnect, options?: useDataConnectMutationOptions<SelectMyThemeData, FirebaseError, SelectMyThemeVariables>): UseDataConnectMutationResult<SelectMyThemeData, SelectMyThemeVariables>;

export function useClearMyTheme(options?: useDataConnectMutationOptions<ClearMyThemeData, FirebaseError, void>): UseDataConnectMutationResult<ClearMyThemeData, undefined>;
export function useClearMyTheme(dc: DataConnect, options?: useDataConnectMutationOptions<ClearMyThemeData, FirebaseError, void>): UseDataConnectMutationResult<ClearMyThemeData, undefined>;

export function useUpdateWorkLog(options?: useDataConnectMutationOptions<UpdateWorkLogData, FirebaseError, UpdateWorkLogVariables>): UseDataConnectMutationResult<UpdateWorkLogData, UpdateWorkLogVariables>;
export function useUpdateWorkLog(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateWorkLogData, FirebaseError, UpdateWorkLogVariables>): UseDataConnectMutationResult<UpdateWorkLogData, UpdateWorkLogVariables>;

export function useDeleteWorkLog(options?: useDataConnectMutationOptions<DeleteWorkLogData, FirebaseError, DeleteWorkLogVariables>): UseDataConnectMutationResult<DeleteWorkLogData, DeleteWorkLogVariables>;
export function useDeleteWorkLog(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteWorkLogData, FirebaseError, DeleteWorkLogVariables>): UseDataConnectMutationResult<DeleteWorkLogData, DeleteWorkLogVariables>;

export function useRestoreWorkLog(options?: useDataConnectMutationOptions<RestoreWorkLogData, FirebaseError, RestoreWorkLogVariables>): UseDataConnectMutationResult<RestoreWorkLogData, RestoreWorkLogVariables>;
export function useRestoreWorkLog(dc: DataConnect, options?: useDataConnectMutationOptions<RestoreWorkLogData, FirebaseError, RestoreWorkLogVariables>): UseDataConnectMutationResult<RestoreWorkLogData, RestoreWorkLogVariables>;

export function useCreateWorkLog(options?: useDataConnectMutationOptions<CreateWorkLogData, FirebaseError, CreateWorkLogVariables>): UseDataConnectMutationResult<CreateWorkLogData, CreateWorkLogVariables>;
export function useCreateWorkLog(dc: DataConnect, options?: useDataConnectMutationOptions<CreateWorkLogData, FirebaseError, CreateWorkLogVariables>): UseDataConnectMutationResult<CreateWorkLogData, CreateWorkLogVariables>;

export function useListUsers(options?: useDataConnectQueryOptions<ListUsersData>): UseDataConnectQueryResult<ListUsersData, undefined>;
export function useListUsers(dc: DataConnect, options?: useDataConnectQueryOptions<ListUsersData>): UseDataConnectQueryResult<ListUsersData, undefined>;

export function useGetMyUser(options?: useDataConnectQueryOptions<GetMyUserData>): UseDataConnectQueryResult<GetMyUserData, undefined>;
export function useGetMyUser(dc: DataConnect, options?: useDataConnectQueryOptions<GetMyUserData>): UseDataConnectQueryResult<GetMyUserData, undefined>;

export function useListThemes(options?: useDataConnectQueryOptions<ListThemesData>): UseDataConnectQueryResult<ListThemesData, undefined>;
export function useListThemes(dc: DataConnect, options?: useDataConnectQueryOptions<ListThemesData>): UseDataConnectQueryResult<ListThemesData, undefined>;

export function useListTimeEntries(vars: ListTimeEntriesVariables, options?: useDataConnectQueryOptions<ListTimeEntriesData>): UseDataConnectQueryResult<ListTimeEntriesData, ListTimeEntriesVariables>;
export function useListTimeEntries(dc: DataConnect, vars: ListTimeEntriesVariables, options?: useDataConnectQueryOptions<ListTimeEntriesData>): UseDataConnectQueryResult<ListTimeEntriesData, ListTimeEntriesVariables>;

export function useGetTimeEntry(vars: GetTimeEntryVariables, options?: useDataConnectQueryOptions<GetTimeEntryData>): UseDataConnectQueryResult<GetTimeEntryData, GetTimeEntryVariables>;
export function useGetTimeEntry(dc: DataConnect, vars: GetTimeEntryVariables, options?: useDataConnectQueryOptions<GetTimeEntryData>): UseDataConnectQueryResult<GetTimeEntryData, GetTimeEntryVariables>;

export function useListWorkLogs(options?: useDataConnectQueryOptions<ListWorkLogsData>): UseDataConnectQueryResult<ListWorkLogsData, undefined>;
export function useListWorkLogs(dc: DataConnect, options?: useDataConnectQueryOptions<ListWorkLogsData>): UseDataConnectQueryResult<ListWorkLogsData, undefined>;

export function useListTimeEntriesByWorkLog(vars: ListTimeEntriesByWorkLogVariables, options?: useDataConnectQueryOptions<ListTimeEntriesByWorkLogData>): UseDataConnectQueryResult<ListTimeEntriesByWorkLogData, ListTimeEntriesByWorkLogVariables>;
export function useListTimeEntriesByWorkLog(dc: DataConnect, vars: ListTimeEntriesByWorkLogVariables, options?: useDataConnectQueryOptions<ListTimeEntriesByWorkLogData>): UseDataConnectQueryResult<ListTimeEntriesByWorkLogData, ListTimeEntriesByWorkLogVariables>;

export function useListMyTimeEntries(options?: useDataConnectQueryOptions<ListMyTimeEntriesData>): UseDataConnectQueryResult<ListMyTimeEntriesData, undefined>;
export function useListMyTimeEntries(dc: DataConnect, options?: useDataConnectQueryOptions<ListMyTimeEntriesData>): UseDataConnectQueryResult<ListMyTimeEntriesData, undefined>;

export function useListTimeEntriesByDateRange(vars: ListTimeEntriesByDateRangeVariables, options?: useDataConnectQueryOptions<ListTimeEntriesByDateRangeData>): UseDataConnectQueryResult<ListTimeEntriesByDateRangeData, ListTimeEntriesByDateRangeVariables>;
export function useListTimeEntriesByDateRange(dc: DataConnect, vars: ListTimeEntriesByDateRangeVariables, options?: useDataConnectQueryOptions<ListTimeEntriesByDateRangeData>): UseDataConnectQueryResult<ListTimeEntriesByDateRangeData, ListTimeEntriesByDateRangeVariables>;
