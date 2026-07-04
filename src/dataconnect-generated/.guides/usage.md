# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useGetCurrentUser, useGetUserByPhone, useGetUserRoles, useGetStudentsByBranch, useGetStudentsBySection, useGetParentChildren, useGetParentChildrenByUser, useGetStudentParents, useGetParentByUser, useGetParentByPhone } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useGetCurrentUser(getCurrentUserVars);

const { data, isPending, isSuccess, isError, error } = useGetUserByPhone(getUserByPhoneVars);

const { data, isPending, isSuccess, isError, error } = useGetUserRoles(getUserRolesVars);

const { data, isPending, isSuccess, isError, error } = useGetStudentsByBranch(getStudentsByBranchVars);

const { data, isPending, isSuccess, isError, error } = useGetStudentsBySection(getStudentsBySectionVars);

const { data, isPending, isSuccess, isError, error } = useGetParentChildren(getParentChildrenVars);

const { data, isPending, isSuccess, isError, error } = useGetParentChildrenByUser(getParentChildrenByUserVars);

const { data, isPending, isSuccess, isError, error } = useGetStudentParents(getStudentParentsVars);

const { data, isPending, isSuccess, isError, error } = useGetParentByUser(getParentByUserVars);

const { data, isPending, isSuccess, isError, error } = useGetParentByPhone(getParentByPhoneVars);

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
import { getCurrentUser, getUserByPhone, getUserRoles, getStudentsByBranch, getStudentsBySection, getParentChildren, getParentChildrenByUser, getStudentParents, getParentByUser, getParentByPhone } from '@dataconnect/generated';


// Operation GetCurrentUser:  For variables, look at type GetCurrentUserVars in ../index.d.ts
const { data } = await GetCurrentUser(dataConnect, getCurrentUserVars);

// Operation GetUserByPhone:  For variables, look at type GetUserByPhoneVars in ../index.d.ts
const { data } = await GetUserByPhone(dataConnect, getUserByPhoneVars);

// Operation GetUserRoles:  For variables, look at type GetUserRolesVars in ../index.d.ts
const { data } = await GetUserRoles(dataConnect, getUserRolesVars);

// Operation GetStudentsByBranch:  For variables, look at type GetStudentsByBranchVars in ../index.d.ts
const { data } = await GetStudentsByBranch(dataConnect, getStudentsByBranchVars);

// Operation GetStudentsBySection:  For variables, look at type GetStudentsBySectionVars in ../index.d.ts
const { data } = await GetStudentsBySection(dataConnect, getStudentsBySectionVars);

// Operation GetParentChildren:  For variables, look at type GetParentChildrenVars in ../index.d.ts
const { data } = await GetParentChildren(dataConnect, getParentChildrenVars);

// Operation GetParentChildrenByUser:  For variables, look at type GetParentChildrenByUserVars in ../index.d.ts
const { data } = await GetParentChildrenByUser(dataConnect, getParentChildrenByUserVars);

// Operation GetStudentParents:  For variables, look at type GetStudentParentsVars in ../index.d.ts
const { data } = await GetStudentParents(dataConnect, getStudentParentsVars);

// Operation GetParentByUser:  For variables, look at type GetParentByUserVars in ../index.d.ts
const { data } = await GetParentByUser(dataConnect, getParentByUserVars);

// Operation GetParentByPhone:  For variables, look at type GetParentByPhoneVars in ../index.d.ts
const { data } = await GetParentByPhone(dataConnect, getParentByPhoneVars);


```