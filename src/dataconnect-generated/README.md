# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
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
  - [*ListTimeEntriesByTicket*](#listtimeentriesbyticket)
  - [*ListMyTimeEntries*](#listmytimeentries)
  - [*ListTimeEntriesByDateRange*](#listtimeentriesbydaterange)
  - [*ListUserTypes*](#listusertypes)
  - [*GetUserAccessByGoogleUid*](#getuseraccessbygoogleuid)
  - [*AdminListUsers*](#adminlistusers)
  - [*AdminListUserTypes*](#adminlistusertypes)
  - [*AdminListFeatures*](#adminlistfeatures)
  - [*AdminGetUser*](#admingetuser)
  - [*AdminListTeams*](#adminlistteams)
  - [*GetGoogleCalendarConnection*](#getgooglecalendarconnection)
- [**Mutations**](#mutations)
  - [*CreateUserFromGoogle*](#createuserfromgoogle)
  - [*SetUserType*](#setusertype)
  - [*CreateTimeEntry*](#createtimeentry)
  - [*CreateWorkLogOnly*](#createworklogonly)
  - [*UpdateTimeEntry*](#updatetimeentry)
  - [*UpdateTimeEntryClearTicket*](#updatetimeentryclearticket)
  - [*DeleteTimeEntry*](#deletetimeentry)
  - [*UpsertTicket*](#upsertticket)
  - [*UpdateTicket*](#updateticket)
  - [*SelectMyColorScheme*](#selectmycolorscheme)
  - [*ClearMyColorScheme*](#clearmycolorscheme)
  - [*SelectMyPerformanceMode*](#selectmyperformancemode)
  - [*SelectMyBackgroundOpacity*](#selectmybackgroundopacity)
  - [*SelectMyExternalTicketLinkTemplate*](#selectmyexternalticketlinktemplate)
  - [*SelectMyCardStyle*](#selectmycardstyle)
  - [*SelectMyBordersEnabled*](#selectmybordersenabled)
  - [*SelectMyTicketColorsEnabled*](#selectmyticketcolorsenabled)
  - [*UpdateWorkLog*](#updateworklog)
  - [*DeleteWorkLog*](#deleteworklog)
  - [*RestoreWorkLog*](#restoreworklog)
  - [*CreateWorkLog*](#createworklog)
  - [*UpsertGoogleCalendarConnection*](#upsertgooglecalendarconnection)
  - [*UpdateGoogleCalendarSyncPrefs*](#updategooglecalendarsyncprefs)
  - [*TouchGoogleCalendarLastSynced*](#touchgooglecalendarlastsynced)
  - [*DeleteGoogleCalendarConnection*](#deletegooglecalendarconnection)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListUsers
You can execute the `ListUsers` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listUsers(options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;

interface ListUsersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUsersData, undefined>;
}
export const listUsersRef: ListUsersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listUsers(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;

interface ListUsersRef {
  ...
  (dc: DataConnect): QueryRef<ListUsersData, undefined>;
}
export const listUsersRef: ListUsersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listUsersRef:
```typescript
const name = listUsersRef.operationName;
console.log(name);
```

### Variables
The `ListUsers` query has no variables.
### Return Type
Recall that executing the `ListUsers` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListUsersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListUsers`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listUsers } from '@dataconnect/generated';


// Call the `listUsers()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listUsers();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listUsers(dataConnect);

console.log(data.users);

// Or, you can use the `Promise` API.
listUsers().then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `ListUsers`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listUsersRef } from '@dataconnect/generated';


// Call the `listUsersRef()` function to get a reference to the query.
const ref = listUsersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listUsersRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

## GetMyUser
You can execute the `GetMyUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getMyUser(options?: ExecuteQueryOptions): QueryPromise<GetMyUserData, undefined>;

interface GetMyUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyUserData, undefined>;
}
export const getMyUserRef: GetMyUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMyUser(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetMyUserData, undefined>;

interface GetMyUserRef {
  ...
  (dc: DataConnect): QueryRef<GetMyUserData, undefined>;
}
export const getMyUserRef: GetMyUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMyUserRef:
```typescript
const name = getMyUserRef.operationName;
console.log(name);
```

### Variables
The `GetMyUser` query has no variables.
### Return Type
Recall that executing the `GetMyUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMyUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
    ticketColorsEnabled?: boolean | null;
  } & User_Key;
}
```
### Using `GetMyUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMyUser } from '@dataconnect/generated';


// Call the `getMyUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMyUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMyUser(dataConnect);

console.log(data.user);

// Or, you can use the `Promise` API.
getMyUser().then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

### Using `GetMyUser`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMyUserRef } from '@dataconnect/generated';


// Call the `getMyUserRef()` function to get a reference to the query.
const ref = getMyUserRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMyUserRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.user);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

## ListColorSchemes
You can execute the `ListColorSchemes` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listColorSchemes(options?: ExecuteQueryOptions): QueryPromise<ListColorSchemesData, undefined>;

interface ListColorSchemesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListColorSchemesData, undefined>;
}
export const listColorSchemesRef: ListColorSchemesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listColorSchemes(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListColorSchemesData, undefined>;

interface ListColorSchemesRef {
  ...
  (dc: DataConnect): QueryRef<ListColorSchemesData, undefined>;
}
export const listColorSchemesRef: ListColorSchemesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listColorSchemesRef:
```typescript
const name = listColorSchemesRef.operationName;
console.log(name);
```

### Variables
The `ListColorSchemes` query has no variables.
### Return Type
Recall that executing the `ListColorSchemes` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListColorSchemesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `ListColorSchemes`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listColorSchemes } from '@dataconnect/generated';


// Call the `listColorSchemes()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listColorSchemes();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listColorSchemes(dataConnect);

console.log(data.colorSchemes);

// Or, you can use the `Promise` API.
listColorSchemes().then((response) => {
  const data = response.data;
  console.log(data.colorSchemes);
});
```

### Using `ListColorSchemes`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listColorSchemesRef } from '@dataconnect/generated';


// Call the `listColorSchemesRef()` function to get a reference to the query.
const ref = listColorSchemesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listColorSchemesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.colorSchemes);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.colorSchemes);
});
```

## ListTickets
You can execute the `ListTickets` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listTickets(vars?: ListTicketsVariables, options?: ExecuteQueryOptions): QueryPromise<ListTicketsData, ListTicketsVariables>;

interface ListTicketsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListTicketsVariables): QueryRef<ListTicketsData, ListTicketsVariables>;
}
export const listTicketsRef: ListTicketsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listTickets(dc: DataConnect, vars?: ListTicketsVariables, options?: ExecuteQueryOptions): QueryPromise<ListTicketsData, ListTicketsVariables>;

interface ListTicketsRef {
  ...
  (dc: DataConnect, vars?: ListTicketsVariables): QueryRef<ListTicketsData, ListTicketsVariables>;
}
export const listTicketsRef: ListTicketsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listTicketsRef:
```typescript
const name = listTicketsRef.operationName;
console.log(name);
```

### Variables
The `ListTickets` query has an optional argument of type `ListTicketsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListTicketsVariables {
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that executing the `ListTickets` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListTicketsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListTicketsData {
  tickets: ({
    id: UUIDString;
    ticketNumber: number;
    office?: string | null;
    ticketTitle?: string | null;
    ticketLink?: string | null;
    color?: string | null;
  } & Ticket_Key)[];
}
```
### Using `ListTickets`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listTickets, ListTicketsVariables } from '@dataconnect/generated';

// The `ListTickets` query has an optional argument of type `ListTicketsVariables`:
const listTicketsVars: ListTicketsVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listTickets()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listTickets(listTicketsVars);
// Variables can be defined inline as well.
const { data } = await listTickets({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListTicketsVariables` argument.
const { data } = await listTickets();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listTickets(dataConnect, listTicketsVars);

console.log(data.tickets);

// Or, you can use the `Promise` API.
listTickets(listTicketsVars).then((response) => {
  const data = response.data;
  console.log(data.tickets);
});
```

### Using `ListTickets`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listTicketsRef, ListTicketsVariables } from '@dataconnect/generated';

// The `ListTickets` query has an optional argument of type `ListTicketsVariables`:
const listTicketsVars: ListTicketsVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listTicketsRef()` function to get a reference to the query.
const ref = listTicketsRef(listTicketsVars);
// Variables can be defined inline as well.
const ref = listTicketsRef({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListTicketsVariables` argument.
const ref = listTicketsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listTicketsRef(dataConnect, listTicketsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.tickets);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.tickets);
});
```

## ListTimeEntries
You can execute the `ListTimeEntries` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listTimeEntries(vars: ListTimeEntriesVariables, options?: ExecuteQueryOptions): QueryPromise<ListTimeEntriesData, ListTimeEntriesVariables>;

interface ListTimeEntriesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListTimeEntriesVariables): QueryRef<ListTimeEntriesData, ListTimeEntriesVariables>;
}
export const listTimeEntriesRef: ListTimeEntriesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listTimeEntries(dc: DataConnect, vars: ListTimeEntriesVariables, options?: ExecuteQueryOptions): QueryPromise<ListTimeEntriesData, ListTimeEntriesVariables>;

interface ListTimeEntriesRef {
  ...
  (dc: DataConnect, vars: ListTimeEntriesVariables): QueryRef<ListTimeEntriesData, ListTimeEntriesVariables>;
}
export const listTimeEntriesRef: ListTimeEntriesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listTimeEntriesRef:
```typescript
const name = listTimeEntriesRef.operationName;
console.log(name);
```

### Variables
The `ListTimeEntries` query requires an argument of type `ListTimeEntriesVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListTimeEntriesVariables {
  userId: UUIDString;
}
```
### Return Type
Recall that executing the `ListTimeEntries` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListTimeEntriesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `ListTimeEntries`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listTimeEntries, ListTimeEntriesVariables } from '@dataconnect/generated';

// The `ListTimeEntries` query requires an argument of type `ListTimeEntriesVariables`:
const listTimeEntriesVars: ListTimeEntriesVariables = {
  userId: ..., 
};

// Call the `listTimeEntries()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listTimeEntries(listTimeEntriesVars);
// Variables can be defined inline as well.
const { data } = await listTimeEntries({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listTimeEntries(dataConnect, listTimeEntriesVars);

console.log(data.timeEntries);

// Or, you can use the `Promise` API.
listTimeEntries(listTimeEntriesVars).then((response) => {
  const data = response.data;
  console.log(data.timeEntries);
});
```

### Using `ListTimeEntries`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listTimeEntriesRef, ListTimeEntriesVariables } from '@dataconnect/generated';

// The `ListTimeEntries` query requires an argument of type `ListTimeEntriesVariables`:
const listTimeEntriesVars: ListTimeEntriesVariables = {
  userId: ..., 
};

// Call the `listTimeEntriesRef()` function to get a reference to the query.
const ref = listTimeEntriesRef(listTimeEntriesVars);
// Variables can be defined inline as well.
const ref = listTimeEntriesRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listTimeEntriesRef(dataConnect, listTimeEntriesVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.timeEntries);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.timeEntries);
});
```

## GetTimeEntry
You can execute the `GetTimeEntry` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getTimeEntry(vars: GetTimeEntryVariables, options?: ExecuteQueryOptions): QueryPromise<GetTimeEntryData, GetTimeEntryVariables>;

interface GetTimeEntryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTimeEntryVariables): QueryRef<GetTimeEntryData, GetTimeEntryVariables>;
}
export const getTimeEntryRef: GetTimeEntryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getTimeEntry(dc: DataConnect, vars: GetTimeEntryVariables, options?: ExecuteQueryOptions): QueryPromise<GetTimeEntryData, GetTimeEntryVariables>;

interface GetTimeEntryRef {
  ...
  (dc: DataConnect, vars: GetTimeEntryVariables): QueryRef<GetTimeEntryData, GetTimeEntryVariables>;
}
export const getTimeEntryRef: GetTimeEntryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getTimeEntryRef:
```typescript
const name = getTimeEntryRef.operationName;
console.log(name);
```

### Variables
The `GetTimeEntry` query requires an argument of type `GetTimeEntryVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetTimeEntryVariables {
  entryId: UUIDString;
}
```
### Return Type
Recall that executing the `GetTimeEntry` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetTimeEntryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `GetTimeEntry`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getTimeEntry, GetTimeEntryVariables } from '@dataconnect/generated';

// The `GetTimeEntry` query requires an argument of type `GetTimeEntryVariables`:
const getTimeEntryVars: GetTimeEntryVariables = {
  entryId: ..., 
};

// Call the `getTimeEntry()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getTimeEntry(getTimeEntryVars);
// Variables can be defined inline as well.
const { data } = await getTimeEntry({ entryId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getTimeEntry(dataConnect, getTimeEntryVars);

console.log(data.timeEntry);

// Or, you can use the `Promise` API.
getTimeEntry(getTimeEntryVars).then((response) => {
  const data = response.data;
  console.log(data.timeEntry);
});
```

### Using `GetTimeEntry`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getTimeEntryRef, GetTimeEntryVariables } from '@dataconnect/generated';

// The `GetTimeEntry` query requires an argument of type `GetTimeEntryVariables`:
const getTimeEntryVars: GetTimeEntryVariables = {
  entryId: ..., 
};

// Call the `getTimeEntryRef()` function to get a reference to the query.
const ref = getTimeEntryRef(getTimeEntryVars);
// Variables can be defined inline as well.
const ref = getTimeEntryRef({ entryId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getTimeEntryRef(dataConnect, getTimeEntryVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.timeEntry);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.timeEntry);
});
```

## ListWorkLogs
You can execute the `ListWorkLogs` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listWorkLogs(vars?: ListWorkLogsVariables, options?: ExecuteQueryOptions): QueryPromise<ListWorkLogsData, ListWorkLogsVariables>;

interface ListWorkLogsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListWorkLogsVariables): QueryRef<ListWorkLogsData, ListWorkLogsVariables>;
}
export const listWorkLogsRef: ListWorkLogsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listWorkLogs(dc: DataConnect, vars?: ListWorkLogsVariables, options?: ExecuteQueryOptions): QueryPromise<ListWorkLogsData, ListWorkLogsVariables>;

interface ListWorkLogsRef {
  ...
  (dc: DataConnect, vars?: ListWorkLogsVariables): QueryRef<ListWorkLogsData, ListWorkLogsVariables>;
}
export const listWorkLogsRef: ListWorkLogsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listWorkLogsRef:
```typescript
const name = listWorkLogsRef.operationName;
console.log(name);
```

### Variables
The `ListWorkLogs` query has an optional argument of type `ListWorkLogsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListWorkLogsVariables {
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that executing the `ListWorkLogs` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListWorkLogsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `ListWorkLogs`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listWorkLogs, ListWorkLogsVariables } from '@dataconnect/generated';

// The `ListWorkLogs` query has an optional argument of type `ListWorkLogsVariables`:
const listWorkLogsVars: ListWorkLogsVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listWorkLogs()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listWorkLogs(listWorkLogsVars);
// Variables can be defined inline as well.
const { data } = await listWorkLogs({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListWorkLogsVariables` argument.
const { data } = await listWorkLogs();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listWorkLogs(dataConnect, listWorkLogsVars);

console.log(data.workLogs);

// Or, you can use the `Promise` API.
listWorkLogs(listWorkLogsVars).then((response) => {
  const data = response.data;
  console.log(data.workLogs);
});
```

### Using `ListWorkLogs`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listWorkLogsRef, ListWorkLogsVariables } from '@dataconnect/generated';

// The `ListWorkLogs` query has an optional argument of type `ListWorkLogsVariables`:
const listWorkLogsVars: ListWorkLogsVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listWorkLogsRef()` function to get a reference to the query.
const ref = listWorkLogsRef(listWorkLogsVars);
// Variables can be defined inline as well.
const ref = listWorkLogsRef({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListWorkLogsVariables` argument.
const ref = listWorkLogsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listWorkLogsRef(dataConnect, listWorkLogsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.workLogs);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.workLogs);
});
```

## ListTimeEntriesByWorkLog
You can execute the `ListTimeEntriesByWorkLog` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listTimeEntriesByWorkLog(vars: ListTimeEntriesByWorkLogVariables, options?: ExecuteQueryOptions): QueryPromise<ListTimeEntriesByWorkLogData, ListTimeEntriesByWorkLogVariables>;

interface ListTimeEntriesByWorkLogRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListTimeEntriesByWorkLogVariables): QueryRef<ListTimeEntriesByWorkLogData, ListTimeEntriesByWorkLogVariables>;
}
export const listTimeEntriesByWorkLogRef: ListTimeEntriesByWorkLogRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listTimeEntriesByWorkLog(dc: DataConnect, vars: ListTimeEntriesByWorkLogVariables, options?: ExecuteQueryOptions): QueryPromise<ListTimeEntriesByWorkLogData, ListTimeEntriesByWorkLogVariables>;

interface ListTimeEntriesByWorkLogRef {
  ...
  (dc: DataConnect, vars: ListTimeEntriesByWorkLogVariables): QueryRef<ListTimeEntriesByWorkLogData, ListTimeEntriesByWorkLogVariables>;
}
export const listTimeEntriesByWorkLogRef: ListTimeEntriesByWorkLogRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listTimeEntriesByWorkLogRef:
```typescript
const name = listTimeEntriesByWorkLogRef.operationName;
console.log(name);
```

### Variables
The `ListTimeEntriesByWorkLog` query requires an argument of type `ListTimeEntriesByWorkLogVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListTimeEntriesByWorkLogVariables {
  workLogId: UUIDString;
}
```
### Return Type
Recall that executing the `ListTimeEntriesByWorkLog` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListTimeEntriesByWorkLogData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `ListTimeEntriesByWorkLog`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listTimeEntriesByWorkLog, ListTimeEntriesByWorkLogVariables } from '@dataconnect/generated';

// The `ListTimeEntriesByWorkLog` query requires an argument of type `ListTimeEntriesByWorkLogVariables`:
const listTimeEntriesByWorkLogVars: ListTimeEntriesByWorkLogVariables = {
  workLogId: ..., 
};

// Call the `listTimeEntriesByWorkLog()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listTimeEntriesByWorkLog(listTimeEntriesByWorkLogVars);
// Variables can be defined inline as well.
const { data } = await listTimeEntriesByWorkLog({ workLogId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listTimeEntriesByWorkLog(dataConnect, listTimeEntriesByWorkLogVars);

console.log(data.timeEntries);

// Or, you can use the `Promise` API.
listTimeEntriesByWorkLog(listTimeEntriesByWorkLogVars).then((response) => {
  const data = response.data;
  console.log(data.timeEntries);
});
```

### Using `ListTimeEntriesByWorkLog`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listTimeEntriesByWorkLogRef, ListTimeEntriesByWorkLogVariables } from '@dataconnect/generated';

// The `ListTimeEntriesByWorkLog` query requires an argument of type `ListTimeEntriesByWorkLogVariables`:
const listTimeEntriesByWorkLogVars: ListTimeEntriesByWorkLogVariables = {
  workLogId: ..., 
};

// Call the `listTimeEntriesByWorkLogRef()` function to get a reference to the query.
const ref = listTimeEntriesByWorkLogRef(listTimeEntriesByWorkLogVars);
// Variables can be defined inline as well.
const ref = listTimeEntriesByWorkLogRef({ workLogId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listTimeEntriesByWorkLogRef(dataConnect, listTimeEntriesByWorkLogVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.timeEntries);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.timeEntries);
});
```

## ListTimeEntriesByTicket
You can execute the `ListTimeEntriesByTicket` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listTimeEntriesByTicket(vars: ListTimeEntriesByTicketVariables, options?: ExecuteQueryOptions): QueryPromise<ListTimeEntriesByTicketData, ListTimeEntriesByTicketVariables>;

interface ListTimeEntriesByTicketRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListTimeEntriesByTicketVariables): QueryRef<ListTimeEntriesByTicketData, ListTimeEntriesByTicketVariables>;
}
export const listTimeEntriesByTicketRef: ListTimeEntriesByTicketRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listTimeEntriesByTicket(dc: DataConnect, vars: ListTimeEntriesByTicketVariables, options?: ExecuteQueryOptions): QueryPromise<ListTimeEntriesByTicketData, ListTimeEntriesByTicketVariables>;

interface ListTimeEntriesByTicketRef {
  ...
  (dc: DataConnect, vars: ListTimeEntriesByTicketVariables): QueryRef<ListTimeEntriesByTicketData, ListTimeEntriesByTicketVariables>;
}
export const listTimeEntriesByTicketRef: ListTimeEntriesByTicketRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listTimeEntriesByTicketRef:
```typescript
const name = listTimeEntriesByTicketRef.operationName;
console.log(name);
```

### Variables
The `ListTimeEntriesByTicket` query requires an argument of type `ListTimeEntriesByTicketVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListTimeEntriesByTicketVariables {
  ticketNumber: number;
}
```
### Return Type
Recall that executing the `ListTimeEntriesByTicket` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListTimeEntriesByTicketData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListTimeEntriesByTicket`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listTimeEntriesByTicket, ListTimeEntriesByTicketVariables } from '@dataconnect/generated';

// The `ListTimeEntriesByTicket` query requires an argument of type `ListTimeEntriesByTicketVariables`:
const listTimeEntriesByTicketVars: ListTimeEntriesByTicketVariables = {
  ticketNumber: ..., 
};

// Call the `listTimeEntriesByTicket()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listTimeEntriesByTicket(listTimeEntriesByTicketVars);
// Variables can be defined inline as well.
const { data } = await listTimeEntriesByTicket({ ticketNumber: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listTimeEntriesByTicket(dataConnect, listTimeEntriesByTicketVars);

console.log(data.timeEntries);

// Or, you can use the `Promise` API.
listTimeEntriesByTicket(listTimeEntriesByTicketVars).then((response) => {
  const data = response.data;
  console.log(data.timeEntries);
});
```

### Using `ListTimeEntriesByTicket`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listTimeEntriesByTicketRef, ListTimeEntriesByTicketVariables } from '@dataconnect/generated';

// The `ListTimeEntriesByTicket` query requires an argument of type `ListTimeEntriesByTicketVariables`:
const listTimeEntriesByTicketVars: ListTimeEntriesByTicketVariables = {
  ticketNumber: ..., 
};

// Call the `listTimeEntriesByTicketRef()` function to get a reference to the query.
const ref = listTimeEntriesByTicketRef(listTimeEntriesByTicketVars);
// Variables can be defined inline as well.
const ref = listTimeEntriesByTicketRef({ ticketNumber: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listTimeEntriesByTicketRef(dataConnect, listTimeEntriesByTicketVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.timeEntries);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.timeEntries);
});
```

## ListMyTimeEntries
You can execute the `ListMyTimeEntries` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listMyTimeEntries(vars?: ListMyTimeEntriesVariables, options?: ExecuteQueryOptions): QueryPromise<ListMyTimeEntriesData, ListMyTimeEntriesVariables>;

interface ListMyTimeEntriesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListMyTimeEntriesVariables): QueryRef<ListMyTimeEntriesData, ListMyTimeEntriesVariables>;
}
export const listMyTimeEntriesRef: ListMyTimeEntriesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listMyTimeEntries(dc: DataConnect, vars?: ListMyTimeEntriesVariables, options?: ExecuteQueryOptions): QueryPromise<ListMyTimeEntriesData, ListMyTimeEntriesVariables>;

interface ListMyTimeEntriesRef {
  ...
  (dc: DataConnect, vars?: ListMyTimeEntriesVariables): QueryRef<ListMyTimeEntriesData, ListMyTimeEntriesVariables>;
}
export const listMyTimeEntriesRef: ListMyTimeEntriesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listMyTimeEntriesRef:
```typescript
const name = listMyTimeEntriesRef.operationName;
console.log(name);
```

### Variables
The `ListMyTimeEntries` query has an optional argument of type `ListMyTimeEntriesVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListMyTimeEntriesVariables {
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that executing the `ListMyTimeEntries` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListMyTimeEntriesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListMyTimeEntries`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listMyTimeEntries, ListMyTimeEntriesVariables } from '@dataconnect/generated';

// The `ListMyTimeEntries` query has an optional argument of type `ListMyTimeEntriesVariables`:
const listMyTimeEntriesVars: ListMyTimeEntriesVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listMyTimeEntries()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listMyTimeEntries(listMyTimeEntriesVars);
// Variables can be defined inline as well.
const { data } = await listMyTimeEntries({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListMyTimeEntriesVariables` argument.
const { data } = await listMyTimeEntries();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listMyTimeEntries(dataConnect, listMyTimeEntriesVars);

console.log(data.timeEntries);

// Or, you can use the `Promise` API.
listMyTimeEntries(listMyTimeEntriesVars).then((response) => {
  const data = response.data;
  console.log(data.timeEntries);
});
```

### Using `ListMyTimeEntries`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listMyTimeEntriesRef, ListMyTimeEntriesVariables } from '@dataconnect/generated';

// The `ListMyTimeEntries` query has an optional argument of type `ListMyTimeEntriesVariables`:
const listMyTimeEntriesVars: ListMyTimeEntriesVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listMyTimeEntriesRef()` function to get a reference to the query.
const ref = listMyTimeEntriesRef(listMyTimeEntriesVars);
// Variables can be defined inline as well.
const ref = listMyTimeEntriesRef({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListMyTimeEntriesVariables` argument.
const ref = listMyTimeEntriesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listMyTimeEntriesRef(dataConnect, listMyTimeEntriesVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.timeEntries);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.timeEntries);
});
```

## ListTimeEntriesByDateRange
You can execute the `ListTimeEntriesByDateRange` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listTimeEntriesByDateRange(vars: ListTimeEntriesByDateRangeVariables, options?: ExecuteQueryOptions): QueryPromise<ListTimeEntriesByDateRangeData, ListTimeEntriesByDateRangeVariables>;

interface ListTimeEntriesByDateRangeRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListTimeEntriesByDateRangeVariables): QueryRef<ListTimeEntriesByDateRangeData, ListTimeEntriesByDateRangeVariables>;
}
export const listTimeEntriesByDateRangeRef: ListTimeEntriesByDateRangeRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listTimeEntriesByDateRange(dc: DataConnect, vars: ListTimeEntriesByDateRangeVariables, options?: ExecuteQueryOptions): QueryPromise<ListTimeEntriesByDateRangeData, ListTimeEntriesByDateRangeVariables>;

interface ListTimeEntriesByDateRangeRef {
  ...
  (dc: DataConnect, vars: ListTimeEntriesByDateRangeVariables): QueryRef<ListTimeEntriesByDateRangeData, ListTimeEntriesByDateRangeVariables>;
}
export const listTimeEntriesByDateRangeRef: ListTimeEntriesByDateRangeRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listTimeEntriesByDateRangeRef:
```typescript
const name = listTimeEntriesByDateRangeRef.operationName;
console.log(name);
```

### Variables
The `ListTimeEntriesByDateRange` query requires an argument of type `ListTimeEntriesByDateRangeVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListTimeEntriesByDateRangeVariables {
  userId: UUIDString;
  startDate: DateString;
  endDate: DateString;
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that executing the `ListTimeEntriesByDateRange` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListTimeEntriesByDateRangeData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `ListTimeEntriesByDateRange`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listTimeEntriesByDateRange, ListTimeEntriesByDateRangeVariables } from '@dataconnect/generated';

// The `ListTimeEntriesByDateRange` query requires an argument of type `ListTimeEntriesByDateRangeVariables`:
const listTimeEntriesByDateRangeVars: ListTimeEntriesByDateRangeVariables = {
  userId: ..., 
  startDate: ..., 
  endDate: ..., 
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listTimeEntriesByDateRange()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listTimeEntriesByDateRange(listTimeEntriesByDateRangeVars);
// Variables can be defined inline as well.
const { data } = await listTimeEntriesByDateRange({ userId: ..., startDate: ..., endDate: ..., limit: ..., offset: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listTimeEntriesByDateRange(dataConnect, listTimeEntriesByDateRangeVars);

console.log(data.timeEntries);

// Or, you can use the `Promise` API.
listTimeEntriesByDateRange(listTimeEntriesByDateRangeVars).then((response) => {
  const data = response.data;
  console.log(data.timeEntries);
});
```

### Using `ListTimeEntriesByDateRange`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listTimeEntriesByDateRangeRef, ListTimeEntriesByDateRangeVariables } from '@dataconnect/generated';

// The `ListTimeEntriesByDateRange` query requires an argument of type `ListTimeEntriesByDateRangeVariables`:
const listTimeEntriesByDateRangeVars: ListTimeEntriesByDateRangeVariables = {
  userId: ..., 
  startDate: ..., 
  endDate: ..., 
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listTimeEntriesByDateRangeRef()` function to get a reference to the query.
const ref = listTimeEntriesByDateRangeRef(listTimeEntriesByDateRangeVars);
// Variables can be defined inline as well.
const ref = listTimeEntriesByDateRangeRef({ userId: ..., startDate: ..., endDate: ..., limit: ..., offset: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listTimeEntriesByDateRangeRef(dataConnect, listTimeEntriesByDateRangeVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.timeEntries);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.timeEntries);
});
```

## ListUserTypes
You can execute the `ListUserTypes` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listUserTypes(options?: ExecuteQueryOptions): QueryPromise<ListUserTypesData, undefined>;

interface ListUserTypesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUserTypesData, undefined>;
}
export const listUserTypesRef: ListUserTypesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listUserTypes(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListUserTypesData, undefined>;

interface ListUserTypesRef {
  ...
  (dc: DataConnect): QueryRef<ListUserTypesData, undefined>;
}
export const listUserTypesRef: ListUserTypesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listUserTypesRef:
```typescript
const name = listUserTypesRef.operationName;
console.log(name);
```

### Variables
The `ListUserTypes` query has no variables.
### Return Type
Recall that executing the `ListUserTypes` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListUserTypesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListUserTypesData {
  userTypes: ({
    id: UUIDString;
    name: string;
  } & UserType_Key)[];
}
```
### Using `ListUserTypes`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listUserTypes } from '@dataconnect/generated';


// Call the `listUserTypes()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listUserTypes();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listUserTypes(dataConnect);

console.log(data.userTypes);

// Or, you can use the `Promise` API.
listUserTypes().then((response) => {
  const data = response.data;
  console.log(data.userTypes);
});
```

### Using `ListUserTypes`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listUserTypesRef } from '@dataconnect/generated';


// Call the `listUserTypesRef()` function to get a reference to the query.
const ref = listUserTypesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listUserTypesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.userTypes);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.userTypes);
});
```

## GetUserAccessByGoogleUid
You can execute the `GetUserAccessByGoogleUid` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUserAccessByGoogleUid(vars: GetUserAccessByGoogleUidVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserAccessByGoogleUidData, GetUserAccessByGoogleUidVariables>;

interface GetUserAccessByGoogleUidRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserAccessByGoogleUidVariables): QueryRef<GetUserAccessByGoogleUidData, GetUserAccessByGoogleUidVariables>;
}
export const getUserAccessByGoogleUidRef: GetUserAccessByGoogleUidRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserAccessByGoogleUid(dc: DataConnect, vars: GetUserAccessByGoogleUidVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserAccessByGoogleUidData, GetUserAccessByGoogleUidVariables>;

interface GetUserAccessByGoogleUidRef {
  ...
  (dc: DataConnect, vars: GetUserAccessByGoogleUidVariables): QueryRef<GetUserAccessByGoogleUidData, GetUserAccessByGoogleUidVariables>;
}
export const getUserAccessByGoogleUidRef: GetUserAccessByGoogleUidRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserAccessByGoogleUidRef:
```typescript
const name = getUserAccessByGoogleUidRef.operationName;
console.log(name);
```

### Variables
The `GetUserAccessByGoogleUid` query requires an argument of type `GetUserAccessByGoogleUidVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserAccessByGoogleUidVariables {
  googleUid: string;
}
```
### Return Type
Recall that executing the `GetUserAccessByGoogleUid` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserAccessByGoogleUidData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetUserAccessByGoogleUid`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserAccessByGoogleUid, GetUserAccessByGoogleUidVariables } from '@dataconnect/generated';

// The `GetUserAccessByGoogleUid` query requires an argument of type `GetUserAccessByGoogleUidVariables`:
const getUserAccessByGoogleUidVars: GetUserAccessByGoogleUidVariables = {
  googleUid: ..., 
};

// Call the `getUserAccessByGoogleUid()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserAccessByGoogleUid(getUserAccessByGoogleUidVars);
// Variables can be defined inline as well.
const { data } = await getUserAccessByGoogleUid({ googleUid: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserAccessByGoogleUid(dataConnect, getUserAccessByGoogleUidVars);

console.log(data.user);

// Or, you can use the `Promise` API.
getUserAccessByGoogleUid(getUserAccessByGoogleUidVars).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

### Using `GetUserAccessByGoogleUid`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserAccessByGoogleUidRef, GetUserAccessByGoogleUidVariables } from '@dataconnect/generated';

// The `GetUserAccessByGoogleUid` query requires an argument of type `GetUserAccessByGoogleUidVariables`:
const getUserAccessByGoogleUidVars: GetUserAccessByGoogleUidVariables = {
  googleUid: ..., 
};

// Call the `getUserAccessByGoogleUidRef()` function to get a reference to the query.
const ref = getUserAccessByGoogleUidRef(getUserAccessByGoogleUidVars);
// Variables can be defined inline as well.
const ref = getUserAccessByGoogleUidRef({ googleUid: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserAccessByGoogleUidRef(dataConnect, getUserAccessByGoogleUidVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.user);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

## AdminListUsers
You can execute the `AdminListUsers` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
adminListUsers(options?: ExecuteQueryOptions): QueryPromise<AdminListUsersData, undefined>;

interface AdminListUsersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<AdminListUsersData, undefined>;
}
export const adminListUsersRef: AdminListUsersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
adminListUsers(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<AdminListUsersData, undefined>;

interface AdminListUsersRef {
  ...
  (dc: DataConnect): QueryRef<AdminListUsersData, undefined>;
}
export const adminListUsersRef: AdminListUsersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the adminListUsersRef:
```typescript
const name = adminListUsersRef.operationName;
console.log(name);
```

### Variables
The `AdminListUsers` query has no variables.
### Return Type
Recall that executing the `AdminListUsers` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AdminListUsersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `AdminListUsers`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, adminListUsers } from '@dataconnect/generated';


// Call the `adminListUsers()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await adminListUsers();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await adminListUsers(dataConnect);

console.log(data.users);

// Or, you can use the `Promise` API.
adminListUsers().then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `AdminListUsers`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, adminListUsersRef } from '@dataconnect/generated';


// Call the `adminListUsersRef()` function to get a reference to the query.
const ref = adminListUsersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = adminListUsersRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

## AdminListUserTypes
You can execute the `AdminListUserTypes` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
adminListUserTypes(options?: ExecuteQueryOptions): QueryPromise<AdminListUserTypesData, undefined>;

interface AdminListUserTypesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<AdminListUserTypesData, undefined>;
}
export const adminListUserTypesRef: AdminListUserTypesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
adminListUserTypes(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<AdminListUserTypesData, undefined>;

interface AdminListUserTypesRef {
  ...
  (dc: DataConnect): QueryRef<AdminListUserTypesData, undefined>;
}
export const adminListUserTypesRef: AdminListUserTypesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the adminListUserTypesRef:
```typescript
const name = adminListUserTypesRef.operationName;
console.log(name);
```

### Variables
The `AdminListUserTypes` query has no variables.
### Return Type
Recall that executing the `AdminListUserTypes` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AdminListUserTypesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `AdminListUserTypes`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, adminListUserTypes } from '@dataconnect/generated';


// Call the `adminListUserTypes()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await adminListUserTypes();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await adminListUserTypes(dataConnect);

console.log(data.userTypes);

// Or, you can use the `Promise` API.
adminListUserTypes().then((response) => {
  const data = response.data;
  console.log(data.userTypes);
});
```

### Using `AdminListUserTypes`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, adminListUserTypesRef } from '@dataconnect/generated';


// Call the `adminListUserTypesRef()` function to get a reference to the query.
const ref = adminListUserTypesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = adminListUserTypesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.userTypes);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.userTypes);
});
```

## AdminListFeatures
You can execute the `AdminListFeatures` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
adminListFeatures(options?: ExecuteQueryOptions): QueryPromise<AdminListFeaturesData, undefined>;

interface AdminListFeaturesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<AdminListFeaturesData, undefined>;
}
export const adminListFeaturesRef: AdminListFeaturesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
adminListFeatures(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<AdminListFeaturesData, undefined>;

interface AdminListFeaturesRef {
  ...
  (dc: DataConnect): QueryRef<AdminListFeaturesData, undefined>;
}
export const adminListFeaturesRef: AdminListFeaturesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the adminListFeaturesRef:
```typescript
const name = adminListFeaturesRef.operationName;
console.log(name);
```

### Variables
The `AdminListFeatures` query has no variables.
### Return Type
Recall that executing the `AdminListFeatures` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AdminListFeaturesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AdminListFeaturesData {
  features: ({
    id: UUIDString;
    name: string;
    description?: string | null;
  } & Feature_Key)[];
}
```
### Using `AdminListFeatures`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, adminListFeatures } from '@dataconnect/generated';


// Call the `adminListFeatures()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await adminListFeatures();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await adminListFeatures(dataConnect);

console.log(data.features);

// Or, you can use the `Promise` API.
adminListFeatures().then((response) => {
  const data = response.data;
  console.log(data.features);
});
```

### Using `AdminListFeatures`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, adminListFeaturesRef } from '@dataconnect/generated';


// Call the `adminListFeaturesRef()` function to get a reference to the query.
const ref = adminListFeaturesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = adminListFeaturesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.features);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.features);
});
```

## AdminGetUser
You can execute the `AdminGetUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
adminGetUser(vars: AdminGetUserVariables, options?: ExecuteQueryOptions): QueryPromise<AdminGetUserData, AdminGetUserVariables>;

interface AdminGetUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: AdminGetUserVariables): QueryRef<AdminGetUserData, AdminGetUserVariables>;
}
export const adminGetUserRef: AdminGetUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
adminGetUser(dc: DataConnect, vars: AdminGetUserVariables, options?: ExecuteQueryOptions): QueryPromise<AdminGetUserData, AdminGetUserVariables>;

interface AdminGetUserRef {
  ...
  (dc: DataConnect, vars: AdminGetUserVariables): QueryRef<AdminGetUserData, AdminGetUserVariables>;
}
export const adminGetUserRef: AdminGetUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the adminGetUserRef:
```typescript
const name = adminGetUserRef.operationName;
console.log(name);
```

### Variables
The `AdminGetUser` query requires an argument of type `AdminGetUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface AdminGetUserVariables {
  userId: UUIDString;
}
```
### Return Type
Recall that executing the `AdminGetUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AdminGetUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `AdminGetUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, adminGetUser, AdminGetUserVariables } from '@dataconnect/generated';

// The `AdminGetUser` query requires an argument of type `AdminGetUserVariables`:
const adminGetUserVars: AdminGetUserVariables = {
  userId: ..., 
};

// Call the `adminGetUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await adminGetUser(adminGetUserVars);
// Variables can be defined inline as well.
const { data } = await adminGetUser({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await adminGetUser(dataConnect, adminGetUserVars);

console.log(data.user);

// Or, you can use the `Promise` API.
adminGetUser(adminGetUserVars).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

### Using `AdminGetUser`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, adminGetUserRef, AdminGetUserVariables } from '@dataconnect/generated';

// The `AdminGetUser` query requires an argument of type `AdminGetUserVariables`:
const adminGetUserVars: AdminGetUserVariables = {
  userId: ..., 
};

// Call the `adminGetUserRef()` function to get a reference to the query.
const ref = adminGetUserRef(adminGetUserVars);
// Variables can be defined inline as well.
const ref = adminGetUserRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = adminGetUserRef(dataConnect, adminGetUserVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.user);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

## AdminListTeams
You can execute the `AdminListTeams` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
adminListTeams(options?: ExecuteQueryOptions): QueryPromise<AdminListTeamsData, undefined>;

interface AdminListTeamsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<AdminListTeamsData, undefined>;
}
export const adminListTeamsRef: AdminListTeamsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
adminListTeams(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<AdminListTeamsData, undefined>;

interface AdminListTeamsRef {
  ...
  (dc: DataConnect): QueryRef<AdminListTeamsData, undefined>;
}
export const adminListTeamsRef: AdminListTeamsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the adminListTeamsRef:
```typescript
const name = adminListTeamsRef.operationName;
console.log(name);
```

### Variables
The `AdminListTeams` query has no variables.
### Return Type
Recall that executing the `AdminListTeams` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AdminListTeamsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `AdminListTeams`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, adminListTeams } from '@dataconnect/generated';


// Call the `adminListTeams()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await adminListTeams();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await adminListTeams(dataConnect);

console.log(data.teams);

// Or, you can use the `Promise` API.
adminListTeams().then((response) => {
  const data = response.data;
  console.log(data.teams);
});
```

### Using `AdminListTeams`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, adminListTeamsRef } from '@dataconnect/generated';


// Call the `adminListTeamsRef()` function to get a reference to the query.
const ref = adminListTeamsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = adminListTeamsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.teams);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.teams);
});
```

## GetGoogleCalendarConnection
You can execute the `GetGoogleCalendarConnection` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getGoogleCalendarConnection(vars: GetGoogleCalendarConnectionVariables, options?: ExecuteQueryOptions): QueryPromise<GetGoogleCalendarConnectionData, GetGoogleCalendarConnectionVariables>;

interface GetGoogleCalendarConnectionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetGoogleCalendarConnectionVariables): QueryRef<GetGoogleCalendarConnectionData, GetGoogleCalendarConnectionVariables>;
}
export const getGoogleCalendarConnectionRef: GetGoogleCalendarConnectionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getGoogleCalendarConnection(dc: DataConnect, vars: GetGoogleCalendarConnectionVariables, options?: ExecuteQueryOptions): QueryPromise<GetGoogleCalendarConnectionData, GetGoogleCalendarConnectionVariables>;

interface GetGoogleCalendarConnectionRef {
  ...
  (dc: DataConnect, vars: GetGoogleCalendarConnectionVariables): QueryRef<GetGoogleCalendarConnectionData, GetGoogleCalendarConnectionVariables>;
}
export const getGoogleCalendarConnectionRef: GetGoogleCalendarConnectionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getGoogleCalendarConnectionRef:
```typescript
const name = getGoogleCalendarConnectionRef.operationName;
console.log(name);
```

### Variables
The `GetGoogleCalendarConnection` query requires an argument of type `GetGoogleCalendarConnectionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetGoogleCalendarConnectionVariables {
  userId: UUIDString;
}
```
### Return Type
Recall that executing the `GetGoogleCalendarConnection` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetGoogleCalendarConnectionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetGoogleCalendarConnectionData {
  googleCalendarConnection?: {
    calendarId: string;
    googleEmail?: string | null;
    refreshTokenCipher: string;
    scope: string;
    mergeConsecutive: boolean;
    overwriteExisting: boolean;
    pruneOrphans: boolean;
    markAsFree: boolean;
    includeDescription: boolean;
    connectedAt: TimestampString;
    lastSyncedAt?: TimestampString | null;
  };
}
```
### Using `GetGoogleCalendarConnection`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getGoogleCalendarConnection, GetGoogleCalendarConnectionVariables } from '@dataconnect/generated';

// The `GetGoogleCalendarConnection` query requires an argument of type `GetGoogleCalendarConnectionVariables`:
const getGoogleCalendarConnectionVars: GetGoogleCalendarConnectionVariables = {
  userId: ..., 
};

// Call the `getGoogleCalendarConnection()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getGoogleCalendarConnection(getGoogleCalendarConnectionVars);
// Variables can be defined inline as well.
const { data } = await getGoogleCalendarConnection({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getGoogleCalendarConnection(dataConnect, getGoogleCalendarConnectionVars);

console.log(data.googleCalendarConnection);

// Or, you can use the `Promise` API.
getGoogleCalendarConnection(getGoogleCalendarConnectionVars).then((response) => {
  const data = response.data;
  console.log(data.googleCalendarConnection);
});
```

### Using `GetGoogleCalendarConnection`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getGoogleCalendarConnectionRef, GetGoogleCalendarConnectionVariables } from '@dataconnect/generated';

// The `GetGoogleCalendarConnection` query requires an argument of type `GetGoogleCalendarConnectionVariables`:
const getGoogleCalendarConnectionVars: GetGoogleCalendarConnectionVariables = {
  userId: ..., 
};

// Call the `getGoogleCalendarConnectionRef()` function to get a reference to the query.
const ref = getGoogleCalendarConnectionRef(getGoogleCalendarConnectionVars);
// Variables can be defined inline as well.
const ref = getGoogleCalendarConnectionRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getGoogleCalendarConnectionRef(dataConnect, getGoogleCalendarConnectionVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.googleCalendarConnection);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.googleCalendarConnection);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateUserFromGoogle
You can execute the `CreateUserFromGoogle` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createUserFromGoogle(vars: CreateUserFromGoogleVariables): MutationPromise<CreateUserFromGoogleData, CreateUserFromGoogleVariables>;

interface CreateUserFromGoogleRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserFromGoogleVariables): MutationRef<CreateUserFromGoogleData, CreateUserFromGoogleVariables>;
}
export const createUserFromGoogleRef: CreateUserFromGoogleRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createUserFromGoogle(dc: DataConnect, vars: CreateUserFromGoogleVariables): MutationPromise<CreateUserFromGoogleData, CreateUserFromGoogleVariables>;

interface CreateUserFromGoogleRef {
  ...
  (dc: DataConnect, vars: CreateUserFromGoogleVariables): MutationRef<CreateUserFromGoogleData, CreateUserFromGoogleVariables>;
}
export const createUserFromGoogleRef: CreateUserFromGoogleRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createUserFromGoogleRef:
```typescript
const name = createUserFromGoogleRef.operationName;
console.log(name);
```

### Variables
The `CreateUserFromGoogle` mutation requires an argument of type `CreateUserFromGoogleVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateUserFromGoogleVariables {
  googleUid: string;
  username: string;
  email: string;
  createdAt: TimestampString;
  userTypeName?: string;
}
```
### Return Type
Recall that executing the `CreateUserFromGoogle` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateUserFromGoogleData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateUserFromGoogleData {
  user_insert: User_Key;
}
```
### Using `CreateUserFromGoogle`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createUserFromGoogle, CreateUserFromGoogleVariables } from '@dataconnect/generated';

// The `CreateUserFromGoogle` mutation requires an argument of type `CreateUserFromGoogleVariables`:
const createUserFromGoogleVars: CreateUserFromGoogleVariables = {
  googleUid: ..., 
  username: ..., 
  email: ..., 
  createdAt: ..., 
  userTypeName: ..., // optional
};

// Call the `createUserFromGoogle()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createUserFromGoogle(createUserFromGoogleVars);
// Variables can be defined inline as well.
const { data } = await createUserFromGoogle({ googleUid: ..., username: ..., email: ..., createdAt: ..., userTypeName: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createUserFromGoogle(dataConnect, createUserFromGoogleVars);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createUserFromGoogle(createUserFromGoogleVars).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateUserFromGoogle`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createUserFromGoogleRef, CreateUserFromGoogleVariables } from '@dataconnect/generated';

// The `CreateUserFromGoogle` mutation requires an argument of type `CreateUserFromGoogleVariables`:
const createUserFromGoogleVars: CreateUserFromGoogleVariables = {
  googleUid: ..., 
  username: ..., 
  email: ..., 
  createdAt: ..., 
  userTypeName: ..., // optional
};

// Call the `createUserFromGoogleRef()` function to get a reference to the mutation.
const ref = createUserFromGoogleRef(createUserFromGoogleVars);
// Variables can be defined inline as well.
const ref = createUserFromGoogleRef({ googleUid: ..., username: ..., email: ..., createdAt: ..., userTypeName: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createUserFromGoogleRef(dataConnect, createUserFromGoogleVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## SetUserType
You can execute the `SetUserType` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
setUserType(vars: SetUserTypeVariables): MutationPromise<SetUserTypeData, SetUserTypeVariables>;

interface SetUserTypeRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SetUserTypeVariables): MutationRef<SetUserTypeData, SetUserTypeVariables>;
}
export const setUserTypeRef: SetUserTypeRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
setUserType(dc: DataConnect, vars: SetUserTypeVariables): MutationPromise<SetUserTypeData, SetUserTypeVariables>;

interface SetUserTypeRef {
  ...
  (dc: DataConnect, vars: SetUserTypeVariables): MutationRef<SetUserTypeData, SetUserTypeVariables>;
}
export const setUserTypeRef: SetUserTypeRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the setUserTypeRef:
```typescript
const name = setUserTypeRef.operationName;
console.log(name);
```

### Variables
The `SetUserType` mutation requires an argument of type `SetUserTypeVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SetUserTypeVariables {
  userId: UUIDString;
  userTypeName: string;
}
```
### Return Type
Recall that executing the `SetUserType` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SetUserTypeData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SetUserTypeData {
  user_update?: User_Key | null;
}
```
### Using `SetUserType`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, setUserType, SetUserTypeVariables } from '@dataconnect/generated';

// The `SetUserType` mutation requires an argument of type `SetUserTypeVariables`:
const setUserTypeVars: SetUserTypeVariables = {
  userId: ..., 
  userTypeName: ..., 
};

// Call the `setUserType()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await setUserType(setUserTypeVars);
// Variables can be defined inline as well.
const { data } = await setUserType({ userId: ..., userTypeName: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await setUserType(dataConnect, setUserTypeVars);

console.log(data.user_update);

// Or, you can use the `Promise` API.
setUserType(setUserTypeVars).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

### Using `SetUserType`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, setUserTypeRef, SetUserTypeVariables } from '@dataconnect/generated';

// The `SetUserType` mutation requires an argument of type `SetUserTypeVariables`:
const setUserTypeVars: SetUserTypeVariables = {
  userId: ..., 
  userTypeName: ..., 
};

// Call the `setUserTypeRef()` function to get a reference to the mutation.
const ref = setUserTypeRef(setUserTypeVars);
// Variables can be defined inline as well.
const ref = setUserTypeRef({ userId: ..., userTypeName: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = setUserTypeRef(dataConnect, setUserTypeVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

## CreateTimeEntry
You can execute the `CreateTimeEntry` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createTimeEntry(vars: CreateTimeEntryVariables): MutationPromise<CreateTimeEntryData, CreateTimeEntryVariables>;

interface CreateTimeEntryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTimeEntryVariables): MutationRef<CreateTimeEntryData, CreateTimeEntryVariables>;
}
export const createTimeEntryRef: CreateTimeEntryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createTimeEntry(dc: DataConnect, vars: CreateTimeEntryVariables): MutationPromise<CreateTimeEntryData, CreateTimeEntryVariables>;

interface CreateTimeEntryRef {
  ...
  (dc: DataConnect, vars: CreateTimeEntryVariables): MutationRef<CreateTimeEntryData, CreateTimeEntryVariables>;
}
export const createTimeEntryRef: CreateTimeEntryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createTimeEntryRef:
```typescript
const name = createTimeEntryRef.operationName;
console.log(name);
```

### Variables
The `CreateTimeEntry` mutation requires an argument of type `CreateTimeEntryVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `CreateTimeEntry` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateTimeEntryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateTimeEntryData {
  timeEntry_insert: TimeEntry_Key;
}
```
### Using `CreateTimeEntry`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createTimeEntry, CreateTimeEntryVariables } from '@dataconnect/generated';

// The `CreateTimeEntry` mutation requires an argument of type `CreateTimeEntryVariables`:
const createTimeEntryVars: CreateTimeEntryVariables = {
  userId: ..., 
  workLogId: ..., // optional
  startTime: ..., 
  endTime: ..., 
  date: ..., 
  createdAt: ..., 
  description: ..., // optional
  ticketNumber: ..., // optional
};

// Call the `createTimeEntry()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createTimeEntry(createTimeEntryVars);
// Variables can be defined inline as well.
const { data } = await createTimeEntry({ userId: ..., workLogId: ..., startTime: ..., endTime: ..., date: ..., createdAt: ..., description: ..., ticketNumber: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createTimeEntry(dataConnect, createTimeEntryVars);

console.log(data.timeEntry_insert);

// Or, you can use the `Promise` API.
createTimeEntry(createTimeEntryVars).then((response) => {
  const data = response.data;
  console.log(data.timeEntry_insert);
});
```

### Using `CreateTimeEntry`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createTimeEntryRef, CreateTimeEntryVariables } from '@dataconnect/generated';

// The `CreateTimeEntry` mutation requires an argument of type `CreateTimeEntryVariables`:
const createTimeEntryVars: CreateTimeEntryVariables = {
  userId: ..., 
  workLogId: ..., // optional
  startTime: ..., 
  endTime: ..., 
  date: ..., 
  createdAt: ..., 
  description: ..., // optional
  ticketNumber: ..., // optional
};

// Call the `createTimeEntryRef()` function to get a reference to the mutation.
const ref = createTimeEntryRef(createTimeEntryVars);
// Variables can be defined inline as well.
const ref = createTimeEntryRef({ userId: ..., workLogId: ..., startTime: ..., endTime: ..., date: ..., createdAt: ..., description: ..., ticketNumber: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createTimeEntryRef(dataConnect, createTimeEntryVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.timeEntry_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.timeEntry_insert);
});
```

## CreateWorkLogOnly
You can execute the `CreateWorkLogOnly` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createWorkLogOnly(vars: CreateWorkLogOnlyVariables): MutationPromise<CreateWorkLogOnlyData, CreateWorkLogOnlyVariables>;

interface CreateWorkLogOnlyRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateWorkLogOnlyVariables): MutationRef<CreateWorkLogOnlyData, CreateWorkLogOnlyVariables>;
}
export const createWorkLogOnlyRef: CreateWorkLogOnlyRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createWorkLogOnly(dc: DataConnect, vars: CreateWorkLogOnlyVariables): MutationPromise<CreateWorkLogOnlyData, CreateWorkLogOnlyVariables>;

interface CreateWorkLogOnlyRef {
  ...
  (dc: DataConnect, vars: CreateWorkLogOnlyVariables): MutationRef<CreateWorkLogOnlyData, CreateWorkLogOnlyVariables>;
}
export const createWorkLogOnlyRef: CreateWorkLogOnlyRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createWorkLogOnlyRef:
```typescript
const name = createWorkLogOnlyRef.operationName;
console.log(name);
```

### Variables
The `CreateWorkLogOnly` mutation requires an argument of type `CreateWorkLogOnlyVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateWorkLogOnlyVariables {
  userId: UUIDString;
  workLogId: UUIDString;
  name: string;
  description?: string | null;
  workLogDate: TimestampString;
}
```
### Return Type
Recall that executing the `CreateWorkLogOnly` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateWorkLogOnlyData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateWorkLogOnlyData {
  workLog_insert: WorkLog_Key;
}
```
### Using `CreateWorkLogOnly`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createWorkLogOnly, CreateWorkLogOnlyVariables } from '@dataconnect/generated';

// The `CreateWorkLogOnly` mutation requires an argument of type `CreateWorkLogOnlyVariables`:
const createWorkLogOnlyVars: CreateWorkLogOnlyVariables = {
  userId: ..., 
  workLogId: ..., 
  name: ..., 
  description: ..., // optional
  workLogDate: ..., 
};

// Call the `createWorkLogOnly()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createWorkLogOnly(createWorkLogOnlyVars);
// Variables can be defined inline as well.
const { data } = await createWorkLogOnly({ userId: ..., workLogId: ..., name: ..., description: ..., workLogDate: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createWorkLogOnly(dataConnect, createWorkLogOnlyVars);

console.log(data.workLog_insert);

// Or, you can use the `Promise` API.
createWorkLogOnly(createWorkLogOnlyVars).then((response) => {
  const data = response.data;
  console.log(data.workLog_insert);
});
```

### Using `CreateWorkLogOnly`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createWorkLogOnlyRef, CreateWorkLogOnlyVariables } from '@dataconnect/generated';

// The `CreateWorkLogOnly` mutation requires an argument of type `CreateWorkLogOnlyVariables`:
const createWorkLogOnlyVars: CreateWorkLogOnlyVariables = {
  userId: ..., 
  workLogId: ..., 
  name: ..., 
  description: ..., // optional
  workLogDate: ..., 
};

// Call the `createWorkLogOnlyRef()` function to get a reference to the mutation.
const ref = createWorkLogOnlyRef(createWorkLogOnlyVars);
// Variables can be defined inline as well.
const ref = createWorkLogOnlyRef({ userId: ..., workLogId: ..., name: ..., description: ..., workLogDate: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createWorkLogOnlyRef(dataConnect, createWorkLogOnlyVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.workLog_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.workLog_insert);
});
```

## UpdateTimeEntry
You can execute the `UpdateTimeEntry` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateTimeEntry(vars: UpdateTimeEntryVariables): MutationPromise<UpdateTimeEntryData, UpdateTimeEntryVariables>;

interface UpdateTimeEntryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTimeEntryVariables): MutationRef<UpdateTimeEntryData, UpdateTimeEntryVariables>;
}
export const updateTimeEntryRef: UpdateTimeEntryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateTimeEntry(dc: DataConnect, vars: UpdateTimeEntryVariables): MutationPromise<UpdateTimeEntryData, UpdateTimeEntryVariables>;

interface UpdateTimeEntryRef {
  ...
  (dc: DataConnect, vars: UpdateTimeEntryVariables): MutationRef<UpdateTimeEntryData, UpdateTimeEntryVariables>;
}
export const updateTimeEntryRef: UpdateTimeEntryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateTimeEntryRef:
```typescript
const name = updateTimeEntryRef.operationName;
console.log(name);
```

### Variables
The `UpdateTimeEntry` mutation requires an argument of type `UpdateTimeEntryVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateTimeEntryVariables {
  entryId: UUIDString;
  description?: string | null;
  ticketNumber: number;
}
```
### Return Type
Recall that executing the `UpdateTimeEntry` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateTimeEntryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateTimeEntryData {
  timeEntry_update?: TimeEntry_Key | null;
}
```
### Using `UpdateTimeEntry`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateTimeEntry, UpdateTimeEntryVariables } from '@dataconnect/generated';

// The `UpdateTimeEntry` mutation requires an argument of type `UpdateTimeEntryVariables`:
const updateTimeEntryVars: UpdateTimeEntryVariables = {
  entryId: ..., 
  description: ..., // optional
  ticketNumber: ..., 
};

// Call the `updateTimeEntry()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateTimeEntry(updateTimeEntryVars);
// Variables can be defined inline as well.
const { data } = await updateTimeEntry({ entryId: ..., description: ..., ticketNumber: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateTimeEntry(dataConnect, updateTimeEntryVars);

console.log(data.timeEntry_update);

// Or, you can use the `Promise` API.
updateTimeEntry(updateTimeEntryVars).then((response) => {
  const data = response.data;
  console.log(data.timeEntry_update);
});
```

### Using `UpdateTimeEntry`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateTimeEntryRef, UpdateTimeEntryVariables } from '@dataconnect/generated';

// The `UpdateTimeEntry` mutation requires an argument of type `UpdateTimeEntryVariables`:
const updateTimeEntryVars: UpdateTimeEntryVariables = {
  entryId: ..., 
  description: ..., // optional
  ticketNumber: ..., 
};

// Call the `updateTimeEntryRef()` function to get a reference to the mutation.
const ref = updateTimeEntryRef(updateTimeEntryVars);
// Variables can be defined inline as well.
const ref = updateTimeEntryRef({ entryId: ..., description: ..., ticketNumber: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateTimeEntryRef(dataConnect, updateTimeEntryVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.timeEntry_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.timeEntry_update);
});
```

## UpdateTimeEntryClearTicket
You can execute the `UpdateTimeEntryClearTicket` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateTimeEntryClearTicket(vars: UpdateTimeEntryClearTicketVariables): MutationPromise<UpdateTimeEntryClearTicketData, UpdateTimeEntryClearTicketVariables>;

interface UpdateTimeEntryClearTicketRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTimeEntryClearTicketVariables): MutationRef<UpdateTimeEntryClearTicketData, UpdateTimeEntryClearTicketVariables>;
}
export const updateTimeEntryClearTicketRef: UpdateTimeEntryClearTicketRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateTimeEntryClearTicket(dc: DataConnect, vars: UpdateTimeEntryClearTicketVariables): MutationPromise<UpdateTimeEntryClearTicketData, UpdateTimeEntryClearTicketVariables>;

interface UpdateTimeEntryClearTicketRef {
  ...
  (dc: DataConnect, vars: UpdateTimeEntryClearTicketVariables): MutationRef<UpdateTimeEntryClearTicketData, UpdateTimeEntryClearTicketVariables>;
}
export const updateTimeEntryClearTicketRef: UpdateTimeEntryClearTicketRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateTimeEntryClearTicketRef:
```typescript
const name = updateTimeEntryClearTicketRef.operationName;
console.log(name);
```

### Variables
The `UpdateTimeEntryClearTicket` mutation requires an argument of type `UpdateTimeEntryClearTicketVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateTimeEntryClearTicketVariables {
  entryId: UUIDString;
  description?: string | null;
}
```
### Return Type
Recall that executing the `UpdateTimeEntryClearTicket` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateTimeEntryClearTicketData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateTimeEntryClearTicketData {
  timeEntry_update?: TimeEntry_Key | null;
}
```
### Using `UpdateTimeEntryClearTicket`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateTimeEntryClearTicket, UpdateTimeEntryClearTicketVariables } from '@dataconnect/generated';

// The `UpdateTimeEntryClearTicket` mutation requires an argument of type `UpdateTimeEntryClearTicketVariables`:
const updateTimeEntryClearTicketVars: UpdateTimeEntryClearTicketVariables = {
  entryId: ..., 
  description: ..., // optional
};

// Call the `updateTimeEntryClearTicket()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateTimeEntryClearTicket(updateTimeEntryClearTicketVars);
// Variables can be defined inline as well.
const { data } = await updateTimeEntryClearTicket({ entryId: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateTimeEntryClearTicket(dataConnect, updateTimeEntryClearTicketVars);

console.log(data.timeEntry_update);

// Or, you can use the `Promise` API.
updateTimeEntryClearTicket(updateTimeEntryClearTicketVars).then((response) => {
  const data = response.data;
  console.log(data.timeEntry_update);
});
```

### Using `UpdateTimeEntryClearTicket`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateTimeEntryClearTicketRef, UpdateTimeEntryClearTicketVariables } from '@dataconnect/generated';

// The `UpdateTimeEntryClearTicket` mutation requires an argument of type `UpdateTimeEntryClearTicketVariables`:
const updateTimeEntryClearTicketVars: UpdateTimeEntryClearTicketVariables = {
  entryId: ..., 
  description: ..., // optional
};

// Call the `updateTimeEntryClearTicketRef()` function to get a reference to the mutation.
const ref = updateTimeEntryClearTicketRef(updateTimeEntryClearTicketVars);
// Variables can be defined inline as well.
const ref = updateTimeEntryClearTicketRef({ entryId: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateTimeEntryClearTicketRef(dataConnect, updateTimeEntryClearTicketVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.timeEntry_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.timeEntry_update);
});
```

## DeleteTimeEntry
You can execute the `DeleteTimeEntry` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteTimeEntry(vars: DeleteTimeEntryVariables): MutationPromise<DeleteTimeEntryData, DeleteTimeEntryVariables>;

interface DeleteTimeEntryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteTimeEntryVariables): MutationRef<DeleteTimeEntryData, DeleteTimeEntryVariables>;
}
export const deleteTimeEntryRef: DeleteTimeEntryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteTimeEntry(dc: DataConnect, vars: DeleteTimeEntryVariables): MutationPromise<DeleteTimeEntryData, DeleteTimeEntryVariables>;

interface DeleteTimeEntryRef {
  ...
  (dc: DataConnect, vars: DeleteTimeEntryVariables): MutationRef<DeleteTimeEntryData, DeleteTimeEntryVariables>;
}
export const deleteTimeEntryRef: DeleteTimeEntryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteTimeEntryRef:
```typescript
const name = deleteTimeEntryRef.operationName;
console.log(name);
```

### Variables
The `DeleteTimeEntry` mutation requires an argument of type `DeleteTimeEntryVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteTimeEntryVariables {
  entryId: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteTimeEntry` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteTimeEntryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteTimeEntryData {
  timeEntry_delete?: TimeEntry_Key | null;
}
```
### Using `DeleteTimeEntry`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteTimeEntry, DeleteTimeEntryVariables } from '@dataconnect/generated';

// The `DeleteTimeEntry` mutation requires an argument of type `DeleteTimeEntryVariables`:
const deleteTimeEntryVars: DeleteTimeEntryVariables = {
  entryId: ..., 
};

// Call the `deleteTimeEntry()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteTimeEntry(deleteTimeEntryVars);
// Variables can be defined inline as well.
const { data } = await deleteTimeEntry({ entryId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteTimeEntry(dataConnect, deleteTimeEntryVars);

console.log(data.timeEntry_delete);

// Or, you can use the `Promise` API.
deleteTimeEntry(deleteTimeEntryVars).then((response) => {
  const data = response.data;
  console.log(data.timeEntry_delete);
});
```

### Using `DeleteTimeEntry`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteTimeEntryRef, DeleteTimeEntryVariables } from '@dataconnect/generated';

// The `DeleteTimeEntry` mutation requires an argument of type `DeleteTimeEntryVariables`:
const deleteTimeEntryVars: DeleteTimeEntryVariables = {
  entryId: ..., 
};

// Call the `deleteTimeEntryRef()` function to get a reference to the mutation.
const ref = deleteTimeEntryRef(deleteTimeEntryVars);
// Variables can be defined inline as well.
const ref = deleteTimeEntryRef({ entryId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteTimeEntryRef(dataConnect, deleteTimeEntryVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.timeEntry_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.timeEntry_delete);
});
```

## UpsertTicket
You can execute the `UpsertTicket` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
upsertTicket(vars: UpsertTicketVariables): MutationPromise<UpsertTicketData, UpsertTicketVariables>;

interface UpsertTicketRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertTicketVariables): MutationRef<UpsertTicketData, UpsertTicketVariables>;
}
export const upsertTicketRef: UpsertTicketRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertTicket(dc: DataConnect, vars: UpsertTicketVariables): MutationPromise<UpsertTicketData, UpsertTicketVariables>;

interface UpsertTicketRef {
  ...
  (dc: DataConnect, vars: UpsertTicketVariables): MutationRef<UpsertTicketData, UpsertTicketVariables>;
}
export const upsertTicketRef: UpsertTicketRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertTicketRef:
```typescript
const name = upsertTicketRef.operationName;
console.log(name);
```

### Variables
The `UpsertTicket` mutation requires an argument of type `UpsertTicketVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertTicketVariables {
  ticketNumber: number;
  office?: string | null;
  ticketTitle?: string | null;
  ticketLink?: string | null;
  color?: string | null;
}
```
### Return Type
Recall that executing the `UpsertTicket` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertTicketData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertTicketData {
  ticket_upsert: Ticket_Key;
}
```
### Using `UpsertTicket`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertTicket, UpsertTicketVariables } from '@dataconnect/generated';

// The `UpsertTicket` mutation requires an argument of type `UpsertTicketVariables`:
const upsertTicketVars: UpsertTicketVariables = {
  ticketNumber: ..., 
  office: ..., // optional
  ticketTitle: ..., // optional
  ticketLink: ..., // optional
  color: ..., // optional
};

// Call the `upsertTicket()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertTicket(upsertTicketVars);
// Variables can be defined inline as well.
const { data } = await upsertTicket({ ticketNumber: ..., office: ..., ticketTitle: ..., ticketLink: ..., color: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertTicket(dataConnect, upsertTicketVars);

console.log(data.ticket_upsert);

// Or, you can use the `Promise` API.
upsertTicket(upsertTicketVars).then((response) => {
  const data = response.data;
  console.log(data.ticket_upsert);
});
```

### Using `UpsertTicket`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertTicketRef, UpsertTicketVariables } from '@dataconnect/generated';

// The `UpsertTicket` mutation requires an argument of type `UpsertTicketVariables`:
const upsertTicketVars: UpsertTicketVariables = {
  ticketNumber: ..., 
  office: ..., // optional
  ticketTitle: ..., // optional
  ticketLink: ..., // optional
  color: ..., // optional
};

// Call the `upsertTicketRef()` function to get a reference to the mutation.
const ref = upsertTicketRef(upsertTicketVars);
// Variables can be defined inline as well.
const ref = upsertTicketRef({ ticketNumber: ..., office: ..., ticketTitle: ..., ticketLink: ..., color: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertTicketRef(dataConnect, upsertTicketVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.ticket_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.ticket_upsert);
});
```

## UpdateTicket
You can execute the `UpdateTicket` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateTicket(vars: UpdateTicketVariables): MutationPromise<UpdateTicketData, UpdateTicketVariables>;

interface UpdateTicketRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTicketVariables): MutationRef<UpdateTicketData, UpdateTicketVariables>;
}
export const updateTicketRef: UpdateTicketRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateTicket(dc: DataConnect, vars: UpdateTicketVariables): MutationPromise<UpdateTicketData, UpdateTicketVariables>;

interface UpdateTicketRef {
  ...
  (dc: DataConnect, vars: UpdateTicketVariables): MutationRef<UpdateTicketData, UpdateTicketVariables>;
}
export const updateTicketRef: UpdateTicketRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateTicketRef:
```typescript
const name = updateTicketRef.operationName;
console.log(name);
```

### Variables
The `UpdateTicket` mutation requires an argument of type `UpdateTicketVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateTicketVariables {
  ticketNumber: number;
  office?: string | null;
  ticketTitle?: string | null;
  ticketLink?: string | null;
  color?: string | null;
}
```
### Return Type
Recall that executing the `UpdateTicket` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateTicketData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateTicketData {
  ticket_update?: Ticket_Key | null;
}
```
### Using `UpdateTicket`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateTicket, UpdateTicketVariables } from '@dataconnect/generated';

// The `UpdateTicket` mutation requires an argument of type `UpdateTicketVariables`:
const updateTicketVars: UpdateTicketVariables = {
  ticketNumber: ..., 
  office: ..., // optional
  ticketTitle: ..., // optional
  ticketLink: ..., // optional
  color: ..., // optional
};

// Call the `updateTicket()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateTicket(updateTicketVars);
// Variables can be defined inline as well.
const { data } = await updateTicket({ ticketNumber: ..., office: ..., ticketTitle: ..., ticketLink: ..., color: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateTicket(dataConnect, updateTicketVars);

console.log(data.ticket_update);

// Or, you can use the `Promise` API.
updateTicket(updateTicketVars).then((response) => {
  const data = response.data;
  console.log(data.ticket_update);
});
```

### Using `UpdateTicket`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateTicketRef, UpdateTicketVariables } from '@dataconnect/generated';

// The `UpdateTicket` mutation requires an argument of type `UpdateTicketVariables`:
const updateTicketVars: UpdateTicketVariables = {
  ticketNumber: ..., 
  office: ..., // optional
  ticketTitle: ..., // optional
  ticketLink: ..., // optional
  color: ..., // optional
};

// Call the `updateTicketRef()` function to get a reference to the mutation.
const ref = updateTicketRef(updateTicketVars);
// Variables can be defined inline as well.
const ref = updateTicketRef({ ticketNumber: ..., office: ..., ticketTitle: ..., ticketLink: ..., color: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateTicketRef(dataConnect, updateTicketVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.ticket_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.ticket_update);
});
```

## SelectMyColorScheme
You can execute the `SelectMyColorScheme` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
selectMyColorScheme(vars: SelectMyColorSchemeVariables): MutationPromise<SelectMyColorSchemeData, SelectMyColorSchemeVariables>;

interface SelectMyColorSchemeRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SelectMyColorSchemeVariables): MutationRef<SelectMyColorSchemeData, SelectMyColorSchemeVariables>;
}
export const selectMyColorSchemeRef: SelectMyColorSchemeRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
selectMyColorScheme(dc: DataConnect, vars: SelectMyColorSchemeVariables): MutationPromise<SelectMyColorSchemeData, SelectMyColorSchemeVariables>;

interface SelectMyColorSchemeRef {
  ...
  (dc: DataConnect, vars: SelectMyColorSchemeVariables): MutationRef<SelectMyColorSchemeData, SelectMyColorSchemeVariables>;
}
export const selectMyColorSchemeRef: SelectMyColorSchemeRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the selectMyColorSchemeRef:
```typescript
const name = selectMyColorSchemeRef.operationName;
console.log(name);
```

### Variables
The `SelectMyColorScheme` mutation requires an argument of type `SelectMyColorSchemeVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SelectMyColorSchemeVariables {
  colorSchemeId: UUIDString;
}
```
### Return Type
Recall that executing the `SelectMyColorScheme` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SelectMyColorSchemeData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SelectMyColorSchemeData {
  user_update?: User_Key | null;
}
```
### Using `SelectMyColorScheme`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, selectMyColorScheme, SelectMyColorSchemeVariables } from '@dataconnect/generated';

// The `SelectMyColorScheme` mutation requires an argument of type `SelectMyColorSchemeVariables`:
const selectMyColorSchemeVars: SelectMyColorSchemeVariables = {
  colorSchemeId: ..., 
};

// Call the `selectMyColorScheme()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await selectMyColorScheme(selectMyColorSchemeVars);
// Variables can be defined inline as well.
const { data } = await selectMyColorScheme({ colorSchemeId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await selectMyColorScheme(dataConnect, selectMyColorSchemeVars);

console.log(data.user_update);

// Or, you can use the `Promise` API.
selectMyColorScheme(selectMyColorSchemeVars).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

### Using `SelectMyColorScheme`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, selectMyColorSchemeRef, SelectMyColorSchemeVariables } from '@dataconnect/generated';

// The `SelectMyColorScheme` mutation requires an argument of type `SelectMyColorSchemeVariables`:
const selectMyColorSchemeVars: SelectMyColorSchemeVariables = {
  colorSchemeId: ..., 
};

// Call the `selectMyColorSchemeRef()` function to get a reference to the mutation.
const ref = selectMyColorSchemeRef(selectMyColorSchemeVars);
// Variables can be defined inline as well.
const ref = selectMyColorSchemeRef({ colorSchemeId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = selectMyColorSchemeRef(dataConnect, selectMyColorSchemeVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

## ClearMyColorScheme
You can execute the `ClearMyColorScheme` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
clearMyColorScheme(): MutationPromise<ClearMyColorSchemeData, undefined>;

interface ClearMyColorSchemeRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<ClearMyColorSchemeData, undefined>;
}
export const clearMyColorSchemeRef: ClearMyColorSchemeRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
clearMyColorScheme(dc: DataConnect): MutationPromise<ClearMyColorSchemeData, undefined>;

interface ClearMyColorSchemeRef {
  ...
  (dc: DataConnect): MutationRef<ClearMyColorSchemeData, undefined>;
}
export const clearMyColorSchemeRef: ClearMyColorSchemeRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the clearMyColorSchemeRef:
```typescript
const name = clearMyColorSchemeRef.operationName;
console.log(name);
```

### Variables
The `ClearMyColorScheme` mutation has no variables.
### Return Type
Recall that executing the `ClearMyColorScheme` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ClearMyColorSchemeData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ClearMyColorSchemeData {
  user_update?: User_Key | null;
}
```
### Using `ClearMyColorScheme`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, clearMyColorScheme } from '@dataconnect/generated';


// Call the `clearMyColorScheme()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await clearMyColorScheme();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await clearMyColorScheme(dataConnect);

console.log(data.user_update);

// Or, you can use the `Promise` API.
clearMyColorScheme().then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

### Using `ClearMyColorScheme`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, clearMyColorSchemeRef } from '@dataconnect/generated';


// Call the `clearMyColorSchemeRef()` function to get a reference to the mutation.
const ref = clearMyColorSchemeRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = clearMyColorSchemeRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

## SelectMyPerformanceMode
You can execute the `SelectMyPerformanceMode` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
selectMyPerformanceMode(vars: SelectMyPerformanceModeVariables): MutationPromise<SelectMyPerformanceModeData, SelectMyPerformanceModeVariables>;

interface SelectMyPerformanceModeRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SelectMyPerformanceModeVariables): MutationRef<SelectMyPerformanceModeData, SelectMyPerformanceModeVariables>;
}
export const selectMyPerformanceModeRef: SelectMyPerformanceModeRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
selectMyPerformanceMode(dc: DataConnect, vars: SelectMyPerformanceModeVariables): MutationPromise<SelectMyPerformanceModeData, SelectMyPerformanceModeVariables>;

interface SelectMyPerformanceModeRef {
  ...
  (dc: DataConnect, vars: SelectMyPerformanceModeVariables): MutationRef<SelectMyPerformanceModeData, SelectMyPerformanceModeVariables>;
}
export const selectMyPerformanceModeRef: SelectMyPerformanceModeRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the selectMyPerformanceModeRef:
```typescript
const name = selectMyPerformanceModeRef.operationName;
console.log(name);
```

### Variables
The `SelectMyPerformanceMode` mutation requires an argument of type `SelectMyPerformanceModeVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SelectMyPerformanceModeVariables {
  performanceMode: boolean;
}
```
### Return Type
Recall that executing the `SelectMyPerformanceMode` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SelectMyPerformanceModeData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SelectMyPerformanceModeData {
  user_update?: User_Key | null;
}
```
### Using `SelectMyPerformanceMode`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, selectMyPerformanceMode, SelectMyPerformanceModeVariables } from '@dataconnect/generated';

// The `SelectMyPerformanceMode` mutation requires an argument of type `SelectMyPerformanceModeVariables`:
const selectMyPerformanceModeVars: SelectMyPerformanceModeVariables = {
  performanceMode: ..., 
};

// Call the `selectMyPerformanceMode()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await selectMyPerformanceMode(selectMyPerformanceModeVars);
// Variables can be defined inline as well.
const { data } = await selectMyPerformanceMode({ performanceMode: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await selectMyPerformanceMode(dataConnect, selectMyPerformanceModeVars);

console.log(data.user_update);

// Or, you can use the `Promise` API.
selectMyPerformanceMode(selectMyPerformanceModeVars).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

### Using `SelectMyPerformanceMode`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, selectMyPerformanceModeRef, SelectMyPerformanceModeVariables } from '@dataconnect/generated';

// The `SelectMyPerformanceMode` mutation requires an argument of type `SelectMyPerformanceModeVariables`:
const selectMyPerformanceModeVars: SelectMyPerformanceModeVariables = {
  performanceMode: ..., 
};

// Call the `selectMyPerformanceModeRef()` function to get a reference to the mutation.
const ref = selectMyPerformanceModeRef(selectMyPerformanceModeVars);
// Variables can be defined inline as well.
const ref = selectMyPerformanceModeRef({ performanceMode: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = selectMyPerformanceModeRef(dataConnect, selectMyPerformanceModeVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

## SelectMyBackgroundOpacity
You can execute the `SelectMyBackgroundOpacity` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
selectMyBackgroundOpacity(vars: SelectMyBackgroundOpacityVariables): MutationPromise<SelectMyBackgroundOpacityData, SelectMyBackgroundOpacityVariables>;

interface SelectMyBackgroundOpacityRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SelectMyBackgroundOpacityVariables): MutationRef<SelectMyBackgroundOpacityData, SelectMyBackgroundOpacityVariables>;
}
export const selectMyBackgroundOpacityRef: SelectMyBackgroundOpacityRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
selectMyBackgroundOpacity(dc: DataConnect, vars: SelectMyBackgroundOpacityVariables): MutationPromise<SelectMyBackgroundOpacityData, SelectMyBackgroundOpacityVariables>;

interface SelectMyBackgroundOpacityRef {
  ...
  (dc: DataConnect, vars: SelectMyBackgroundOpacityVariables): MutationRef<SelectMyBackgroundOpacityData, SelectMyBackgroundOpacityVariables>;
}
export const selectMyBackgroundOpacityRef: SelectMyBackgroundOpacityRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the selectMyBackgroundOpacityRef:
```typescript
const name = selectMyBackgroundOpacityRef.operationName;
console.log(name);
```

### Variables
The `SelectMyBackgroundOpacity` mutation requires an argument of type `SelectMyBackgroundOpacityVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SelectMyBackgroundOpacityVariables {
  backgroundOpacity: number;
}
```
### Return Type
Recall that executing the `SelectMyBackgroundOpacity` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SelectMyBackgroundOpacityData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SelectMyBackgroundOpacityData {
  user_update?: User_Key | null;
}
```
### Using `SelectMyBackgroundOpacity`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, selectMyBackgroundOpacity, SelectMyBackgroundOpacityVariables } from '@dataconnect/generated';

// The `SelectMyBackgroundOpacity` mutation requires an argument of type `SelectMyBackgroundOpacityVariables`:
const selectMyBackgroundOpacityVars: SelectMyBackgroundOpacityVariables = {
  backgroundOpacity: ..., 
};

// Call the `selectMyBackgroundOpacity()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await selectMyBackgroundOpacity(selectMyBackgroundOpacityVars);
// Variables can be defined inline as well.
const { data } = await selectMyBackgroundOpacity({ backgroundOpacity: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await selectMyBackgroundOpacity(dataConnect, selectMyBackgroundOpacityVars);

console.log(data.user_update);

// Or, you can use the `Promise` API.
selectMyBackgroundOpacity(selectMyBackgroundOpacityVars).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

### Using `SelectMyBackgroundOpacity`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, selectMyBackgroundOpacityRef, SelectMyBackgroundOpacityVariables } from '@dataconnect/generated';

// The `SelectMyBackgroundOpacity` mutation requires an argument of type `SelectMyBackgroundOpacityVariables`:
const selectMyBackgroundOpacityVars: SelectMyBackgroundOpacityVariables = {
  backgroundOpacity: ..., 
};

// Call the `selectMyBackgroundOpacityRef()` function to get a reference to the mutation.
const ref = selectMyBackgroundOpacityRef(selectMyBackgroundOpacityVars);
// Variables can be defined inline as well.
const ref = selectMyBackgroundOpacityRef({ backgroundOpacity: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = selectMyBackgroundOpacityRef(dataConnect, selectMyBackgroundOpacityVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

## SelectMyExternalTicketLinkTemplate
You can execute the `SelectMyExternalTicketLinkTemplate` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
selectMyExternalTicketLinkTemplate(vars?: SelectMyExternalTicketLinkTemplateVariables): MutationPromise<SelectMyExternalTicketLinkTemplateData, SelectMyExternalTicketLinkTemplateVariables>;

interface SelectMyExternalTicketLinkTemplateRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: SelectMyExternalTicketLinkTemplateVariables): MutationRef<SelectMyExternalTicketLinkTemplateData, SelectMyExternalTicketLinkTemplateVariables>;
}
export const selectMyExternalTicketLinkTemplateRef: SelectMyExternalTicketLinkTemplateRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
selectMyExternalTicketLinkTemplate(dc: DataConnect, vars?: SelectMyExternalTicketLinkTemplateVariables): MutationPromise<SelectMyExternalTicketLinkTemplateData, SelectMyExternalTicketLinkTemplateVariables>;

interface SelectMyExternalTicketLinkTemplateRef {
  ...
  (dc: DataConnect, vars?: SelectMyExternalTicketLinkTemplateVariables): MutationRef<SelectMyExternalTicketLinkTemplateData, SelectMyExternalTicketLinkTemplateVariables>;
}
export const selectMyExternalTicketLinkTemplateRef: SelectMyExternalTicketLinkTemplateRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the selectMyExternalTicketLinkTemplateRef:
```typescript
const name = selectMyExternalTicketLinkTemplateRef.operationName;
console.log(name);
```

### Variables
The `SelectMyExternalTicketLinkTemplate` mutation has an optional argument of type `SelectMyExternalTicketLinkTemplateVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SelectMyExternalTicketLinkTemplateVariables {
  externalTicketLinkTemplate?: string | null;
}
```
### Return Type
Recall that executing the `SelectMyExternalTicketLinkTemplate` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SelectMyExternalTicketLinkTemplateData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SelectMyExternalTicketLinkTemplateData {
  user_update?: User_Key | null;
}
```
### Using `SelectMyExternalTicketLinkTemplate`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, selectMyExternalTicketLinkTemplate, SelectMyExternalTicketLinkTemplateVariables } from '@dataconnect/generated';

// The `SelectMyExternalTicketLinkTemplate` mutation has an optional argument of type `SelectMyExternalTicketLinkTemplateVariables`:
const selectMyExternalTicketLinkTemplateVars: SelectMyExternalTicketLinkTemplateVariables = {
  externalTicketLinkTemplate: ..., // optional
};

// Call the `selectMyExternalTicketLinkTemplate()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await selectMyExternalTicketLinkTemplate(selectMyExternalTicketLinkTemplateVars);
// Variables can be defined inline as well.
const { data } = await selectMyExternalTicketLinkTemplate({ externalTicketLinkTemplate: ..., });
// Since all variables are optional for this mutation, you can omit the `SelectMyExternalTicketLinkTemplateVariables` argument.
const { data } = await selectMyExternalTicketLinkTemplate();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await selectMyExternalTicketLinkTemplate(dataConnect, selectMyExternalTicketLinkTemplateVars);

console.log(data.user_update);

// Or, you can use the `Promise` API.
selectMyExternalTicketLinkTemplate(selectMyExternalTicketLinkTemplateVars).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

### Using `SelectMyExternalTicketLinkTemplate`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, selectMyExternalTicketLinkTemplateRef, SelectMyExternalTicketLinkTemplateVariables } from '@dataconnect/generated';

// The `SelectMyExternalTicketLinkTemplate` mutation has an optional argument of type `SelectMyExternalTicketLinkTemplateVariables`:
const selectMyExternalTicketLinkTemplateVars: SelectMyExternalTicketLinkTemplateVariables = {
  externalTicketLinkTemplate: ..., // optional
};

// Call the `selectMyExternalTicketLinkTemplateRef()` function to get a reference to the mutation.
const ref = selectMyExternalTicketLinkTemplateRef(selectMyExternalTicketLinkTemplateVars);
// Variables can be defined inline as well.
const ref = selectMyExternalTicketLinkTemplateRef({ externalTicketLinkTemplate: ..., });
// Since all variables are optional for this mutation, you can omit the `SelectMyExternalTicketLinkTemplateVariables` argument.
const ref = selectMyExternalTicketLinkTemplateRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = selectMyExternalTicketLinkTemplateRef(dataConnect, selectMyExternalTicketLinkTemplateVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

## SelectMyCardStyle
You can execute the `SelectMyCardStyle` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
selectMyCardStyle(vars: SelectMyCardStyleVariables): MutationPromise<SelectMyCardStyleData, SelectMyCardStyleVariables>;

interface SelectMyCardStyleRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SelectMyCardStyleVariables): MutationRef<SelectMyCardStyleData, SelectMyCardStyleVariables>;
}
export const selectMyCardStyleRef: SelectMyCardStyleRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
selectMyCardStyle(dc: DataConnect, vars: SelectMyCardStyleVariables): MutationPromise<SelectMyCardStyleData, SelectMyCardStyleVariables>;

interface SelectMyCardStyleRef {
  ...
  (dc: DataConnect, vars: SelectMyCardStyleVariables): MutationRef<SelectMyCardStyleData, SelectMyCardStyleVariables>;
}
export const selectMyCardStyleRef: SelectMyCardStyleRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the selectMyCardStyleRef:
```typescript
const name = selectMyCardStyleRef.operationName;
console.log(name);
```

### Variables
The `SelectMyCardStyle` mutation requires an argument of type `SelectMyCardStyleVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SelectMyCardStyleVariables {
  cardOpacity: number;
  cardBlur: number;
}
```
### Return Type
Recall that executing the `SelectMyCardStyle` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SelectMyCardStyleData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SelectMyCardStyleData {
  user_update?: User_Key | null;
}
```
### Using `SelectMyCardStyle`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, selectMyCardStyle, SelectMyCardStyleVariables } from '@dataconnect/generated';

// The `SelectMyCardStyle` mutation requires an argument of type `SelectMyCardStyleVariables`:
const selectMyCardStyleVars: SelectMyCardStyleVariables = {
  cardOpacity: ..., 
  cardBlur: ..., 
};

// Call the `selectMyCardStyle()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await selectMyCardStyle(selectMyCardStyleVars);
// Variables can be defined inline as well.
const { data } = await selectMyCardStyle({ cardOpacity: ..., cardBlur: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await selectMyCardStyle(dataConnect, selectMyCardStyleVars);

console.log(data.user_update);

// Or, you can use the `Promise` API.
selectMyCardStyle(selectMyCardStyleVars).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

### Using `SelectMyCardStyle`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, selectMyCardStyleRef, SelectMyCardStyleVariables } from '@dataconnect/generated';

// The `SelectMyCardStyle` mutation requires an argument of type `SelectMyCardStyleVariables`:
const selectMyCardStyleVars: SelectMyCardStyleVariables = {
  cardOpacity: ..., 
  cardBlur: ..., 
};

// Call the `selectMyCardStyleRef()` function to get a reference to the mutation.
const ref = selectMyCardStyleRef(selectMyCardStyleVars);
// Variables can be defined inline as well.
const ref = selectMyCardStyleRef({ cardOpacity: ..., cardBlur: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = selectMyCardStyleRef(dataConnect, selectMyCardStyleVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

## SelectMyBordersEnabled
You can execute the `SelectMyBordersEnabled` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
selectMyBordersEnabled(vars: SelectMyBordersEnabledVariables): MutationPromise<SelectMyBordersEnabledData, SelectMyBordersEnabledVariables>;

interface SelectMyBordersEnabledRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SelectMyBordersEnabledVariables): MutationRef<SelectMyBordersEnabledData, SelectMyBordersEnabledVariables>;
}
export const selectMyBordersEnabledRef: SelectMyBordersEnabledRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
selectMyBordersEnabled(dc: DataConnect, vars: SelectMyBordersEnabledVariables): MutationPromise<SelectMyBordersEnabledData, SelectMyBordersEnabledVariables>;

interface SelectMyBordersEnabledRef {
  ...
  (dc: DataConnect, vars: SelectMyBordersEnabledVariables): MutationRef<SelectMyBordersEnabledData, SelectMyBordersEnabledVariables>;
}
export const selectMyBordersEnabledRef: SelectMyBordersEnabledRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the selectMyBordersEnabledRef:
```typescript
const name = selectMyBordersEnabledRef.operationName;
console.log(name);
```

### Variables
The `SelectMyBordersEnabled` mutation requires an argument of type `SelectMyBordersEnabledVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SelectMyBordersEnabledVariables {
  bordersEnabled: boolean;
}
```
### Return Type
Recall that executing the `SelectMyBordersEnabled` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SelectMyBordersEnabledData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SelectMyBordersEnabledData {
  user_update?: User_Key | null;
}
```
### Using `SelectMyBordersEnabled`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, selectMyBordersEnabled, SelectMyBordersEnabledVariables } from '@dataconnect/generated';

// The `SelectMyBordersEnabled` mutation requires an argument of type `SelectMyBordersEnabledVariables`:
const selectMyBordersEnabledVars: SelectMyBordersEnabledVariables = {
  bordersEnabled: ..., 
};

// Call the `selectMyBordersEnabled()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await selectMyBordersEnabled(selectMyBordersEnabledVars);
// Variables can be defined inline as well.
const { data } = await selectMyBordersEnabled({ bordersEnabled: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await selectMyBordersEnabled(dataConnect, selectMyBordersEnabledVars);

console.log(data.user_update);

// Or, you can use the `Promise` API.
selectMyBordersEnabled(selectMyBordersEnabledVars).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

### Using `SelectMyBordersEnabled`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, selectMyBordersEnabledRef, SelectMyBordersEnabledVariables } from '@dataconnect/generated';

// The `SelectMyBordersEnabled` mutation requires an argument of type `SelectMyBordersEnabledVariables`:
const selectMyBordersEnabledVars: SelectMyBordersEnabledVariables = {
  bordersEnabled: ..., 
};

// Call the `selectMyBordersEnabledRef()` function to get a reference to the mutation.
const ref = selectMyBordersEnabledRef(selectMyBordersEnabledVars);
// Variables can be defined inline as well.
const ref = selectMyBordersEnabledRef({ bordersEnabled: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = selectMyBordersEnabledRef(dataConnect, selectMyBordersEnabledVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

## SelectMyTicketColorsEnabled
You can execute the `SelectMyTicketColorsEnabled` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
selectMyTicketColorsEnabled(vars: SelectMyTicketColorsEnabledVariables): MutationPromise<SelectMyTicketColorsEnabledData, SelectMyTicketColorsEnabledVariables>;

interface SelectMyTicketColorsEnabledRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SelectMyTicketColorsEnabledVariables): MutationRef<SelectMyTicketColorsEnabledData, SelectMyTicketColorsEnabledVariables>;
}
export const selectMyTicketColorsEnabledRef: SelectMyTicketColorsEnabledRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
selectMyTicketColorsEnabled(dc: DataConnect, vars: SelectMyTicketColorsEnabledVariables): MutationPromise<SelectMyTicketColorsEnabledData, SelectMyTicketColorsEnabledVariables>;

interface SelectMyTicketColorsEnabledRef {
  ...
  (dc: DataConnect, vars: SelectMyTicketColorsEnabledVariables): MutationRef<SelectMyTicketColorsEnabledData, SelectMyTicketColorsEnabledVariables>;
}
export const selectMyTicketColorsEnabledRef: SelectMyTicketColorsEnabledRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the selectMyTicketColorsEnabledRef:
```typescript
const name = selectMyTicketColorsEnabledRef.operationName;
console.log(name);
```

### Variables
The `SelectMyTicketColorsEnabled` mutation requires an argument of type `SelectMyTicketColorsEnabledVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SelectMyTicketColorsEnabledVariables {
  ticketColorsEnabled: boolean;
}
```
### Return Type
Recall that executing the `SelectMyTicketColorsEnabled` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SelectMyTicketColorsEnabledData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SelectMyTicketColorsEnabledData {
  user_update?: User_Key | null;
}
```
### Using `SelectMyTicketColorsEnabled`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, selectMyTicketColorsEnabled, SelectMyTicketColorsEnabledVariables } from '@dataconnect/generated';

// The `SelectMyTicketColorsEnabled` mutation requires an argument of type `SelectMyTicketColorsEnabledVariables`:
const selectMyTicketColorsEnabledVars: SelectMyTicketColorsEnabledVariables = {
  ticketColorsEnabled: ..., 
};

// Call the `selectMyTicketColorsEnabled()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await selectMyTicketColorsEnabled(selectMyTicketColorsEnabledVars);
// Variables can be defined inline as well.
const { data } = await selectMyTicketColorsEnabled({ ticketColorsEnabled: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await selectMyTicketColorsEnabled(dataConnect, selectMyTicketColorsEnabledVars);

console.log(data.user_update);

// Or, you can use the `Promise` API.
selectMyTicketColorsEnabled(selectMyTicketColorsEnabledVars).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

### Using `SelectMyTicketColorsEnabled`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, selectMyTicketColorsEnabledRef, SelectMyTicketColorsEnabledVariables } from '@dataconnect/generated';

// The `SelectMyTicketColorsEnabled` mutation requires an argument of type `SelectMyTicketColorsEnabledVariables`:
const selectMyTicketColorsEnabledVars: SelectMyTicketColorsEnabledVariables = {
  ticketColorsEnabled: ..., 
};

// Call the `selectMyTicketColorsEnabledRef()` function to get a reference to the mutation.
const ref = selectMyTicketColorsEnabledRef(selectMyTicketColorsEnabledVars);
// Variables can be defined inline as well.
const ref = selectMyTicketColorsEnabledRef({ ticketColorsEnabled: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = selectMyTicketColorsEnabledRef(dataConnect, selectMyTicketColorsEnabledVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

## UpdateWorkLog
You can execute the `UpdateWorkLog` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateWorkLog(vars: UpdateWorkLogVariables): MutationPromise<UpdateWorkLogData, UpdateWorkLogVariables>;

interface UpdateWorkLogRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateWorkLogVariables): MutationRef<UpdateWorkLogData, UpdateWorkLogVariables>;
}
export const updateWorkLogRef: UpdateWorkLogRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateWorkLog(dc: DataConnect, vars: UpdateWorkLogVariables): MutationPromise<UpdateWorkLogData, UpdateWorkLogVariables>;

interface UpdateWorkLogRef {
  ...
  (dc: DataConnect, vars: UpdateWorkLogVariables): MutationRef<UpdateWorkLogData, UpdateWorkLogVariables>;
}
export const updateWorkLogRef: UpdateWorkLogRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateWorkLogRef:
```typescript
const name = updateWorkLogRef.operationName;
console.log(name);
```

### Variables
The `UpdateWorkLog` mutation requires an argument of type `UpdateWorkLogVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateWorkLogVariables {
  workLogId: UUIDString;
  name: string;
}
```
### Return Type
Recall that executing the `UpdateWorkLog` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateWorkLogData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateWorkLogData {
  workLog_update?: WorkLog_Key | null;
}
```
### Using `UpdateWorkLog`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateWorkLog, UpdateWorkLogVariables } from '@dataconnect/generated';

// The `UpdateWorkLog` mutation requires an argument of type `UpdateWorkLogVariables`:
const updateWorkLogVars: UpdateWorkLogVariables = {
  workLogId: ..., 
  name: ..., 
};

// Call the `updateWorkLog()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateWorkLog(updateWorkLogVars);
// Variables can be defined inline as well.
const { data } = await updateWorkLog({ workLogId: ..., name: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateWorkLog(dataConnect, updateWorkLogVars);

console.log(data.workLog_update);

// Or, you can use the `Promise` API.
updateWorkLog(updateWorkLogVars).then((response) => {
  const data = response.data;
  console.log(data.workLog_update);
});
```

### Using `UpdateWorkLog`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateWorkLogRef, UpdateWorkLogVariables } from '@dataconnect/generated';

// The `UpdateWorkLog` mutation requires an argument of type `UpdateWorkLogVariables`:
const updateWorkLogVars: UpdateWorkLogVariables = {
  workLogId: ..., 
  name: ..., 
};

// Call the `updateWorkLogRef()` function to get a reference to the mutation.
const ref = updateWorkLogRef(updateWorkLogVars);
// Variables can be defined inline as well.
const ref = updateWorkLogRef({ workLogId: ..., name: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateWorkLogRef(dataConnect, updateWorkLogVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.workLog_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.workLog_update);
});
```

## DeleteWorkLog
You can execute the `DeleteWorkLog` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteWorkLog(vars: DeleteWorkLogVariables): MutationPromise<DeleteWorkLogData, DeleteWorkLogVariables>;

interface DeleteWorkLogRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteWorkLogVariables): MutationRef<DeleteWorkLogData, DeleteWorkLogVariables>;
}
export const deleteWorkLogRef: DeleteWorkLogRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteWorkLog(dc: DataConnect, vars: DeleteWorkLogVariables): MutationPromise<DeleteWorkLogData, DeleteWorkLogVariables>;

interface DeleteWorkLogRef {
  ...
  (dc: DataConnect, vars: DeleteWorkLogVariables): MutationRef<DeleteWorkLogData, DeleteWorkLogVariables>;
}
export const deleteWorkLogRef: DeleteWorkLogRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteWorkLogRef:
```typescript
const name = deleteWorkLogRef.operationName;
console.log(name);
```

### Variables
The `DeleteWorkLog` mutation requires an argument of type `DeleteWorkLogVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteWorkLogVariables {
  workLogId: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteWorkLog` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteWorkLogData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteWorkLogData {
  workLog_update?: WorkLog_Key | null;
}
```
### Using `DeleteWorkLog`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteWorkLog, DeleteWorkLogVariables } from '@dataconnect/generated';

// The `DeleteWorkLog` mutation requires an argument of type `DeleteWorkLogVariables`:
const deleteWorkLogVars: DeleteWorkLogVariables = {
  workLogId: ..., 
};

// Call the `deleteWorkLog()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteWorkLog(deleteWorkLogVars);
// Variables can be defined inline as well.
const { data } = await deleteWorkLog({ workLogId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteWorkLog(dataConnect, deleteWorkLogVars);

console.log(data.workLog_update);

// Or, you can use the `Promise` API.
deleteWorkLog(deleteWorkLogVars).then((response) => {
  const data = response.data;
  console.log(data.workLog_update);
});
```

### Using `DeleteWorkLog`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteWorkLogRef, DeleteWorkLogVariables } from '@dataconnect/generated';

// The `DeleteWorkLog` mutation requires an argument of type `DeleteWorkLogVariables`:
const deleteWorkLogVars: DeleteWorkLogVariables = {
  workLogId: ..., 
};

// Call the `deleteWorkLogRef()` function to get a reference to the mutation.
const ref = deleteWorkLogRef(deleteWorkLogVars);
// Variables can be defined inline as well.
const ref = deleteWorkLogRef({ workLogId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteWorkLogRef(dataConnect, deleteWorkLogVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.workLog_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.workLog_update);
});
```

## RestoreWorkLog
You can execute the `RestoreWorkLog` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
restoreWorkLog(vars: RestoreWorkLogVariables): MutationPromise<RestoreWorkLogData, RestoreWorkLogVariables>;

interface RestoreWorkLogRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: RestoreWorkLogVariables): MutationRef<RestoreWorkLogData, RestoreWorkLogVariables>;
}
export const restoreWorkLogRef: RestoreWorkLogRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
restoreWorkLog(dc: DataConnect, vars: RestoreWorkLogVariables): MutationPromise<RestoreWorkLogData, RestoreWorkLogVariables>;

interface RestoreWorkLogRef {
  ...
  (dc: DataConnect, vars: RestoreWorkLogVariables): MutationRef<RestoreWorkLogData, RestoreWorkLogVariables>;
}
export const restoreWorkLogRef: RestoreWorkLogRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the restoreWorkLogRef:
```typescript
const name = restoreWorkLogRef.operationName;
console.log(name);
```

### Variables
The `RestoreWorkLog` mutation requires an argument of type `RestoreWorkLogVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface RestoreWorkLogVariables {
  workLogId: UUIDString;
}
```
### Return Type
Recall that executing the `RestoreWorkLog` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `RestoreWorkLogData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface RestoreWorkLogData {
  workLog_update?: WorkLog_Key | null;
}
```
### Using `RestoreWorkLog`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, restoreWorkLog, RestoreWorkLogVariables } from '@dataconnect/generated';

// The `RestoreWorkLog` mutation requires an argument of type `RestoreWorkLogVariables`:
const restoreWorkLogVars: RestoreWorkLogVariables = {
  workLogId: ..., 
};

// Call the `restoreWorkLog()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await restoreWorkLog(restoreWorkLogVars);
// Variables can be defined inline as well.
const { data } = await restoreWorkLog({ workLogId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await restoreWorkLog(dataConnect, restoreWorkLogVars);

console.log(data.workLog_update);

// Or, you can use the `Promise` API.
restoreWorkLog(restoreWorkLogVars).then((response) => {
  const data = response.data;
  console.log(data.workLog_update);
});
```

### Using `RestoreWorkLog`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, restoreWorkLogRef, RestoreWorkLogVariables } from '@dataconnect/generated';

// The `RestoreWorkLog` mutation requires an argument of type `RestoreWorkLogVariables`:
const restoreWorkLogVars: RestoreWorkLogVariables = {
  workLogId: ..., 
};

// Call the `restoreWorkLogRef()` function to get a reference to the mutation.
const ref = restoreWorkLogRef(restoreWorkLogVars);
// Variables can be defined inline as well.
const ref = restoreWorkLogRef({ workLogId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = restoreWorkLogRef(dataConnect, restoreWorkLogVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.workLog_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.workLog_update);
});
```

## CreateWorkLog
You can execute the `CreateWorkLog` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createWorkLog(vars: CreateWorkLogVariables): MutationPromise<CreateWorkLogData, CreateWorkLogVariables>;

interface CreateWorkLogRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateWorkLogVariables): MutationRef<CreateWorkLogData, CreateWorkLogVariables>;
}
export const createWorkLogRef: CreateWorkLogRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createWorkLog(dc: DataConnect, vars: CreateWorkLogVariables): MutationPromise<CreateWorkLogData, CreateWorkLogVariables>;

interface CreateWorkLogRef {
  ...
  (dc: DataConnect, vars: CreateWorkLogVariables): MutationRef<CreateWorkLogData, CreateWorkLogVariables>;
}
export const createWorkLogRef: CreateWorkLogRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createWorkLogRef:
```typescript
const name = createWorkLogRef.operationName;
console.log(name);
```

### Variables
The `CreateWorkLog` mutation requires an argument of type `CreateWorkLogVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateWorkLogVariables {
  userId: UUIDString;
  workLogId: UUIDString;
  name: string;
  description?: string | null;
  workLogDate: TimestampString;
}
```
### Return Type
Recall that executing the `CreateWorkLog` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateWorkLogData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `CreateWorkLog`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createWorkLog, CreateWorkLogVariables } from '@dataconnect/generated';

// The `CreateWorkLog` mutation requires an argument of type `CreateWorkLogVariables`:
const createWorkLogVars: CreateWorkLogVariables = {
  userId: ..., 
  workLogId: ..., 
  name: ..., 
  description: ..., // optional
  workLogDate: ..., 
};

// Call the `createWorkLog()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createWorkLog(createWorkLogVars);
// Variables can be defined inline as well.
const { data } = await createWorkLog({ userId: ..., workLogId: ..., name: ..., description: ..., workLogDate: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createWorkLog(dataConnect, createWorkLogVars);

console.log(data.workLog_insert);
console.log(data.seg1);
console.log(data.seg2);
console.log(data.seg3);
console.log(data.seg4);
console.log(data.seg5);
console.log(data.seg6);
console.log(data.seg7);
console.log(data.seg8);
console.log(data.seg9);
console.log(data.seg10);
console.log(data.seg11);
console.log(data.seg12);
console.log(data.seg13);
console.log(data.seg14);
console.log(data.seg15);
console.log(data.seg16);
console.log(data.seg17);
console.log(data.seg18);
console.log(data.seg19);
console.log(data.seg20);
console.log(data.seg21);
console.log(data.seg22);
console.log(data.seg23);
console.log(data.seg24);
console.log(data.seg25);
console.log(data.seg26);
console.log(data.seg27);
console.log(data.seg28);
console.log(data.seg29);
console.log(data.seg30);
console.log(data.seg31);
console.log(data.seg32);

// Or, you can use the `Promise` API.
createWorkLog(createWorkLogVars).then((response) => {
  const data = response.data;
  console.log(data.workLog_insert);
  console.log(data.seg1);
  console.log(data.seg2);
  console.log(data.seg3);
  console.log(data.seg4);
  console.log(data.seg5);
  console.log(data.seg6);
  console.log(data.seg7);
  console.log(data.seg8);
  console.log(data.seg9);
  console.log(data.seg10);
  console.log(data.seg11);
  console.log(data.seg12);
  console.log(data.seg13);
  console.log(data.seg14);
  console.log(data.seg15);
  console.log(data.seg16);
  console.log(data.seg17);
  console.log(data.seg18);
  console.log(data.seg19);
  console.log(data.seg20);
  console.log(data.seg21);
  console.log(data.seg22);
  console.log(data.seg23);
  console.log(data.seg24);
  console.log(data.seg25);
  console.log(data.seg26);
  console.log(data.seg27);
  console.log(data.seg28);
  console.log(data.seg29);
  console.log(data.seg30);
  console.log(data.seg31);
  console.log(data.seg32);
});
```

### Using `CreateWorkLog`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createWorkLogRef, CreateWorkLogVariables } from '@dataconnect/generated';

// The `CreateWorkLog` mutation requires an argument of type `CreateWorkLogVariables`:
const createWorkLogVars: CreateWorkLogVariables = {
  userId: ..., 
  workLogId: ..., 
  name: ..., 
  description: ..., // optional
  workLogDate: ..., 
};

// Call the `createWorkLogRef()` function to get a reference to the mutation.
const ref = createWorkLogRef(createWorkLogVars);
// Variables can be defined inline as well.
const ref = createWorkLogRef({ userId: ..., workLogId: ..., name: ..., description: ..., workLogDate: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createWorkLogRef(dataConnect, createWorkLogVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.workLog_insert);
console.log(data.seg1);
console.log(data.seg2);
console.log(data.seg3);
console.log(data.seg4);
console.log(data.seg5);
console.log(data.seg6);
console.log(data.seg7);
console.log(data.seg8);
console.log(data.seg9);
console.log(data.seg10);
console.log(data.seg11);
console.log(data.seg12);
console.log(data.seg13);
console.log(data.seg14);
console.log(data.seg15);
console.log(data.seg16);
console.log(data.seg17);
console.log(data.seg18);
console.log(data.seg19);
console.log(data.seg20);
console.log(data.seg21);
console.log(data.seg22);
console.log(data.seg23);
console.log(data.seg24);
console.log(data.seg25);
console.log(data.seg26);
console.log(data.seg27);
console.log(data.seg28);
console.log(data.seg29);
console.log(data.seg30);
console.log(data.seg31);
console.log(data.seg32);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.workLog_insert);
  console.log(data.seg1);
  console.log(data.seg2);
  console.log(data.seg3);
  console.log(data.seg4);
  console.log(data.seg5);
  console.log(data.seg6);
  console.log(data.seg7);
  console.log(data.seg8);
  console.log(data.seg9);
  console.log(data.seg10);
  console.log(data.seg11);
  console.log(data.seg12);
  console.log(data.seg13);
  console.log(data.seg14);
  console.log(data.seg15);
  console.log(data.seg16);
  console.log(data.seg17);
  console.log(data.seg18);
  console.log(data.seg19);
  console.log(data.seg20);
  console.log(data.seg21);
  console.log(data.seg22);
  console.log(data.seg23);
  console.log(data.seg24);
  console.log(data.seg25);
  console.log(data.seg26);
  console.log(data.seg27);
  console.log(data.seg28);
  console.log(data.seg29);
  console.log(data.seg30);
  console.log(data.seg31);
  console.log(data.seg32);
});
```

## UpsertGoogleCalendarConnection
You can execute the `UpsertGoogleCalendarConnection` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
upsertGoogleCalendarConnection(vars: UpsertGoogleCalendarConnectionVariables): MutationPromise<UpsertGoogleCalendarConnectionData, UpsertGoogleCalendarConnectionVariables>;

interface UpsertGoogleCalendarConnectionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertGoogleCalendarConnectionVariables): MutationRef<UpsertGoogleCalendarConnectionData, UpsertGoogleCalendarConnectionVariables>;
}
export const upsertGoogleCalendarConnectionRef: UpsertGoogleCalendarConnectionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertGoogleCalendarConnection(dc: DataConnect, vars: UpsertGoogleCalendarConnectionVariables): MutationPromise<UpsertGoogleCalendarConnectionData, UpsertGoogleCalendarConnectionVariables>;

interface UpsertGoogleCalendarConnectionRef {
  ...
  (dc: DataConnect, vars: UpsertGoogleCalendarConnectionVariables): MutationRef<UpsertGoogleCalendarConnectionData, UpsertGoogleCalendarConnectionVariables>;
}
export const upsertGoogleCalendarConnectionRef: UpsertGoogleCalendarConnectionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertGoogleCalendarConnectionRef:
```typescript
const name = upsertGoogleCalendarConnectionRef.operationName;
console.log(name);
```

### Variables
The `UpsertGoogleCalendarConnection` mutation requires an argument of type `UpsertGoogleCalendarConnectionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertGoogleCalendarConnectionVariables {
  userId: UUIDString;
  calendarId: string;
  googleEmail?: string | null;
  refreshTokenCipher: string;
  scope: string;
}
```
### Return Type
Recall that executing the `UpsertGoogleCalendarConnection` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertGoogleCalendarConnectionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertGoogleCalendarConnectionData {
  googleCalendarConnection_upsert: GoogleCalendarConnection_Key;
}
```
### Using `UpsertGoogleCalendarConnection`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertGoogleCalendarConnection, UpsertGoogleCalendarConnectionVariables } from '@dataconnect/generated';

// The `UpsertGoogleCalendarConnection` mutation requires an argument of type `UpsertGoogleCalendarConnectionVariables`:
const upsertGoogleCalendarConnectionVars: UpsertGoogleCalendarConnectionVariables = {
  userId: ..., 
  calendarId: ..., 
  googleEmail: ..., // optional
  refreshTokenCipher: ..., 
  scope: ..., 
};

// Call the `upsertGoogleCalendarConnection()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertGoogleCalendarConnection(upsertGoogleCalendarConnectionVars);
// Variables can be defined inline as well.
const { data } = await upsertGoogleCalendarConnection({ userId: ..., calendarId: ..., googleEmail: ..., refreshTokenCipher: ..., scope: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertGoogleCalendarConnection(dataConnect, upsertGoogleCalendarConnectionVars);

console.log(data.googleCalendarConnection_upsert);

// Or, you can use the `Promise` API.
upsertGoogleCalendarConnection(upsertGoogleCalendarConnectionVars).then((response) => {
  const data = response.data;
  console.log(data.googleCalendarConnection_upsert);
});
```

### Using `UpsertGoogleCalendarConnection`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertGoogleCalendarConnectionRef, UpsertGoogleCalendarConnectionVariables } from '@dataconnect/generated';

// The `UpsertGoogleCalendarConnection` mutation requires an argument of type `UpsertGoogleCalendarConnectionVariables`:
const upsertGoogleCalendarConnectionVars: UpsertGoogleCalendarConnectionVariables = {
  userId: ..., 
  calendarId: ..., 
  googleEmail: ..., // optional
  refreshTokenCipher: ..., 
  scope: ..., 
};

// Call the `upsertGoogleCalendarConnectionRef()` function to get a reference to the mutation.
const ref = upsertGoogleCalendarConnectionRef(upsertGoogleCalendarConnectionVars);
// Variables can be defined inline as well.
const ref = upsertGoogleCalendarConnectionRef({ userId: ..., calendarId: ..., googleEmail: ..., refreshTokenCipher: ..., scope: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertGoogleCalendarConnectionRef(dataConnect, upsertGoogleCalendarConnectionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.googleCalendarConnection_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.googleCalendarConnection_upsert);
});
```

## UpdateGoogleCalendarSyncPrefs
You can execute the `UpdateGoogleCalendarSyncPrefs` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateGoogleCalendarSyncPrefs(vars: UpdateGoogleCalendarSyncPrefsVariables): MutationPromise<UpdateGoogleCalendarSyncPrefsData, UpdateGoogleCalendarSyncPrefsVariables>;

interface UpdateGoogleCalendarSyncPrefsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateGoogleCalendarSyncPrefsVariables): MutationRef<UpdateGoogleCalendarSyncPrefsData, UpdateGoogleCalendarSyncPrefsVariables>;
}
export const updateGoogleCalendarSyncPrefsRef: UpdateGoogleCalendarSyncPrefsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateGoogleCalendarSyncPrefs(dc: DataConnect, vars: UpdateGoogleCalendarSyncPrefsVariables): MutationPromise<UpdateGoogleCalendarSyncPrefsData, UpdateGoogleCalendarSyncPrefsVariables>;

interface UpdateGoogleCalendarSyncPrefsRef {
  ...
  (dc: DataConnect, vars: UpdateGoogleCalendarSyncPrefsVariables): MutationRef<UpdateGoogleCalendarSyncPrefsData, UpdateGoogleCalendarSyncPrefsVariables>;
}
export const updateGoogleCalendarSyncPrefsRef: UpdateGoogleCalendarSyncPrefsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateGoogleCalendarSyncPrefsRef:
```typescript
const name = updateGoogleCalendarSyncPrefsRef.operationName;
console.log(name);
```

### Variables
The `UpdateGoogleCalendarSyncPrefs` mutation requires an argument of type `UpdateGoogleCalendarSyncPrefsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateGoogleCalendarSyncPrefsVariables {
  userId: UUIDString;
  mergeConsecutive: boolean;
  overwriteExisting: boolean;
  pruneOrphans: boolean;
  markAsFree: boolean;
  includeDescription: boolean;
}
```
### Return Type
Recall that executing the `UpdateGoogleCalendarSyncPrefs` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateGoogleCalendarSyncPrefsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateGoogleCalendarSyncPrefsData {
  googleCalendarConnection_update?: GoogleCalendarConnection_Key | null;
}
```
### Using `UpdateGoogleCalendarSyncPrefs`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateGoogleCalendarSyncPrefs, UpdateGoogleCalendarSyncPrefsVariables } from '@dataconnect/generated';

// The `UpdateGoogleCalendarSyncPrefs` mutation requires an argument of type `UpdateGoogleCalendarSyncPrefsVariables`:
const updateGoogleCalendarSyncPrefsVars: UpdateGoogleCalendarSyncPrefsVariables = {
  userId: ..., 
  mergeConsecutive: ..., 
  overwriteExisting: ..., 
  pruneOrphans: ..., 
  markAsFree: ..., 
  includeDescription: ..., 
};

// Call the `updateGoogleCalendarSyncPrefs()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateGoogleCalendarSyncPrefs(updateGoogleCalendarSyncPrefsVars);
// Variables can be defined inline as well.
const { data } = await updateGoogleCalendarSyncPrefs({ userId: ..., mergeConsecutive: ..., overwriteExisting: ..., pruneOrphans: ..., markAsFree: ..., includeDescription: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateGoogleCalendarSyncPrefs(dataConnect, updateGoogleCalendarSyncPrefsVars);

console.log(data.googleCalendarConnection_update);

// Or, you can use the `Promise` API.
updateGoogleCalendarSyncPrefs(updateGoogleCalendarSyncPrefsVars).then((response) => {
  const data = response.data;
  console.log(data.googleCalendarConnection_update);
});
```

### Using `UpdateGoogleCalendarSyncPrefs`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateGoogleCalendarSyncPrefsRef, UpdateGoogleCalendarSyncPrefsVariables } from '@dataconnect/generated';

// The `UpdateGoogleCalendarSyncPrefs` mutation requires an argument of type `UpdateGoogleCalendarSyncPrefsVariables`:
const updateGoogleCalendarSyncPrefsVars: UpdateGoogleCalendarSyncPrefsVariables = {
  userId: ..., 
  mergeConsecutive: ..., 
  overwriteExisting: ..., 
  pruneOrphans: ..., 
  markAsFree: ..., 
  includeDescription: ..., 
};

// Call the `updateGoogleCalendarSyncPrefsRef()` function to get a reference to the mutation.
const ref = updateGoogleCalendarSyncPrefsRef(updateGoogleCalendarSyncPrefsVars);
// Variables can be defined inline as well.
const ref = updateGoogleCalendarSyncPrefsRef({ userId: ..., mergeConsecutive: ..., overwriteExisting: ..., pruneOrphans: ..., markAsFree: ..., includeDescription: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateGoogleCalendarSyncPrefsRef(dataConnect, updateGoogleCalendarSyncPrefsVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.googleCalendarConnection_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.googleCalendarConnection_update);
});
```

## TouchGoogleCalendarLastSynced
You can execute the `TouchGoogleCalendarLastSynced` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
touchGoogleCalendarLastSynced(vars: TouchGoogleCalendarLastSyncedVariables): MutationPromise<TouchGoogleCalendarLastSyncedData, TouchGoogleCalendarLastSyncedVariables>;

interface TouchGoogleCalendarLastSyncedRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: TouchGoogleCalendarLastSyncedVariables): MutationRef<TouchGoogleCalendarLastSyncedData, TouchGoogleCalendarLastSyncedVariables>;
}
export const touchGoogleCalendarLastSyncedRef: TouchGoogleCalendarLastSyncedRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
touchGoogleCalendarLastSynced(dc: DataConnect, vars: TouchGoogleCalendarLastSyncedVariables): MutationPromise<TouchGoogleCalendarLastSyncedData, TouchGoogleCalendarLastSyncedVariables>;

interface TouchGoogleCalendarLastSyncedRef {
  ...
  (dc: DataConnect, vars: TouchGoogleCalendarLastSyncedVariables): MutationRef<TouchGoogleCalendarLastSyncedData, TouchGoogleCalendarLastSyncedVariables>;
}
export const touchGoogleCalendarLastSyncedRef: TouchGoogleCalendarLastSyncedRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the touchGoogleCalendarLastSyncedRef:
```typescript
const name = touchGoogleCalendarLastSyncedRef.operationName;
console.log(name);
```

### Variables
The `TouchGoogleCalendarLastSynced` mutation requires an argument of type `TouchGoogleCalendarLastSyncedVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface TouchGoogleCalendarLastSyncedVariables {
  userId: UUIDString;
}
```
### Return Type
Recall that executing the `TouchGoogleCalendarLastSynced` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `TouchGoogleCalendarLastSyncedData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface TouchGoogleCalendarLastSyncedData {
  googleCalendarConnection_update?: GoogleCalendarConnection_Key | null;
}
```
### Using `TouchGoogleCalendarLastSynced`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, touchGoogleCalendarLastSynced, TouchGoogleCalendarLastSyncedVariables } from '@dataconnect/generated';

// The `TouchGoogleCalendarLastSynced` mutation requires an argument of type `TouchGoogleCalendarLastSyncedVariables`:
const touchGoogleCalendarLastSyncedVars: TouchGoogleCalendarLastSyncedVariables = {
  userId: ..., 
};

// Call the `touchGoogleCalendarLastSynced()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await touchGoogleCalendarLastSynced(touchGoogleCalendarLastSyncedVars);
// Variables can be defined inline as well.
const { data } = await touchGoogleCalendarLastSynced({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await touchGoogleCalendarLastSynced(dataConnect, touchGoogleCalendarLastSyncedVars);

console.log(data.googleCalendarConnection_update);

// Or, you can use the `Promise` API.
touchGoogleCalendarLastSynced(touchGoogleCalendarLastSyncedVars).then((response) => {
  const data = response.data;
  console.log(data.googleCalendarConnection_update);
});
```

### Using `TouchGoogleCalendarLastSynced`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, touchGoogleCalendarLastSyncedRef, TouchGoogleCalendarLastSyncedVariables } from '@dataconnect/generated';

// The `TouchGoogleCalendarLastSynced` mutation requires an argument of type `TouchGoogleCalendarLastSyncedVariables`:
const touchGoogleCalendarLastSyncedVars: TouchGoogleCalendarLastSyncedVariables = {
  userId: ..., 
};

// Call the `touchGoogleCalendarLastSyncedRef()` function to get a reference to the mutation.
const ref = touchGoogleCalendarLastSyncedRef(touchGoogleCalendarLastSyncedVars);
// Variables can be defined inline as well.
const ref = touchGoogleCalendarLastSyncedRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = touchGoogleCalendarLastSyncedRef(dataConnect, touchGoogleCalendarLastSyncedVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.googleCalendarConnection_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.googleCalendarConnection_update);
});
```

## DeleteGoogleCalendarConnection
You can execute the `DeleteGoogleCalendarConnection` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteGoogleCalendarConnection(vars: DeleteGoogleCalendarConnectionVariables): MutationPromise<DeleteGoogleCalendarConnectionData, DeleteGoogleCalendarConnectionVariables>;

interface DeleteGoogleCalendarConnectionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteGoogleCalendarConnectionVariables): MutationRef<DeleteGoogleCalendarConnectionData, DeleteGoogleCalendarConnectionVariables>;
}
export const deleteGoogleCalendarConnectionRef: DeleteGoogleCalendarConnectionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteGoogleCalendarConnection(dc: DataConnect, vars: DeleteGoogleCalendarConnectionVariables): MutationPromise<DeleteGoogleCalendarConnectionData, DeleteGoogleCalendarConnectionVariables>;

interface DeleteGoogleCalendarConnectionRef {
  ...
  (dc: DataConnect, vars: DeleteGoogleCalendarConnectionVariables): MutationRef<DeleteGoogleCalendarConnectionData, DeleteGoogleCalendarConnectionVariables>;
}
export const deleteGoogleCalendarConnectionRef: DeleteGoogleCalendarConnectionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteGoogleCalendarConnectionRef:
```typescript
const name = deleteGoogleCalendarConnectionRef.operationName;
console.log(name);
```

### Variables
The `DeleteGoogleCalendarConnection` mutation requires an argument of type `DeleteGoogleCalendarConnectionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteGoogleCalendarConnectionVariables {
  userId: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteGoogleCalendarConnection` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteGoogleCalendarConnectionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteGoogleCalendarConnectionData {
  googleCalendarConnection_delete?: GoogleCalendarConnection_Key | null;
}
```
### Using `DeleteGoogleCalendarConnection`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteGoogleCalendarConnection, DeleteGoogleCalendarConnectionVariables } from '@dataconnect/generated';

// The `DeleteGoogleCalendarConnection` mutation requires an argument of type `DeleteGoogleCalendarConnectionVariables`:
const deleteGoogleCalendarConnectionVars: DeleteGoogleCalendarConnectionVariables = {
  userId: ..., 
};

// Call the `deleteGoogleCalendarConnection()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteGoogleCalendarConnection(deleteGoogleCalendarConnectionVars);
// Variables can be defined inline as well.
const { data } = await deleteGoogleCalendarConnection({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteGoogleCalendarConnection(dataConnect, deleteGoogleCalendarConnectionVars);

console.log(data.googleCalendarConnection_delete);

// Or, you can use the `Promise` API.
deleteGoogleCalendarConnection(deleteGoogleCalendarConnectionVars).then((response) => {
  const data = response.data;
  console.log(data.googleCalendarConnection_delete);
});
```

### Using `DeleteGoogleCalendarConnection`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteGoogleCalendarConnectionRef, DeleteGoogleCalendarConnectionVariables } from '@dataconnect/generated';

// The `DeleteGoogleCalendarConnection` mutation requires an argument of type `DeleteGoogleCalendarConnectionVariables`:
const deleteGoogleCalendarConnectionVars: DeleteGoogleCalendarConnectionVariables = {
  userId: ..., 
};

// Call the `deleteGoogleCalendarConnectionRef()` function to get a reference to the mutation.
const ref = deleteGoogleCalendarConnectionRef(deleteGoogleCalendarConnectionVars);
// Variables can be defined inline as well.
const ref = deleteGoogleCalendarConnectionRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteGoogleCalendarConnectionRef(dataConnect, deleteGoogleCalendarConnectionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.googleCalendarConnection_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.googleCalendarConnection_delete);
});
```

