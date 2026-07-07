# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useCreateBranch, useUpdateBranch, useAssignBranchAdmin, useAssignPrincipal, useCreateClass, useActivateClass, useDeactivateClass, useSeedAcademicClass, useCreateWing, useCreateSection } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useCreateBranch(createBranchVars);

const { data, isPending, isSuccess, isError, error } = useUpdateBranch(updateBranchVars);

const { data, isPending, isSuccess, isError, error } = useAssignBranchAdmin(assignBranchAdminVars);

const { data, isPending, isSuccess, isError, error } = useAssignPrincipal(assignPrincipalVars);

const { data, isPending, isSuccess, isError, error } = useCreateClass(createClassVars);

const { data, isPending, isSuccess, isError, error } = useActivateClass(activateClassVars);

const { data, isPending, isSuccess, isError, error } = useDeactivateClass(deactivateClassVars);

const { data, isPending, isSuccess, isError, error } = useSeedAcademicClass(seedAcademicClassVars);

const { data, isPending, isSuccess, isError, error } = useCreateWing(createWingVars);

const { data, isPending, isSuccess, isError, error } = useCreateSection(createSectionVars);

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
import { createBranch, updateBranch, assignBranchAdmin, assignPrincipal, createClass, activateClass, deactivateClass, seedAcademicClass, createWing, createSection } from '@dataconnect/generated';


// Operation CreateBranch:  For variables, look at type CreateBranchVars in ../index.d.ts
const { data } = await CreateBranch(dataConnect, createBranchVars);

// Operation UpdateBranch:  For variables, look at type UpdateBranchVars in ../index.d.ts
const { data } = await UpdateBranch(dataConnect, updateBranchVars);

// Operation AssignBranchAdmin:  For variables, look at type AssignBranchAdminVars in ../index.d.ts
const { data } = await AssignBranchAdmin(dataConnect, assignBranchAdminVars);

// Operation AssignPrincipal:  For variables, look at type AssignPrincipalVars in ../index.d.ts
const { data } = await AssignPrincipal(dataConnect, assignPrincipalVars);

// Operation CreateClass:  For variables, look at type CreateClassVars in ../index.d.ts
const { data } = await CreateClass(dataConnect, createClassVars);

// Operation ActivateClass:  For variables, look at type ActivateClassVars in ../index.d.ts
const { data } = await ActivateClass(dataConnect, activateClassVars);

// Operation DeactivateClass:  For variables, look at type DeactivateClassVars in ../index.d.ts
const { data } = await DeactivateClass(dataConnect, deactivateClassVars);

// Operation SeedAcademicClass:  For variables, look at type SeedAcademicClassVars in ../index.d.ts
const { data } = await SeedAcademicClass(dataConnect, seedAcademicClassVars);

// Operation CreateWing:  For variables, look at type CreateWingVars in ../index.d.ts
const { data } = await CreateWing(dataConnect, createWingVars);

// Operation CreateSection:  For variables, look at type CreateSectionVars in ../index.d.ts
const { data } = await CreateSection(dataConnect, createSectionVars);


```