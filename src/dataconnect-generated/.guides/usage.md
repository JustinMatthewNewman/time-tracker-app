# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useCreateUserFromGoogle, useCreateTimeEntry, useUpdateTimeEntry, useDeleteTimeEntry, useUpdateWorkLog, useDeleteWorkLog, useRestoreWorkLog, useCreateWorkLog, useListUsers, useGetMyUser } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useCreateUserFromGoogle(createUserFromGoogleVars);

const { data, isPending, isSuccess, isError, error } = useCreateTimeEntry(createTimeEntryVars);

const { data, isPending, isSuccess, isError, error } = useUpdateTimeEntry(updateTimeEntryVars);

const { data, isPending, isSuccess, isError, error } = useDeleteTimeEntry(deleteTimeEntryVars);

const { data, isPending, isSuccess, isError, error } = useUpdateWorkLog(updateWorkLogVars);

const { data, isPending, isSuccess, isError, error } = useDeleteWorkLog(deleteWorkLogVars);

const { data, isPending, isSuccess, isError, error } = useRestoreWorkLog(restoreWorkLogVars);

const { data, isPending, isSuccess, isError, error } = useCreateWorkLog(createWorkLogVars);

const { data, isPending, isSuccess, isError, error } = useListUsers();

const { data, isPending, isSuccess, isError, error } = useGetMyUser();

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
import { createUserFromGoogle, createTimeEntry, updateTimeEntry, deleteTimeEntry, updateWorkLog, deleteWorkLog, restoreWorkLog, createWorkLog, listUsers, getMyUser } from '@dataconnect/generated';


// Operation CreateUserFromGoogle:  For variables, look at type CreateUserFromGoogleVars in ../index.d.ts
const { data } = await CreateUserFromGoogle(dataConnect, createUserFromGoogleVars);

// Operation CreateTimeEntry:  For variables, look at type CreateTimeEntryVars in ../index.d.ts
const { data } = await CreateTimeEntry(dataConnect, createTimeEntryVars);

// Operation UpdateTimeEntry:  For variables, look at type UpdateTimeEntryVars in ../index.d.ts
const { data } = await UpdateTimeEntry(dataConnect, updateTimeEntryVars);

// Operation DeleteTimeEntry:  For variables, look at type DeleteTimeEntryVars in ../index.d.ts
const { data } = await DeleteTimeEntry(dataConnect, deleteTimeEntryVars);

// Operation UpdateWorkLog:  For variables, look at type UpdateWorkLogVars in ../index.d.ts
const { data } = await UpdateWorkLog(dataConnect, updateWorkLogVars);

// Operation DeleteWorkLog:  For variables, look at type DeleteWorkLogVars in ../index.d.ts
const { data } = await DeleteWorkLog(dataConnect, deleteWorkLogVars);

// Operation RestoreWorkLog:  For variables, look at type RestoreWorkLogVars in ../index.d.ts
const { data } = await RestoreWorkLog(dataConnect, restoreWorkLogVars);

// Operation CreateWorkLog:  For variables, look at type CreateWorkLogVars in ../index.d.ts
const { data } = await CreateWorkLog(dataConnect, createWorkLogVars);

// Operation ListUsers: 
const { data } = await ListUsers(dataConnect);

// Operation GetMyUser: 
const { data } = await GetMyUser(dataConnect);


```