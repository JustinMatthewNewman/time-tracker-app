# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useCreateUserFromGoogle, useCreateTimeEntry, useCreateWorkLogOnly, useUpdateTimeEntry, useUpdateTimeEntryClearTicket, useDeleteTimeEntry, useUpsertTicket, useUpdateTicket, useSelectMyColorScheme, useClearMyColorScheme } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useCreateUserFromGoogle(createUserFromGoogleVars);

const { data, isPending, isSuccess, isError, error } = useCreateTimeEntry(createTimeEntryVars);

const { data, isPending, isSuccess, isError, error } = useCreateWorkLogOnly(createWorkLogOnlyVars);

const { data, isPending, isSuccess, isError, error } = useUpdateTimeEntry(updateTimeEntryVars);

const { data, isPending, isSuccess, isError, error } = useUpdateTimeEntryClearTicket(updateTimeEntryClearTicketVars);

const { data, isPending, isSuccess, isError, error } = useDeleteTimeEntry(deleteTimeEntryVars);

const { data, isPending, isSuccess, isError, error } = useUpsertTicket(upsertTicketVars);

const { data, isPending, isSuccess, isError, error } = useUpdateTicket(updateTicketVars);

const { data, isPending, isSuccess, isError, error } = useSelectMyColorScheme(selectMyColorSchemeVars);

const { data, isPending, isSuccess, isError, error } = useClearMyColorScheme();

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
import { createUserFromGoogle, createTimeEntry, createWorkLogOnly, updateTimeEntry, updateTimeEntryClearTicket, deleteTimeEntry, upsertTicket, updateTicket, selectMyColorScheme, clearMyColorScheme } from '@dataconnect/generated';


// Operation CreateUserFromGoogle:  For variables, look at type CreateUserFromGoogleVars in ../index.d.ts
const { data } = await CreateUserFromGoogle(dataConnect, createUserFromGoogleVars);

// Operation CreateTimeEntry:  For variables, look at type CreateTimeEntryVars in ../index.d.ts
const { data } = await CreateTimeEntry(dataConnect, createTimeEntryVars);

// Operation CreateWorkLogOnly:  For variables, look at type CreateWorkLogOnlyVars in ../index.d.ts
const { data } = await CreateWorkLogOnly(dataConnect, createWorkLogOnlyVars);

// Operation UpdateTimeEntry:  For variables, look at type UpdateTimeEntryVars in ../index.d.ts
const { data } = await UpdateTimeEntry(dataConnect, updateTimeEntryVars);

// Operation UpdateTimeEntryClearTicket:  For variables, look at type UpdateTimeEntryClearTicketVars in ../index.d.ts
const { data } = await UpdateTimeEntryClearTicket(dataConnect, updateTimeEntryClearTicketVars);

// Operation DeleteTimeEntry:  For variables, look at type DeleteTimeEntryVars in ../index.d.ts
const { data } = await DeleteTimeEntry(dataConnect, deleteTimeEntryVars);

// Operation UpsertTicket:  For variables, look at type UpsertTicketVars in ../index.d.ts
const { data } = await UpsertTicket(dataConnect, upsertTicketVars);

// Operation UpdateTicket:  For variables, look at type UpdateTicketVars in ../index.d.ts
const { data } = await UpdateTicket(dataConnect, updateTicketVars);

// Operation SelectMyColorScheme:  For variables, look at type SelectMyColorSchemeVars in ../index.d.ts
const { data } = await SelectMyColorScheme(dataConnect, selectMyColorSchemeVars);

// Operation ClearMyColorScheme: 
const { data } = await ClearMyColorScheme(dataConnect);


```