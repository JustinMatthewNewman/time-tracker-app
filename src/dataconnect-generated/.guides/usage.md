# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useListUsers, useListTimeEntries, useGetTimeEntry, useListWorkLogs, useListTimeEntriesByWorkLog, useListTimeEntriesByDateRange, useCreateUserFromGoogle, useCreateTimeEntry, useUpdateTimeEntry, useDeleteTimeEntry } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useListUsers();

const { data, isPending, isSuccess, isError, error } = useListTimeEntries(listTimeEntriesVars);

const { data, isPending, isSuccess, isError, error } = useGetTimeEntry(getTimeEntryVars);

const { data, isPending, isSuccess, isError, error } = useListWorkLogs();

const { data, isPending, isSuccess, isError, error } = useListTimeEntriesByWorkLog(listTimeEntriesByWorkLogVars);

const { data, isPending, isSuccess, isError, error } = useListTimeEntriesByDateRange(listTimeEntriesByDateRangeVars);

const { data, isPending, isSuccess, isError, error } = useCreateUserFromGoogle(createUserFromGoogleVars);

const { data, isPending, isSuccess, isError, error } = useCreateTimeEntry(createTimeEntryVars);

const { data, isPending, isSuccess, isError, error } = useUpdateTimeEntry(updateTimeEntryVars);

const { data, isPending, isSuccess, isError, error } = useDeleteTimeEntry(deleteTimeEntryVars);

```

Here's an example from a different generated SDK:

```ts
import { useListAllMovies } from '@dataconnect/generated/react';

function MyComponent() {
  const { isLoading, data, error } = useListAllMovies();
  if(isLoading) {
    return <div>Loading...</div>
  }
  if(error) {
    return <div> An Error Occurred: {error} </div>
  }
}

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
}
```



## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { listUsers, listTimeEntries, getTimeEntry, listWorkLogs, listTimeEntriesByWorkLog, listTimeEntriesByDateRange, createUserFromGoogle, createTimeEntry, updateTimeEntry, deleteTimeEntry } from '@dataconnect/generated';


// Operation ListUsers: 
const { data } = await ListUsers(dataConnect);

// Operation ListTimeEntries:  For variables, look at type ListTimeEntriesVars in ../index.d.ts
const { data } = await ListTimeEntries(dataConnect, listTimeEntriesVars);

// Operation GetTimeEntry:  For variables, look at type GetTimeEntryVars in ../index.d.ts
const { data } = await GetTimeEntry(dataConnect, getTimeEntryVars);

// Operation ListWorkLogs: 
const { data } = await ListWorkLogs(dataConnect);

// Operation ListTimeEntriesByWorkLog:  For variables, look at type ListTimeEntriesByWorkLogVars in ../index.d.ts
const { data } = await ListTimeEntriesByWorkLog(dataConnect, listTimeEntriesByWorkLogVars);

// Operation ListTimeEntriesByDateRange:  For variables, look at type ListTimeEntriesByDateRangeVars in ../index.d.ts
const { data } = await ListTimeEntriesByDateRange(dataConnect, listTimeEntriesByDateRangeVars);

// Operation CreateUserFromGoogle:  For variables, look at type CreateUserFromGoogleVars in ../index.d.ts
const { data } = await CreateUserFromGoogle(dataConnect, createUserFromGoogleVars);

// Operation CreateTimeEntry:  For variables, look at type CreateTimeEntryVars in ../index.d.ts
const { data } = await CreateTimeEntry(dataConnect, createTimeEntryVars);

// Operation UpdateTimeEntry:  For variables, look at type UpdateTimeEntryVars in ../index.d.ts
const { data } = await UpdateTimeEntry(dataConnect, updateTimeEntryVars);

// Operation DeleteTimeEntry:  For variables, look at type DeleteTimeEntryVars in ../index.d.ts
const { data } = await DeleteTimeEntry(dataConnect, deleteTimeEntryVars);


```