# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useListUsers, useGetMyUser, useListColorSchemes, useListTickets, useListTimeEntries, useGetTimeEntry, useListWorkLogs, useListTimeEntriesByWorkLog, useListTimeEntriesByTicket, useListMyTimeEntries } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useListUsers();

const { data, isPending, isSuccess, isError, error } = useGetMyUser();

const { data, isPending, isSuccess, isError, error } = useListColorSchemes();

const { data, isPending, isSuccess, isError, error } = useListTickets(listTicketsVars);

const { data, isPending, isSuccess, isError, error } = useListTimeEntries(listTimeEntriesVars);

const { data, isPending, isSuccess, isError, error } = useGetTimeEntry(getTimeEntryVars);

const { data, isPending, isSuccess, isError, error } = useListWorkLogs(listWorkLogsVars);

const { data, isPending, isSuccess, isError, error } = useListTimeEntriesByWorkLog(listTimeEntriesByWorkLogVars);

const { data, isPending, isSuccess, isError, error } = useListTimeEntriesByTicket(listTimeEntriesByTicketVars);

const { data, isPending, isSuccess, isError, error } = useListMyTimeEntries(listMyTimeEntriesVars);

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
import { listUsers, getMyUser, listColorSchemes, listTickets, listTimeEntries, getTimeEntry, listWorkLogs, listTimeEntriesByWorkLog, listTimeEntriesByTicket, listMyTimeEntries } from '@dataconnect/generated';


// Operation ListUsers: 
const { data } = await ListUsers(dataConnect);

// Operation GetMyUser: 
const { data } = await GetMyUser(dataConnect);

// Operation ListColorSchemes: 
const { data } = await ListColorSchemes(dataConnect);

// Operation ListTickets:  For variables, look at type ListTicketsVars in ../index.d.ts
const { data } = await ListTickets(dataConnect, listTicketsVars);

// Operation ListTimeEntries:  For variables, look at type ListTimeEntriesVars in ../index.d.ts
const { data } = await ListTimeEntries(dataConnect, listTimeEntriesVars);

// Operation GetTimeEntry:  For variables, look at type GetTimeEntryVars in ../index.d.ts
const { data } = await GetTimeEntry(dataConnect, getTimeEntryVars);

// Operation ListWorkLogs:  For variables, look at type ListWorkLogsVars in ../index.d.ts
const { data } = await ListWorkLogs(dataConnect, listWorkLogsVars);

// Operation ListTimeEntriesByWorkLog:  For variables, look at type ListTimeEntriesByWorkLogVars in ../index.d.ts
const { data } = await ListTimeEntriesByWorkLog(dataConnect, listTimeEntriesByWorkLogVars);

// Operation ListTimeEntriesByTicket:  For variables, look at type ListTimeEntriesByTicketVars in ../index.d.ts
const { data } = await ListTimeEntriesByTicket(dataConnect, listTimeEntriesByTicketVars);

// Operation ListMyTimeEntries:  For variables, look at type ListMyTimeEntriesVars in ../index.d.ts
const { data } = await ListMyTimeEntries(dataConnect, listMyTimeEntriesVars);


```