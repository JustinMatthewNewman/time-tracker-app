# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useCreateUserFromGoogle, useCreateTimeEntry, useUpdateTimeEntry, useUpdateTimeEntryClearTicket, useDeleteTimeEntry, useUpsertTicket, useSelectMyTheme, useClearMyTheme, useUpdateWorkLog, useDeleteWorkLog } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useCreateUserFromGoogle(createUserFromGoogleVars);

const { data, isPending, isSuccess, isError, error } = useCreateTimeEntry(createTimeEntryVars);

const { data, isPending, isSuccess, isError, error } = useUpdateTimeEntry(updateTimeEntryVars);

const { data, isPending, isSuccess, isError, error } = useUpdateTimeEntryClearTicket(updateTimeEntryClearTicketVars);

const { data, isPending, isSuccess, isError, error } = useDeleteTimeEntry(deleteTimeEntryVars);

const { data, isPending, isSuccess, isError, error } = useUpsertTicket(upsertTicketVars);

const { data, isPending, isSuccess, isError, error } = useSelectMyTheme(selectMyThemeVars);

const { data, isPending, isSuccess, isError, error } = useClearMyTheme();

const { data, isPending, isSuccess, isError, error } = useUpdateWorkLog(updateWorkLogVars);

const { data, isPending, isSuccess, isError, error } = useDeleteWorkLog(deleteWorkLogVars);

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
import { createUserFromGoogle, createTimeEntry, updateTimeEntry, updateTimeEntryClearTicket, deleteTimeEntry, upsertTicket, selectMyTheme, clearMyTheme, updateWorkLog, deleteWorkLog } from '@dataconnect/generated';


// Operation CreateUserFromGoogle:  For variables, look at type CreateUserFromGoogleVars in ../index.d.ts
const { data } = await CreateUserFromGoogle(dataConnect, createUserFromGoogleVars);

// Operation CreateTimeEntry:  For variables, look at type CreateTimeEntryVars in ../index.d.ts
const { data } = await CreateTimeEntry(dataConnect, createTimeEntryVars);

// Operation UpdateTimeEntry:  For variables, look at type UpdateTimeEntryVars in ../index.d.ts
const { data } = await UpdateTimeEntry(dataConnect, updateTimeEntryVars);

// Operation UpdateTimeEntryClearTicket:  For variables, look at type UpdateTimeEntryClearTicketVars in ../index.d.ts
const { data } = await UpdateTimeEntryClearTicket(dataConnect, updateTimeEntryClearTicketVars);

// Operation DeleteTimeEntry:  For variables, look at type DeleteTimeEntryVars in ../index.d.ts
const { data } = await DeleteTimeEntry(dataConnect, deleteTimeEntryVars);

// Operation UpsertTicket:  For variables, look at type UpsertTicketVars in ../index.d.ts
const { data } = await UpsertTicket(dataConnect, upsertTicketVars);

// Operation SelectMyTheme:  For variables, look at type SelectMyThemeVars in ../index.d.ts
const { data } = await SelectMyTheme(dataConnect, selectMyThemeVars);

// Operation ClearMyTheme: 
const { data } = await ClearMyTheme(dataConnect);

// Operation UpdateWorkLog:  For variables, look at type UpdateWorkLogVars in ../index.d.ts
const { data } = await UpdateWorkLog(dataConnect, updateWorkLogVars);

// Operation DeleteWorkLog:  For variables, look at type DeleteWorkLogVars in ../index.d.ts
const { data } = await DeleteWorkLog(dataConnect, deleteWorkLogVars);


```