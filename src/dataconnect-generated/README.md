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
  - [*ListTimeEntries*](#listtimeentries)
  - [*GetTimeEntry*](#gettimeentry)
  - [*ListWorkLogs*](#listworklogs)
  - [*ListTimeEntriesByWorkLog*](#listtimeentriesbyworklog)
  - [*ListTimeEntriesByDateRange*](#listtimeentriesbydaterange)
- [**Mutations**](#mutations)
  - [*CreateUserFromGoogle*](#createuserfromgoogle)
  - [*CreateTimeEntry*](#createtimeentry)
  - [*UpdateTimeEntry*](#updatetimeentry)
  - [*DeleteTimeEntry*](#deletetimeentry)
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
    ticketNumber?: string | null;
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
    ticketNumber?: string | null;
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
    ticketNumber?: string | null;
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
    ticketNumber?: string | null;
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
  ticketNumber?: string | null;
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
  ticketNumber: ..., // optional
  officeNumber: ..., // optional
};

// Call the `createTimeEntry()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createTimeEntry(createTimeEntryVars);
// Variables can be defined inline as well.
const { data } = await createTimeEntry({ userId: ..., startTime: ..., endTime: ..., date: ..., createdAt: ..., description: ..., ticketNumber: ..., officeNumber: ..., });

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
  ticketNumber: ..., // optional
  officeNumber: ..., // optional
};

// Call the `createTimeEntryRef()` function to get a reference to the mutation.
const ref = createTimeEntryRef(createTimeEntryVars);
// Variables can be defined inline as well.
const ref = createTimeEntryRef({ userId: ..., startTime: ..., endTime: ..., date: ..., createdAt: ..., description: ..., ticketNumber: ..., officeNumber: ..., });

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
  ticketNumber?: string | null;
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
  ticketNumber: ..., // optional
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
  ticketNumber: ..., // optional
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

