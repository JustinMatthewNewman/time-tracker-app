import { CreateUserFromGoogleData, CreateUserFromGoogleVariables, CreateTimeEntryData, CreateTimeEntryVariables, UpdateTimeEntryData, UpdateTimeEntryVariables, DeleteTimeEntryData, DeleteTimeEntryVariables, CreateWorkLogData, CreateWorkLogVariables, ListUsersData, ListTimeEntriesData, ListTimeEntriesVariables, GetTimeEntryData, GetTimeEntryVariables, ListTimeEntriesByDateRangeData, ListTimeEntriesByDateRangeVariables } from '../';
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

export function useDeleteTimeEntry(options?: useDataConnectMutationOptions<DeleteTimeEntryData, FirebaseError, DeleteTimeEntryVariables>): UseDataConnectMutationResult<DeleteTimeEntryData, DeleteTimeEntryVariables>;
export function useDeleteTimeEntry(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteTimeEntryData, FirebaseError, DeleteTimeEntryVariables>): UseDataConnectMutationResult<DeleteTimeEntryData, DeleteTimeEntryVariables>;

export function useCreateWorkLog(options?: useDataConnectMutationOptions<CreateWorkLogData, FirebaseError, CreateWorkLogVariables>): UseDataConnectMutationResult<CreateWorkLogData, CreateWorkLogVariables>;
export function useCreateWorkLog(dc: DataConnect, options?: useDataConnectMutationOptions<CreateWorkLogData, FirebaseError, CreateWorkLogVariables>): UseDataConnectMutationResult<CreateWorkLogData, CreateWorkLogVariables>;

export function useListUsers(options?: useDataConnectQueryOptions<ListUsersData>): UseDataConnectQueryResult<ListUsersData, undefined>;
export function useListUsers(dc: DataConnect, options?: useDataConnectQueryOptions<ListUsersData>): UseDataConnectQueryResult<ListUsersData, undefined>;

export function useListTimeEntries(vars: ListTimeEntriesVariables, options?: useDataConnectQueryOptions<ListTimeEntriesData>): UseDataConnectQueryResult<ListTimeEntriesData, ListTimeEntriesVariables>;
export function useListTimeEntries(dc: DataConnect, vars: ListTimeEntriesVariables, options?: useDataConnectQueryOptions<ListTimeEntriesData>): UseDataConnectQueryResult<ListTimeEntriesData, ListTimeEntriesVariables>;

export function useGetTimeEntry(vars: GetTimeEntryVariables, options?: useDataConnectQueryOptions<GetTimeEntryData>): UseDataConnectQueryResult<GetTimeEntryData, GetTimeEntryVariables>;
export function useGetTimeEntry(dc: DataConnect, vars: GetTimeEntryVariables, options?: useDataConnectQueryOptions<GetTimeEntryData>): UseDataConnectQueryResult<GetTimeEntryData, GetTimeEntryVariables>;

export function useListTimeEntriesByDateRange(vars: ListTimeEntriesByDateRangeVariables, options?: useDataConnectQueryOptions<ListTimeEntriesByDateRangeData>): UseDataConnectQueryResult<ListTimeEntriesByDateRangeData, ListTimeEntriesByDateRangeVariables>;
export function useListTimeEntriesByDateRange(dc: DataConnect, vars: ListTimeEntriesByDateRangeVariables, options?: useDataConnectQueryOptions<ListTimeEntriesByDateRangeData>): UseDataConnectQueryResult<ListTimeEntriesByDateRangeData, ListTimeEntriesByDateRangeVariables>;
