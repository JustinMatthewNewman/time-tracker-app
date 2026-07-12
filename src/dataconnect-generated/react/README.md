# Generated React README
This README will guide you through the process of using the generated React SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `JavaScript README`, you can find it at [`dataconnect-generated/README.md`](../README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

You can use this generated SDK by importing from the package `@dataconnect/generated/react` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#react).

# Table of Contents
- [**Overview**](#generated-react-readme)
- [**TanStack Query Firebase & TanStack React Query**](#tanstack-query-firebase-tanstack-react-query)
  - [*Package Installation*](#installing-tanstack-query-firebase-and-tanstack-react-query-packages)
  - [*Configuring TanStack Query*](#configuring-tanstack-query)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListUsers*](#listusers)
  - [*GetMyUser*](#getmyuser)
  - [*ListColorSchemes*](#listcolorschemes)
  - [*ListTickets*](#listtickets)
  - [*ListTimeEntries*](#listtimeentries)
  - [*GetTimeEntry*](#gettimeentry)
  - [*ListWorkLogs*](#listworklogs)
  - [*ListTimeEntriesByWorkLog*](#listtimeentriesbyworklog)
  - [*ListMyTimeEntries*](#listmytimeentries)
  - [*ListTimeEntriesByDateRange*](#listtimeentriesbydaterange)
- [**Mutations**](#mutations)
  - [*CreateUserFromGoogle*](#createuserfromgoogle)
  - [*CreateTimeEntry*](#createtimeentry)
  - [*UpdateTimeEntry*](#updatetimeentry)
  - [*UpdateTimeEntryClearTicket*](#updatetimeentryclearticket)
  - [*DeleteTimeEntry*](#deletetimeentry)
  - [*UpsertTicket*](#upsertticket)
  - [*UpdateTicket*](#updateticket)
  - [*SelectMyColorScheme*](#selectmycolorscheme)
  - [*ClearMyColorScheme*](#clearmycolorscheme)
  - [*UpdateWorkLog*](#updateworklog)
  - [*DeleteWorkLog*](#deleteworklog)
  - [*RestoreWorkLog*](#restoreworklog)
  - [*CreateWorkLog*](#createworklog)

# TanStack Query Firebase & TanStack React Query
This SDK provides [React](https://react.dev/) hooks generated specific to your application, for the operations found in the connector `example`. These hooks are generated using [TanStack Query Firebase](https://react-query-firebase.invertase.dev/) by our partners at Invertase, a library built on top of [TanStack React Query v5](https://tanstack.com/query/v5/docs/framework/react/overview).

***You do not need to be familiar with Tanstack Query or Tanstack Query Firebase to use this SDK.*** However, you may find it useful to learn more about them, as they will empower you as a user of this Generated React SDK.

## Installing TanStack Query Firebase and TanStack React Query Packages
In order to use the React generated SDK, you must install the `TanStack React Query` and `TanStack Query Firebase` packages.
```bash
npm i --save @tanstack/react-query @tanstack-query-firebase/react
```
```bash
npm i --save firebase@latest # Note: React has a peer dependency on ^11.3.0
```

You can also follow the installation instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#tanstack-install), or the [TanStack Query Firebase documentation](https://react-query-firebase.invertase.dev/react) and [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/installation).

## Configuring TanStack Query
In order to use the React generated SDK in your application, you must wrap your application's component tree in a `QueryClientProvider` component from TanStack React Query. None of your generated React SDK hooks will work without this provider.

```javascript
import { QueryClientProvider } from '@tanstack/react-query';

// Create a TanStack Query client instance
const queryClient = new QueryClient()

function App() {
  return (
    // Provide the client to your App
    <QueryClientProvider client={queryClient}>
      <MyApplication />
    </QueryClientProvider>
  )
}
```

To learn more about `QueryClientProvider`, see the [TanStack React Query documentation](https://tanstack.com/query/latest/docs/framework/react/quick-start) and the [TanStack Query Firebase documentation](https://invertase.docs.page/tanstack-query-firebase/react#usage).

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`.

You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#emulator-react-angular).

```javascript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) using the hooks provided from your generated React SDK.

# Queries

The React generated SDK provides Query hook functions that call and return [`useDataConnectQuery`](https://react-query-firebase.invertase.dev/react/data-connect/querying) hooks from TanStack Query Firebase.

Calling these hook functions will return a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and the most recent data returned by the Query, among other things. To learn more about these hooks and how to use them, see the [TanStack Query Firebase documentation](https://react-query-firebase.invertase.dev/react/data-connect/querying).

TanStack React Query caches the results of your Queries, so using the same Query hook function in multiple places in your application allows the entire application to automatically see updates to that Query's data.

Query hooks execute their Queries automatically when called, and periodically refresh, unless you change the `queryOptions` for the Query. To learn how to stop a Query from automatically executing, including how to make a query "lazy", see the [TanStack React Query documentation](https://tanstack.com/query/latest/docs/framework/react/guides/disabling-queries).

To learn more about TanStack React Query's Queries, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/guides/queries).

## Using Query Hooks
Here's a general overview of how to use the generated Query hooks in your code:

- If the Query has no variables, the Query hook function does not require arguments.
- If the Query has any required variables, the Query hook function will require at least one argument: an object that contains all the required variables for the Query.
- If the Query has some required and some optional variables, only required variables are necessary in the variables argument object, and optional variables may be provided as well.
- If all of the Query's variables are optional, the Query hook function does not require any arguments.
- Query hook functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.
- Query hooks functions can be called with or without passing in an `options` argument of type `useDataConnectQueryOptions`. To learn more about the `options` argument, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/guides/query-options).
  - ***Special case:***  If the Query has all optional variables and you would like to provide an `options` argument to the Query hook function without providing any variables, you must pass `undefined` where you would normally pass the Query's variables, and then may provide the `options` argument.

Below are examples of how to use the `example` connector's generated Query hook functions to execute each Query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#operations-react-angular).

## ListUsers
You can execute the `ListUsers` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListUsers(dc: DataConnect, options?: useDataConnectQueryOptions<ListUsersData>): UseDataConnectQueryResult<ListUsersData, undefined>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListUsers(options?: useDataConnectQueryOptions<ListUsersData>): UseDataConnectQueryResult<ListUsersData, undefined>;
```

### Variables
The `ListUsers` Query has no variables.
### Return Type
Recall that calling the `ListUsers` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListUsers` Query is of type `ListUsersData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface ListUsersData {
  users: ({
    id: UUIDString;
    username: string;
    email?: string | null;
    createdAt: TimestampString;
  } & User_Key)[];
}
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListUsers`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';
import { useListUsers } from '@dataconnect/generated/react'

export default function ListUsersComponent() {
  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListUsers();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListUsers(dataConnect);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListUsers(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListUsers(dataConnect, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.users);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## GetMyUser
You can execute the `GetMyUser` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useGetMyUser(dc: DataConnect, options?: useDataConnectQueryOptions<GetMyUserData>): UseDataConnectQueryResult<GetMyUserData, undefined>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useGetMyUser(options?: useDataConnectQueryOptions<GetMyUserData>): UseDataConnectQueryResult<GetMyUserData, undefined>;
```

### Variables
The `GetMyUser` Query has no variables.
### Return Type
Recall that calling the `GetMyUser` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `GetMyUser` Query is of type `GetMyUserData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface GetMyUserData {
  user?: {
    id: UUIDString;
    colorScheme?: {
      id: UUIDString;
      name: string;
    } & ColorScheme_Key;
  } & User_Key;
}
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `GetMyUser`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';
import { useGetMyUser } from '@dataconnect/generated/react'

export default function GetMyUserComponent() {
  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useGetMyUser();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useGetMyUser(dataConnect);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useGetMyUser(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useGetMyUser(dataConnect, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.user);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListColorSchemes
You can execute the `ListColorSchemes` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListColorSchemes(dc: DataConnect, options?: useDataConnectQueryOptions<ListColorSchemesData>): UseDataConnectQueryResult<ListColorSchemesData, undefined>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListColorSchemes(options?: useDataConnectQueryOptions<ListColorSchemesData>): UseDataConnectQueryResult<ListColorSchemesData, undefined>;
```

### Variables
The `ListColorSchemes` Query has no variables.
### Return Type
Recall that calling the `ListColorSchemes` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListColorSchemes` Query is of type `ListColorSchemesData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListColorSchemes`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';
import { useListColorSchemes } from '@dataconnect/generated/react'

export default function ListColorSchemesComponent() {
  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListColorSchemes();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListColorSchemes(dataConnect);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListColorSchemes(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListColorSchemes(dataConnect, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.colorSchemes);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListTickets
You can execute the `ListTickets` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListTickets(dc: DataConnect, options?: useDataConnectQueryOptions<ListTicketsData>): UseDataConnectQueryResult<ListTicketsData, undefined>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListTickets(options?: useDataConnectQueryOptions<ListTicketsData>): UseDataConnectQueryResult<ListTicketsData, undefined>;
```

### Variables
The `ListTickets` Query has no variables.
### Return Type
Recall that calling the `ListTickets` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListTickets` Query is of type `ListTicketsData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface ListTicketsData {
  tickets: ({
    id: UUIDString;
    ticketNumber: number;
    office?: string | null;
    ticketTitle?: string | null;
    ticketLink?: string | null;
  } & Ticket_Key)[];
}
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListTickets`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';
import { useListTickets } from '@dataconnect/generated/react'

export default function ListTicketsComponent() {
  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListTickets();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListTickets(dataConnect);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListTickets(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListTickets(dataConnect, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.tickets);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListTimeEntries
You can execute the `ListTimeEntries` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListTimeEntries(dc: DataConnect, vars: ListTimeEntriesVariables, options?: useDataConnectQueryOptions<ListTimeEntriesData>): UseDataConnectQueryResult<ListTimeEntriesData, ListTimeEntriesVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListTimeEntries(vars: ListTimeEntriesVariables, options?: useDataConnectQueryOptions<ListTimeEntriesData>): UseDataConnectQueryResult<ListTimeEntriesData, ListTimeEntriesVariables>;
```

### Variables
The `ListTimeEntries` Query requires an argument of type `ListTimeEntriesVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface ListTimeEntriesVariables {
  userId: UUIDString;
}
```
### Return Type
Recall that calling the `ListTimeEntries` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListTimeEntries` Query is of type `ListTimeEntriesData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListTimeEntries`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, ListTimeEntriesVariables } from '@dataconnect/generated';
import { useListTimeEntries } from '@dataconnect/generated/react'

export default function ListTimeEntriesComponent() {
  // The `useListTimeEntries` Query hook requires an argument of type `ListTimeEntriesVariables`:
  const listTimeEntriesVars: ListTimeEntriesVariables = {
    userId: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListTimeEntries(listTimeEntriesVars);
  // Variables can be defined inline as well.
  const query = useListTimeEntries({ userId: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListTimeEntries(dataConnect, listTimeEntriesVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListTimeEntries(listTimeEntriesVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListTimeEntries(dataConnect, listTimeEntriesVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.timeEntries);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## GetTimeEntry
You can execute the `GetTimeEntry` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useGetTimeEntry(dc: DataConnect, vars: GetTimeEntryVariables, options?: useDataConnectQueryOptions<GetTimeEntryData>): UseDataConnectQueryResult<GetTimeEntryData, GetTimeEntryVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useGetTimeEntry(vars: GetTimeEntryVariables, options?: useDataConnectQueryOptions<GetTimeEntryData>): UseDataConnectQueryResult<GetTimeEntryData, GetTimeEntryVariables>;
```

### Variables
The `GetTimeEntry` Query requires an argument of type `GetTimeEntryVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface GetTimeEntryVariables {
  entryId: UUIDString;
}
```
### Return Type
Recall that calling the `GetTimeEntry` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `GetTimeEntry` Query is of type `GetTimeEntryData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `GetTimeEntry`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, GetTimeEntryVariables } from '@dataconnect/generated';
import { useGetTimeEntry } from '@dataconnect/generated/react'

export default function GetTimeEntryComponent() {
  // The `useGetTimeEntry` Query hook requires an argument of type `GetTimeEntryVariables`:
  const getTimeEntryVars: GetTimeEntryVariables = {
    entryId: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useGetTimeEntry(getTimeEntryVars);
  // Variables can be defined inline as well.
  const query = useGetTimeEntry({ entryId: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useGetTimeEntry(dataConnect, getTimeEntryVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useGetTimeEntry(getTimeEntryVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useGetTimeEntry(dataConnect, getTimeEntryVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.timeEntry);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListWorkLogs
You can execute the `ListWorkLogs` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListWorkLogs(dc: DataConnect, options?: useDataConnectQueryOptions<ListWorkLogsData>): UseDataConnectQueryResult<ListWorkLogsData, undefined>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListWorkLogs(options?: useDataConnectQueryOptions<ListWorkLogsData>): UseDataConnectQueryResult<ListWorkLogsData, undefined>;
```

### Variables
The `ListWorkLogs` Query has no variables.
### Return Type
Recall that calling the `ListWorkLogs` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListWorkLogs` Query is of type `ListWorkLogsData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface ListWorkLogsData {
  workLogs: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    workLogDate: TimestampString;
    createdAt: TimestampString;
  } & WorkLog_Key)[];
}
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListWorkLogs`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';
import { useListWorkLogs } from '@dataconnect/generated/react'

export default function ListWorkLogsComponent() {
  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListWorkLogs();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListWorkLogs(dataConnect);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListWorkLogs(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListWorkLogs(dataConnect, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.workLogs);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListTimeEntriesByWorkLog
You can execute the `ListTimeEntriesByWorkLog` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListTimeEntriesByWorkLog(dc: DataConnect, vars: ListTimeEntriesByWorkLogVariables, options?: useDataConnectQueryOptions<ListTimeEntriesByWorkLogData>): UseDataConnectQueryResult<ListTimeEntriesByWorkLogData, ListTimeEntriesByWorkLogVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListTimeEntriesByWorkLog(vars: ListTimeEntriesByWorkLogVariables, options?: useDataConnectQueryOptions<ListTimeEntriesByWorkLogData>): UseDataConnectQueryResult<ListTimeEntriesByWorkLogData, ListTimeEntriesByWorkLogVariables>;
```

### Variables
The `ListTimeEntriesByWorkLog` Query requires an argument of type `ListTimeEntriesByWorkLogVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface ListTimeEntriesByWorkLogVariables {
  workLogId: UUIDString;
}
```
### Return Type
Recall that calling the `ListTimeEntriesByWorkLog` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListTimeEntriesByWorkLog` Query is of type `ListTimeEntriesByWorkLogData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListTimeEntriesByWorkLog`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, ListTimeEntriesByWorkLogVariables } from '@dataconnect/generated';
import { useListTimeEntriesByWorkLog } from '@dataconnect/generated/react'

export default function ListTimeEntriesByWorkLogComponent() {
  // The `useListTimeEntriesByWorkLog` Query hook requires an argument of type `ListTimeEntriesByWorkLogVariables`:
  const listTimeEntriesByWorkLogVars: ListTimeEntriesByWorkLogVariables = {
    workLogId: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListTimeEntriesByWorkLog(listTimeEntriesByWorkLogVars);
  // Variables can be defined inline as well.
  const query = useListTimeEntriesByWorkLog({ workLogId: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListTimeEntriesByWorkLog(dataConnect, listTimeEntriesByWorkLogVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListTimeEntriesByWorkLog(listTimeEntriesByWorkLogVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListTimeEntriesByWorkLog(dataConnect, listTimeEntriesByWorkLogVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.timeEntries);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListMyTimeEntries
You can execute the `ListMyTimeEntries` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListMyTimeEntries(dc: DataConnect, options?: useDataConnectQueryOptions<ListMyTimeEntriesData>): UseDataConnectQueryResult<ListMyTimeEntriesData, undefined>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListMyTimeEntries(options?: useDataConnectQueryOptions<ListMyTimeEntriesData>): UseDataConnectQueryResult<ListMyTimeEntriesData, undefined>;
```

### Variables
The `ListMyTimeEntries` Query has no variables.
### Return Type
Recall that calling the `ListMyTimeEntries` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListMyTimeEntries` Query is of type `ListMyTimeEntriesData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface ListMyTimeEntriesData {
  timeEntries: ({
    id: UUIDString;
    startTime: TimestampString;
    endTime: TimestampString;
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListMyTimeEntries`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';
import { useListMyTimeEntries } from '@dataconnect/generated/react'

export default function ListMyTimeEntriesComponent() {
  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListMyTimeEntries();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListMyTimeEntries(dataConnect);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListMyTimeEntries(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListMyTimeEntries(dataConnect, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.timeEntries);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListTimeEntriesByDateRange
You can execute the `ListTimeEntriesByDateRange` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListTimeEntriesByDateRange(dc: DataConnect, vars: ListTimeEntriesByDateRangeVariables, options?: useDataConnectQueryOptions<ListTimeEntriesByDateRangeData>): UseDataConnectQueryResult<ListTimeEntriesByDateRangeData, ListTimeEntriesByDateRangeVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListTimeEntriesByDateRange(vars: ListTimeEntriesByDateRangeVariables, options?: useDataConnectQueryOptions<ListTimeEntriesByDateRangeData>): UseDataConnectQueryResult<ListTimeEntriesByDateRangeData, ListTimeEntriesByDateRangeVariables>;
```

### Variables
The `ListTimeEntriesByDateRange` Query requires an argument of type `ListTimeEntriesByDateRangeVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface ListTimeEntriesByDateRangeVariables {
  userId: UUIDString;
  startDate: DateString;
  endDate: DateString;
}
```
### Return Type
Recall that calling the `ListTimeEntriesByDateRange` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListTimeEntriesByDateRange` Query is of type `ListTimeEntriesByDateRangeData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListTimeEntriesByDateRange`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, ListTimeEntriesByDateRangeVariables } from '@dataconnect/generated';
import { useListTimeEntriesByDateRange } from '@dataconnect/generated/react'

export default function ListTimeEntriesByDateRangeComponent() {
  // The `useListTimeEntriesByDateRange` Query hook requires an argument of type `ListTimeEntriesByDateRangeVariables`:
  const listTimeEntriesByDateRangeVars: ListTimeEntriesByDateRangeVariables = {
    userId: ..., 
    startDate: ..., 
    endDate: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListTimeEntriesByDateRange(listTimeEntriesByDateRangeVars);
  // Variables can be defined inline as well.
  const query = useListTimeEntriesByDateRange({ userId: ..., startDate: ..., endDate: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListTimeEntriesByDateRange(dataConnect, listTimeEntriesByDateRangeVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListTimeEntriesByDateRange(listTimeEntriesByDateRangeVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListTimeEntriesByDateRange(dataConnect, listTimeEntriesByDateRangeVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.timeEntries);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

# Mutations

The React generated SDK provides Mutations hook functions that call and return [`useDataConnectMutation`](https://react-query-firebase.invertase.dev/react/data-connect/mutations) hooks from TanStack Query Firebase.

Calling these hook functions will return a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, and the most recent data returned by the Mutation, among other things. To learn more about these hooks and how to use them, see the [TanStack Query Firebase documentation](https://react-query-firebase.invertase.dev/react/data-connect/mutations).

Mutation hooks do not execute their Mutations automatically when called. Rather, after calling the Mutation hook function and getting a `UseMutationResult` object, you must call the `UseMutationResult.mutate()` function to execute the Mutation.

To learn more about TanStack React Query's Mutations, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/guides/mutations).

## Using Mutation Hooks
Here's a general overview of how to use the generated Mutation hooks in your code:

- Mutation hook functions are not called with the arguments to the Mutation. Instead, arguments are passed to `UseMutationResult.mutate()`.
- If the Mutation has no variables, the `mutate()` function does not require arguments.
- If the Mutation has any required variables, the `mutate()` function will require at least one argument: an object that contains all the required variables for the Mutation.
- If the Mutation has some required and some optional variables, only required variables are necessary in the variables argument object, and optional variables may be provided as well.
- If all of the Mutation's variables are optional, the Mutation hook function does not require any arguments.
- Mutation hook functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.
- Mutation hooks also accept an `options` argument of type `useDataConnectMutationOptions`. To learn more about the `options` argument, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/guides/mutations#mutation-side-effects).
  - `UseMutationResult.mutate()` also accepts an `options` argument of type `useDataConnectMutationOptions`.
  - ***Special case:*** If the Mutation has no arguments (or all optional arguments and you wish to provide none), and you want to pass `options` to `UseMutationResult.mutate()`, you must pass `undefined` where you would normally pass the Mutation's arguments, and then may provide the options argument.

Below are examples of how to use the `example` connector's generated Mutation hook functions to execute each Mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#operations-react-angular).

## CreateUserFromGoogle
You can execute the `CreateUserFromGoogle` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCreateUserFromGoogle(options?: useDataConnectMutationOptions<CreateUserFromGoogleData, FirebaseError, CreateUserFromGoogleVariables>): UseDataConnectMutationResult<CreateUserFromGoogleData, CreateUserFromGoogleVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCreateUserFromGoogle(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserFromGoogleData, FirebaseError, CreateUserFromGoogleVariables>): UseDataConnectMutationResult<CreateUserFromGoogleData, CreateUserFromGoogleVariables>;
```

### Variables
The `CreateUserFromGoogle` Mutation requires an argument of type `CreateUserFromGoogleVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface CreateUserFromGoogleVariables {
  googleUid: string;
  username: string;
  email: string;
  createdAt: TimestampString;
}
```
### Return Type
Recall that calling the `CreateUserFromGoogle` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CreateUserFromGoogle` Mutation is of type `CreateUserFromGoogleData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateUserFromGoogleData {
  user_insert: User_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CreateUserFromGoogle`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CreateUserFromGoogleVariables } from '@dataconnect/generated';
import { useCreateUserFromGoogle } from '@dataconnect/generated/react'

export default function CreateUserFromGoogleComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCreateUserFromGoogle();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCreateUserFromGoogle(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateUserFromGoogle(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateUserFromGoogle(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCreateUserFromGoogle` Mutation requires an argument of type `CreateUserFromGoogleVariables`:
  const createUserFromGoogleVars: CreateUserFromGoogleVariables = {
    googleUid: ..., 
    username: ..., 
    email: ..., 
    createdAt: ..., 
  };
  mutation.mutate(createUserFromGoogleVars);
  // Variables can be defined inline as well.
  mutation.mutate({ googleUid: ..., username: ..., email: ..., createdAt: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(createUserFromGoogleVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.user_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## CreateTimeEntry
You can execute the `CreateTimeEntry` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCreateTimeEntry(options?: useDataConnectMutationOptions<CreateTimeEntryData, FirebaseError, CreateTimeEntryVariables>): UseDataConnectMutationResult<CreateTimeEntryData, CreateTimeEntryVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCreateTimeEntry(dc: DataConnect, options?: useDataConnectMutationOptions<CreateTimeEntryData, FirebaseError, CreateTimeEntryVariables>): UseDataConnectMutationResult<CreateTimeEntryData, CreateTimeEntryVariables>;
```

### Variables
The `CreateTimeEntry` Mutation requires an argument of type `CreateTimeEntryVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface CreateTimeEntryVariables {
  userId: UUIDString;
  startTime: TimestampString;
  endTime: TimestampString;
  date: DateString;
  createdAt: TimestampString;
  description?: string | null;
  officeNumber?: string | null;
}
```
### Return Type
Recall that calling the `CreateTimeEntry` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CreateTimeEntry` Mutation is of type `CreateTimeEntryData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateTimeEntryData {
  timeEntry_insert: TimeEntry_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CreateTimeEntry`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CreateTimeEntryVariables } from '@dataconnect/generated';
import { useCreateTimeEntry } from '@dataconnect/generated/react'

export default function CreateTimeEntryComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCreateTimeEntry();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCreateTimeEntry(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateTimeEntry(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateTimeEntry(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCreateTimeEntry` Mutation requires an argument of type `CreateTimeEntryVariables`:
  const createTimeEntryVars: CreateTimeEntryVariables = {
    userId: ..., 
    startTime: ..., 
    endTime: ..., 
    date: ..., 
    createdAt: ..., 
    description: ..., // optional
    officeNumber: ..., // optional
  };
  mutation.mutate(createTimeEntryVars);
  // Variables can be defined inline as well.
  mutation.mutate({ userId: ..., startTime: ..., endTime: ..., date: ..., createdAt: ..., description: ..., officeNumber: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(createTimeEntryVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.timeEntry_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## UpdateTimeEntry
You can execute the `UpdateTimeEntry` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useUpdateTimeEntry(options?: useDataConnectMutationOptions<UpdateTimeEntryData, FirebaseError, UpdateTimeEntryVariables>): UseDataConnectMutationResult<UpdateTimeEntryData, UpdateTimeEntryVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useUpdateTimeEntry(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateTimeEntryData, FirebaseError, UpdateTimeEntryVariables>): UseDataConnectMutationResult<UpdateTimeEntryData, UpdateTimeEntryVariables>;
```

### Variables
The `UpdateTimeEntry` Mutation requires an argument of type `UpdateTimeEntryVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface UpdateTimeEntryVariables {
  entryId: UUIDString;
  description?: string | null;
  ticketNumber: number;
}
```
### Return Type
Recall that calling the `UpdateTimeEntry` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `UpdateTimeEntry` Mutation is of type `UpdateTimeEntryData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface UpdateTimeEntryData {
  timeEntry_update?: TimeEntry_Key | null;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `UpdateTimeEntry`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, UpdateTimeEntryVariables } from '@dataconnect/generated';
import { useUpdateTimeEntry } from '@dataconnect/generated/react'

export default function UpdateTimeEntryComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useUpdateTimeEntry();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useUpdateTimeEntry(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpdateTimeEntry(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpdateTimeEntry(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useUpdateTimeEntry` Mutation requires an argument of type `UpdateTimeEntryVariables`:
  const updateTimeEntryVars: UpdateTimeEntryVariables = {
    entryId: ..., 
    description: ..., // optional
    ticketNumber: ..., 
  };
  mutation.mutate(updateTimeEntryVars);
  // Variables can be defined inline as well.
  mutation.mutate({ entryId: ..., description: ..., ticketNumber: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(updateTimeEntryVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.timeEntry_update);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## UpdateTimeEntryClearTicket
You can execute the `UpdateTimeEntryClearTicket` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useUpdateTimeEntryClearTicket(options?: useDataConnectMutationOptions<UpdateTimeEntryClearTicketData, FirebaseError, UpdateTimeEntryClearTicketVariables>): UseDataConnectMutationResult<UpdateTimeEntryClearTicketData, UpdateTimeEntryClearTicketVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useUpdateTimeEntryClearTicket(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateTimeEntryClearTicketData, FirebaseError, UpdateTimeEntryClearTicketVariables>): UseDataConnectMutationResult<UpdateTimeEntryClearTicketData, UpdateTimeEntryClearTicketVariables>;
```

### Variables
The `UpdateTimeEntryClearTicket` Mutation requires an argument of type `UpdateTimeEntryClearTicketVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface UpdateTimeEntryClearTicketVariables {
  entryId: UUIDString;
  description?: string | null;
}
```
### Return Type
Recall that calling the `UpdateTimeEntryClearTicket` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `UpdateTimeEntryClearTicket` Mutation is of type `UpdateTimeEntryClearTicketData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface UpdateTimeEntryClearTicketData {
  timeEntry_update?: TimeEntry_Key | null;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `UpdateTimeEntryClearTicket`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, UpdateTimeEntryClearTicketVariables } from '@dataconnect/generated';
import { useUpdateTimeEntryClearTicket } from '@dataconnect/generated/react'

export default function UpdateTimeEntryClearTicketComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useUpdateTimeEntryClearTicket();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useUpdateTimeEntryClearTicket(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpdateTimeEntryClearTicket(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpdateTimeEntryClearTicket(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useUpdateTimeEntryClearTicket` Mutation requires an argument of type `UpdateTimeEntryClearTicketVariables`:
  const updateTimeEntryClearTicketVars: UpdateTimeEntryClearTicketVariables = {
    entryId: ..., 
    description: ..., // optional
  };
  mutation.mutate(updateTimeEntryClearTicketVars);
  // Variables can be defined inline as well.
  mutation.mutate({ entryId: ..., description: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(updateTimeEntryClearTicketVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.timeEntry_update);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## DeleteTimeEntry
You can execute the `DeleteTimeEntry` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useDeleteTimeEntry(options?: useDataConnectMutationOptions<DeleteTimeEntryData, FirebaseError, DeleteTimeEntryVariables>): UseDataConnectMutationResult<DeleteTimeEntryData, DeleteTimeEntryVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useDeleteTimeEntry(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteTimeEntryData, FirebaseError, DeleteTimeEntryVariables>): UseDataConnectMutationResult<DeleteTimeEntryData, DeleteTimeEntryVariables>;
```

### Variables
The `DeleteTimeEntry` Mutation requires an argument of type `DeleteTimeEntryVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface DeleteTimeEntryVariables {
  entryId: UUIDString;
}
```
### Return Type
Recall that calling the `DeleteTimeEntry` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `DeleteTimeEntry` Mutation is of type `DeleteTimeEntryData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface DeleteTimeEntryData {
  timeEntry_delete?: TimeEntry_Key | null;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `DeleteTimeEntry`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, DeleteTimeEntryVariables } from '@dataconnect/generated';
import { useDeleteTimeEntry } from '@dataconnect/generated/react'

export default function DeleteTimeEntryComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useDeleteTimeEntry();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useDeleteTimeEntry(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useDeleteTimeEntry(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useDeleteTimeEntry(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useDeleteTimeEntry` Mutation requires an argument of type `DeleteTimeEntryVariables`:
  const deleteTimeEntryVars: DeleteTimeEntryVariables = {
    entryId: ..., 
  };
  mutation.mutate(deleteTimeEntryVars);
  // Variables can be defined inline as well.
  mutation.mutate({ entryId: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(deleteTimeEntryVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.timeEntry_delete);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## UpsertTicket
You can execute the `UpsertTicket` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useUpsertTicket(options?: useDataConnectMutationOptions<UpsertTicketData, FirebaseError, UpsertTicketVariables>): UseDataConnectMutationResult<UpsertTicketData, UpsertTicketVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useUpsertTicket(dc: DataConnect, options?: useDataConnectMutationOptions<UpsertTicketData, FirebaseError, UpsertTicketVariables>): UseDataConnectMutationResult<UpsertTicketData, UpsertTicketVariables>;
```

### Variables
The `UpsertTicket` Mutation requires an argument of type `UpsertTicketVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface UpsertTicketVariables {
  ticketNumber: number;
  office?: string | null;
  ticketTitle?: string | null;
  ticketLink?: string | null;
}
```
### Return Type
Recall that calling the `UpsertTicket` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `UpsertTicket` Mutation is of type `UpsertTicketData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface UpsertTicketData {
  ticket_upsert: Ticket_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `UpsertTicket`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, UpsertTicketVariables } from '@dataconnect/generated';
import { useUpsertTicket } from '@dataconnect/generated/react'

export default function UpsertTicketComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useUpsertTicket();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useUpsertTicket(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpsertTicket(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpsertTicket(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useUpsertTicket` Mutation requires an argument of type `UpsertTicketVariables`:
  const upsertTicketVars: UpsertTicketVariables = {
    ticketNumber: ..., 
    office: ..., // optional
    ticketTitle: ..., // optional
    ticketLink: ..., // optional
  };
  mutation.mutate(upsertTicketVars);
  // Variables can be defined inline as well.
  mutation.mutate({ ticketNumber: ..., office: ..., ticketTitle: ..., ticketLink: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(upsertTicketVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.ticket_upsert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## UpdateTicket
You can execute the `UpdateTicket` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useUpdateTicket(options?: useDataConnectMutationOptions<UpdateTicketData, FirebaseError, UpdateTicketVariables>): UseDataConnectMutationResult<UpdateTicketData, UpdateTicketVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useUpdateTicket(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateTicketData, FirebaseError, UpdateTicketVariables>): UseDataConnectMutationResult<UpdateTicketData, UpdateTicketVariables>;
```

### Variables
The `UpdateTicket` Mutation requires an argument of type `UpdateTicketVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface UpdateTicketVariables {
  ticketNumber: number;
  office?: string | null;
  ticketTitle?: string | null;
  ticketLink?: string | null;
}
```
### Return Type
Recall that calling the `UpdateTicket` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `UpdateTicket` Mutation is of type `UpdateTicketData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface UpdateTicketData {
  ticket_update?: Ticket_Key | null;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `UpdateTicket`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, UpdateTicketVariables } from '@dataconnect/generated';
import { useUpdateTicket } from '@dataconnect/generated/react'

export default function UpdateTicketComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useUpdateTicket();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useUpdateTicket(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpdateTicket(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpdateTicket(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useUpdateTicket` Mutation requires an argument of type `UpdateTicketVariables`:
  const updateTicketVars: UpdateTicketVariables = {
    ticketNumber: ..., 
    office: ..., // optional
    ticketTitle: ..., // optional
    ticketLink: ..., // optional
  };
  mutation.mutate(updateTicketVars);
  // Variables can be defined inline as well.
  mutation.mutate({ ticketNumber: ..., office: ..., ticketTitle: ..., ticketLink: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(updateTicketVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.ticket_update);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## SelectMyColorScheme
You can execute the `SelectMyColorScheme` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useSelectMyColorScheme(options?: useDataConnectMutationOptions<SelectMyColorSchemeData, FirebaseError, SelectMyColorSchemeVariables>): UseDataConnectMutationResult<SelectMyColorSchemeData, SelectMyColorSchemeVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useSelectMyColorScheme(dc: DataConnect, options?: useDataConnectMutationOptions<SelectMyColorSchemeData, FirebaseError, SelectMyColorSchemeVariables>): UseDataConnectMutationResult<SelectMyColorSchemeData, SelectMyColorSchemeVariables>;
```

### Variables
The `SelectMyColorScheme` Mutation requires an argument of type `SelectMyColorSchemeVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface SelectMyColorSchemeVariables {
  colorSchemeId: UUIDString;
}
```
### Return Type
Recall that calling the `SelectMyColorScheme` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `SelectMyColorScheme` Mutation is of type `SelectMyColorSchemeData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface SelectMyColorSchemeData {
  user_update?: User_Key | null;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `SelectMyColorScheme`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, SelectMyColorSchemeVariables } from '@dataconnect/generated';
import { useSelectMyColorScheme } from '@dataconnect/generated/react'

export default function SelectMyColorSchemeComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useSelectMyColorScheme();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useSelectMyColorScheme(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useSelectMyColorScheme(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useSelectMyColorScheme(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useSelectMyColorScheme` Mutation requires an argument of type `SelectMyColorSchemeVariables`:
  const selectMyColorSchemeVars: SelectMyColorSchemeVariables = {
    colorSchemeId: ..., 
  };
  mutation.mutate(selectMyColorSchemeVars);
  // Variables can be defined inline as well.
  mutation.mutate({ colorSchemeId: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(selectMyColorSchemeVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.user_update);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ClearMyColorScheme
You can execute the `ClearMyColorScheme` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useClearMyColorScheme(options?: useDataConnectMutationOptions<ClearMyColorSchemeData, FirebaseError, void>): UseDataConnectMutationResult<ClearMyColorSchemeData, undefined>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useClearMyColorScheme(dc: DataConnect, options?: useDataConnectMutationOptions<ClearMyColorSchemeData, FirebaseError, void>): UseDataConnectMutationResult<ClearMyColorSchemeData, undefined>;
```

### Variables
The `ClearMyColorScheme` Mutation has no variables.
### Return Type
Recall that calling the `ClearMyColorScheme` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `ClearMyColorScheme` Mutation is of type `ClearMyColorSchemeData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface ClearMyColorSchemeData {
  user_update?: User_Key | null;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `ClearMyColorScheme`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';
import { useClearMyColorScheme } from '@dataconnect/generated/react'

export default function ClearMyColorSchemeComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useClearMyColorScheme();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useClearMyColorScheme(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useClearMyColorScheme(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useClearMyColorScheme(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  mutation.mutate();

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  // Since this Mutation accepts no variables, you must pass `undefined` where you would normally pass the variables.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(undefined, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.user_update);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## UpdateWorkLog
You can execute the `UpdateWorkLog` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useUpdateWorkLog(options?: useDataConnectMutationOptions<UpdateWorkLogData, FirebaseError, UpdateWorkLogVariables>): UseDataConnectMutationResult<UpdateWorkLogData, UpdateWorkLogVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useUpdateWorkLog(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateWorkLogData, FirebaseError, UpdateWorkLogVariables>): UseDataConnectMutationResult<UpdateWorkLogData, UpdateWorkLogVariables>;
```

### Variables
The `UpdateWorkLog` Mutation requires an argument of type `UpdateWorkLogVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface UpdateWorkLogVariables {
  workLogId: UUIDString;
  name: string;
}
```
### Return Type
Recall that calling the `UpdateWorkLog` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `UpdateWorkLog` Mutation is of type `UpdateWorkLogData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface UpdateWorkLogData {
  workLog_update?: WorkLog_Key | null;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `UpdateWorkLog`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, UpdateWorkLogVariables } from '@dataconnect/generated';
import { useUpdateWorkLog } from '@dataconnect/generated/react'

export default function UpdateWorkLogComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useUpdateWorkLog();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useUpdateWorkLog(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpdateWorkLog(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpdateWorkLog(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useUpdateWorkLog` Mutation requires an argument of type `UpdateWorkLogVariables`:
  const updateWorkLogVars: UpdateWorkLogVariables = {
    workLogId: ..., 
    name: ..., 
  };
  mutation.mutate(updateWorkLogVars);
  // Variables can be defined inline as well.
  mutation.mutate({ workLogId: ..., name: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(updateWorkLogVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.workLog_update);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## DeleteWorkLog
You can execute the `DeleteWorkLog` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useDeleteWorkLog(options?: useDataConnectMutationOptions<DeleteWorkLogData, FirebaseError, DeleteWorkLogVariables>): UseDataConnectMutationResult<DeleteWorkLogData, DeleteWorkLogVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useDeleteWorkLog(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteWorkLogData, FirebaseError, DeleteWorkLogVariables>): UseDataConnectMutationResult<DeleteWorkLogData, DeleteWorkLogVariables>;
```

### Variables
The `DeleteWorkLog` Mutation requires an argument of type `DeleteWorkLogVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface DeleteWorkLogVariables {
  workLogId: UUIDString;
}
```
### Return Type
Recall that calling the `DeleteWorkLog` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `DeleteWorkLog` Mutation is of type `DeleteWorkLogData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface DeleteWorkLogData {
  workLog_update?: WorkLog_Key | null;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `DeleteWorkLog`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, DeleteWorkLogVariables } from '@dataconnect/generated';
import { useDeleteWorkLog } from '@dataconnect/generated/react'

export default function DeleteWorkLogComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useDeleteWorkLog();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useDeleteWorkLog(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useDeleteWorkLog(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useDeleteWorkLog(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useDeleteWorkLog` Mutation requires an argument of type `DeleteWorkLogVariables`:
  const deleteWorkLogVars: DeleteWorkLogVariables = {
    workLogId: ..., 
  };
  mutation.mutate(deleteWorkLogVars);
  // Variables can be defined inline as well.
  mutation.mutate({ workLogId: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(deleteWorkLogVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.workLog_update);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## RestoreWorkLog
You can execute the `RestoreWorkLog` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useRestoreWorkLog(options?: useDataConnectMutationOptions<RestoreWorkLogData, FirebaseError, RestoreWorkLogVariables>): UseDataConnectMutationResult<RestoreWorkLogData, RestoreWorkLogVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useRestoreWorkLog(dc: DataConnect, options?: useDataConnectMutationOptions<RestoreWorkLogData, FirebaseError, RestoreWorkLogVariables>): UseDataConnectMutationResult<RestoreWorkLogData, RestoreWorkLogVariables>;
```

### Variables
The `RestoreWorkLog` Mutation requires an argument of type `RestoreWorkLogVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface RestoreWorkLogVariables {
  workLogId: UUIDString;
}
```
### Return Type
Recall that calling the `RestoreWorkLog` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `RestoreWorkLog` Mutation is of type `RestoreWorkLogData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface RestoreWorkLogData {
  workLog_update?: WorkLog_Key | null;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `RestoreWorkLog`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, RestoreWorkLogVariables } from '@dataconnect/generated';
import { useRestoreWorkLog } from '@dataconnect/generated/react'

export default function RestoreWorkLogComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useRestoreWorkLog();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useRestoreWorkLog(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useRestoreWorkLog(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useRestoreWorkLog(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useRestoreWorkLog` Mutation requires an argument of type `RestoreWorkLogVariables`:
  const restoreWorkLogVars: RestoreWorkLogVariables = {
    workLogId: ..., 
  };
  mutation.mutate(restoreWorkLogVars);
  // Variables can be defined inline as well.
  mutation.mutate({ workLogId: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(restoreWorkLogVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.workLog_update);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## CreateWorkLog
You can execute the `CreateWorkLog` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCreateWorkLog(options?: useDataConnectMutationOptions<CreateWorkLogData, FirebaseError, CreateWorkLogVariables>): UseDataConnectMutationResult<CreateWorkLogData, CreateWorkLogVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCreateWorkLog(dc: DataConnect, options?: useDataConnectMutationOptions<CreateWorkLogData, FirebaseError, CreateWorkLogVariables>): UseDataConnectMutationResult<CreateWorkLogData, CreateWorkLogVariables>;
```

### Variables
The `CreateWorkLog` Mutation requires an argument of type `CreateWorkLogVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface CreateWorkLogVariables {
  userId: UUIDString;
  workLogId: UUIDString;
  name: string;
  description?: string | null;
  workLogDate: TimestampString;
}
```
### Return Type
Recall that calling the `CreateWorkLog` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CreateWorkLog` Mutation is of type `CreateWorkLogData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CreateWorkLog`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CreateWorkLogVariables } from '@dataconnect/generated';
import { useCreateWorkLog } from '@dataconnect/generated/react'

export default function CreateWorkLogComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCreateWorkLog();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCreateWorkLog(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateWorkLog(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateWorkLog(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCreateWorkLog` Mutation requires an argument of type `CreateWorkLogVariables`:
  const createWorkLogVars: CreateWorkLogVariables = {
    userId: ..., 
    workLogId: ..., 
    name: ..., 
    description: ..., // optional
    workLogDate: ..., 
  };
  mutation.mutate(createWorkLogVars);
  // Variables can be defined inline as well.
  mutation.mutate({ userId: ..., workLogId: ..., name: ..., description: ..., workLogDate: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(createWorkLogVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.workLog_insert);
    console.log(mutation.data.seg1);
    console.log(mutation.data.seg2);
    console.log(mutation.data.seg3);
    console.log(mutation.data.seg4);
    console.log(mutation.data.seg5);
    console.log(mutation.data.seg6);
    console.log(mutation.data.seg7);
    console.log(mutation.data.seg8);
    console.log(mutation.data.seg9);
    console.log(mutation.data.seg10);
    console.log(mutation.data.seg11);
    console.log(mutation.data.seg12);
    console.log(mutation.data.seg13);
    console.log(mutation.data.seg14);
    console.log(mutation.data.seg15);
    console.log(mutation.data.seg16);
    console.log(mutation.data.seg17);
    console.log(mutation.data.seg18);
    console.log(mutation.data.seg19);
    console.log(mutation.data.seg20);
    console.log(mutation.data.seg21);
    console.log(mutation.data.seg22);
    console.log(mutation.data.seg23);
    console.log(mutation.data.seg24);
    console.log(mutation.data.seg25);
    console.log(mutation.data.seg26);
    console.log(mutation.data.seg27);
    console.log(mutation.data.seg28);
    console.log(mutation.data.seg29);
    console.log(mutation.data.seg30);
    console.log(mutation.data.seg31);
    console.log(mutation.data.seg32);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

