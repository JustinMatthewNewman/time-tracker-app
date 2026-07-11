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
  - [*ListThemes*](#listthemes)
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
  - [*SelectMyTheme*](#selectmytheme)
  - [*ClearMyTheme*](#clearmytheme)
  - [*UpdateWorkLog*](#updateworklog)
  - [*DeleteWorkLog*](#deleteworklog)
  - [*RestoreWorkLog*](#restoreworklog)
  - [*CreateWorkLog*](#createworklog)

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
    theme?: {
      id: UUIDString;
      name: string;
      background: string;
      foreground: string;
      isDark: boolean;
    } & Theme_Key;
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

## ListThemes
You can execute the `ListThemes` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listThemes(options?: ExecuteQueryOptions): QueryPromise<ListThemesData, undefined>;

interface ListThemesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListThemesData, undefined>;
}
export const listThemesRef: ListThemesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listThemes(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListThemesData, undefined>;

interface ListThemesRef {
  ...
  (dc: DataConnect): QueryRef<ListThemesData, undefined>;
}
export const listThemesRef: ListThemesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listThemesRef:
```typescript
const name = listThemesRef.operationName;
console.log(name);
```

### Variables
The `ListThemes` query has no variables.
### Return Type
Recall that executing the `ListThemes` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListThemesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListThemesData {
  themes: ({
    id: UUIDString;
    name: string;
    background: string;
    foreground: string;
    isDark: boolean;
  } & Theme_Key)[];
}
```
### Using `ListThemes`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listThemes } from '@dataconnect/generated';


// Call the `listThemes()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listThemes();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listThemes(dataConnect);

console.log(data.themes);

// Or, you can use the `Promise` API.
listThemes().then((response) => {
  const data = response.data;
  console.log(data.themes);
});
```

### Using `ListThemes`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listThemesRef } from '@dataconnect/generated';


// Call the `listThemesRef()` function to get a reference to the query.
const ref = listThemesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listThemesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.themes);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.themes);
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
listWorkLogs(options?: ExecuteQueryOptions): QueryPromise<ListWorkLogsData, undefined>;

interface ListWorkLogsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListWorkLogsData, undefined>;
}
export const listWorkLogsRef: ListWorkLogsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listWorkLogs(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListWorkLogsData, undefined>;

interface ListWorkLogsRef {
  ...
  (dc: DataConnect): QueryRef<ListWorkLogsData, undefined>;
}
export const listWorkLogsRef: ListWorkLogsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listWorkLogsRef:
```typescript
const name = listWorkLogsRef.operationName;
console.log(name);
```

### Variables
The `ListWorkLogs` query has no variables.
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
import { connectorConfig, listWorkLogs } from '@dataconnect/generated';


// Call the `listWorkLogs()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listWorkLogs();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listWorkLogs(dataConnect);

console.log(data.workLogs);

// Or, you can use the `Promise` API.
listWorkLogs().then((response) => {
  const data = response.data;
  console.log(data.workLogs);
});
```

### Using `ListWorkLogs`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listWorkLogsRef } from '@dataconnect/generated';


// Call the `listWorkLogsRef()` function to get a reference to the query.
const ref = listWorkLogsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listWorkLogsRef(dataConnect);

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

## ListMyTimeEntries
You can execute the `ListMyTimeEntries` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listMyTimeEntries(options?: ExecuteQueryOptions): QueryPromise<ListMyTimeEntriesData, undefined>;

interface ListMyTimeEntriesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMyTimeEntriesData, undefined>;
}
export const listMyTimeEntriesRef: ListMyTimeEntriesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listMyTimeEntries(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListMyTimeEntriesData, undefined>;

interface ListMyTimeEntriesRef {
  ...
  (dc: DataConnect): QueryRef<ListMyTimeEntriesData, undefined>;
}
export const listMyTimeEntriesRef: ListMyTimeEntriesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listMyTimeEntriesRef:
```typescript
const name = listMyTimeEntriesRef.operationName;
console.log(name);
```

### Variables
The `ListMyTimeEntries` query has no variables.
### Return Type
Recall that executing the `ListMyTimeEntries` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListMyTimeEntriesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListMyTimeEntries`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listMyTimeEntries } from '@dataconnect/generated';


// Call the `listMyTimeEntries()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listMyTimeEntries();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listMyTimeEntries(dataConnect);

console.log(data.timeEntries);

// Or, you can use the `Promise` API.
listMyTimeEntries().then((response) => {
  const data = response.data;
  console.log(data.timeEntries);
});
```

### Using `ListMyTimeEntries`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listMyTimeEntriesRef } from '@dataconnect/generated';


// Call the `listMyTimeEntriesRef()` function to get a reference to the query.
const ref = listMyTimeEntriesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listMyTimeEntriesRef(dataConnect);

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
};

// Call the `listTimeEntriesByDateRange()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listTimeEntriesByDateRange(listTimeEntriesByDateRangeVars);
// Variables can be defined inline as well.
const { data } = await listTimeEntriesByDateRange({ userId: ..., startDate: ..., endDate: ..., });

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
};

// Call the `listTimeEntriesByDateRangeRef()` function to get a reference to the query.
const ref = listTimeEntriesByDateRangeRef(listTimeEntriesByDateRangeVars);
// Variables can be defined inline as well.
const ref = listTimeEntriesByDateRangeRef({ userId: ..., startDate: ..., endDate: ..., });

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
};

// Call the `createUserFromGoogle()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createUserFromGoogle(createUserFromGoogleVars);
// Variables can be defined inline as well.
const { data } = await createUserFromGoogle({ googleUid: ..., username: ..., email: ..., createdAt: ..., });

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
};

// Call the `createUserFromGoogleRef()` function to get a reference to the mutation.
const ref = createUserFromGoogleRef(createUserFromGoogleVars);
// Variables can be defined inline as well.
const ref = createUserFromGoogleRef({ googleUid: ..., username: ..., email: ..., createdAt: ..., });

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
  startTime: TimestampString;
  endTime: TimestampString;
  date: DateString;
  createdAt: TimestampString;
  description?: string | null;
  officeNumber?: string | null;
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
  startTime: ..., 
  endTime: ..., 
  date: ..., 
  createdAt: ..., 
  description: ..., // optional
  officeNumber: ..., // optional
};

// Call the `createTimeEntry()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createTimeEntry(createTimeEntryVars);
// Variables can be defined inline as well.
const { data } = await createTimeEntry({ userId: ..., startTime: ..., endTime: ..., date: ..., createdAt: ..., description: ..., officeNumber: ..., });

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
  startTime: ..., 
  endTime: ..., 
  date: ..., 
  createdAt: ..., 
  description: ..., // optional
  officeNumber: ..., // optional
};

// Call the `createTimeEntryRef()` function to get a reference to the mutation.
const ref = createTimeEntryRef(createTimeEntryVars);
// Variables can be defined inline as well.
const ref = createTimeEntryRef({ userId: ..., startTime: ..., endTime: ..., date: ..., createdAt: ..., description: ..., officeNumber: ..., });

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
  officeNumber?: string | null;
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
  officeNumber: ..., // optional
};

// Call the `updateTimeEntry()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateTimeEntry(updateTimeEntryVars);
// Variables can be defined inline as well.
const { data } = await updateTimeEntry({ entryId: ..., description: ..., ticketNumber: ..., officeNumber: ..., });

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
  officeNumber: ..., // optional
};

// Call the `updateTimeEntryRef()` function to get a reference to the mutation.
const ref = updateTimeEntryRef(updateTimeEntryVars);
// Variables can be defined inline as well.
const ref = updateTimeEntryRef({ entryId: ..., description: ..., ticketNumber: ..., officeNumber: ..., });

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
  officeNumber?: string | null;
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
  officeNumber: ..., // optional
};

// Call the `updateTimeEntryClearTicket()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateTimeEntryClearTicket(updateTimeEntryClearTicketVars);
// Variables can be defined inline as well.
const { data } = await updateTimeEntryClearTicket({ entryId: ..., description: ..., officeNumber: ..., });

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
  officeNumber: ..., // optional
};

// Call the `updateTimeEntryClearTicketRef()` function to get a reference to the mutation.
const ref = updateTimeEntryClearTicketRef(updateTimeEntryClearTicketVars);
// Variables can be defined inline as well.
const ref = updateTimeEntryClearTicketRef({ entryId: ..., description: ..., officeNumber: ..., });

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
  ticketLink?: string | null;
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
  ticketLink: ..., // optional
};

// Call the `upsertTicket()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertTicket(upsertTicketVars);
// Variables can be defined inline as well.
const { data } = await upsertTicket({ ticketNumber: ..., ticketLink: ..., });

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
  ticketLink: ..., // optional
};

// Call the `upsertTicketRef()` function to get a reference to the mutation.
const ref = upsertTicketRef(upsertTicketVars);
// Variables can be defined inline as well.
const ref = upsertTicketRef({ ticketNumber: ..., ticketLink: ..., });

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

## SelectMyTheme
You can execute the `SelectMyTheme` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
selectMyTheme(vars: SelectMyThemeVariables): MutationPromise<SelectMyThemeData, SelectMyThemeVariables>;

interface SelectMyThemeRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SelectMyThemeVariables): MutationRef<SelectMyThemeData, SelectMyThemeVariables>;
}
export const selectMyThemeRef: SelectMyThemeRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
selectMyTheme(dc: DataConnect, vars: SelectMyThemeVariables): MutationPromise<SelectMyThemeData, SelectMyThemeVariables>;

interface SelectMyThemeRef {
  ...
  (dc: DataConnect, vars: SelectMyThemeVariables): MutationRef<SelectMyThemeData, SelectMyThemeVariables>;
}
export const selectMyThemeRef: SelectMyThemeRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the selectMyThemeRef:
```typescript
const name = selectMyThemeRef.operationName;
console.log(name);
```

### Variables
The `SelectMyTheme` mutation requires an argument of type `SelectMyThemeVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SelectMyThemeVariables {
  themeId: UUIDString;
}
```
### Return Type
Recall that executing the `SelectMyTheme` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SelectMyThemeData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SelectMyThemeData {
  user_update?: User_Key | null;
}
```
### Using `SelectMyTheme`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, selectMyTheme, SelectMyThemeVariables } from '@dataconnect/generated';

// The `SelectMyTheme` mutation requires an argument of type `SelectMyThemeVariables`:
const selectMyThemeVars: SelectMyThemeVariables = {
  themeId: ..., 
};

// Call the `selectMyTheme()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await selectMyTheme(selectMyThemeVars);
// Variables can be defined inline as well.
const { data } = await selectMyTheme({ themeId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await selectMyTheme(dataConnect, selectMyThemeVars);

console.log(data.user_update);

// Or, you can use the `Promise` API.
selectMyTheme(selectMyThemeVars).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

### Using `SelectMyTheme`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, selectMyThemeRef, SelectMyThemeVariables } from '@dataconnect/generated';

// The `SelectMyTheme` mutation requires an argument of type `SelectMyThemeVariables`:
const selectMyThemeVars: SelectMyThemeVariables = {
  themeId: ..., 
};

// Call the `selectMyThemeRef()` function to get a reference to the mutation.
const ref = selectMyThemeRef(selectMyThemeVars);
// Variables can be defined inline as well.
const ref = selectMyThemeRef({ themeId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = selectMyThemeRef(dataConnect, selectMyThemeVars);

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

## ClearMyTheme
You can execute the `ClearMyTheme` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
clearMyTheme(): MutationPromise<ClearMyThemeData, undefined>;

interface ClearMyThemeRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<ClearMyThemeData, undefined>;
}
export const clearMyThemeRef: ClearMyThemeRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
clearMyTheme(dc: DataConnect): MutationPromise<ClearMyThemeData, undefined>;

interface ClearMyThemeRef {
  ...
  (dc: DataConnect): MutationRef<ClearMyThemeData, undefined>;
}
export const clearMyThemeRef: ClearMyThemeRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the clearMyThemeRef:
```typescript
const name = clearMyThemeRef.operationName;
console.log(name);
```

### Variables
The `ClearMyTheme` mutation has no variables.
### Return Type
Recall that executing the `ClearMyTheme` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ClearMyThemeData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ClearMyThemeData {
  user_update?: User_Key | null;
}
```
### Using `ClearMyTheme`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, clearMyTheme } from '@dataconnect/generated';


// Call the `clearMyTheme()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await clearMyTheme();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await clearMyTheme(dataConnect);

console.log(data.user_update);

// Or, you can use the `Promise` API.
clearMyTheme().then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

### Using `ClearMyTheme`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, clearMyThemeRef } from '@dataconnect/generated';


// Call the `clearMyThemeRef()` function to get a reference to the mutation.
const ref = clearMyThemeRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = clearMyThemeRef(dataConnect);

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

