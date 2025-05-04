# GraphQL Faker Editor

A refactor of the [github.com/graphql-kit/graphql-faker](https://github.com/graphql-kit/graphql-faker) project.

The main reason for making this project was to change the functionality of extending types. It is now possible to override existing fields on existing types, and return data you define. For more details of the complete project see:
[github.com/joepk90/graphql-faker-refactored](https://github.com/joepk90/graphql-faker-refactored)

---

This repository just handles the Front End (Editor) logic of the original GraphQL Faker project, allowing users to edit a custom schema and save it on the server, as well as test and view the schema via GraphQL Voyager and the GraphQL Playground.

Along with extending some of the functionaity of the original project, the dependancies have been updated and the project modernised.

The Back End Project has been moved to a new repository, which can be found here:
[github.com/joepk90/graphql-faker-server](https://github.com/joepk90/graphql-faker-server) 


## Development

To start the project locally run the following command
```
# clone the repository
git clone git@github.com:joepk90/graphql-faker-editor.git

# move into the repository
cd graphql-faker-editor

# create an .env file using env.example
# cp .env.example .env

# start the service
make dev
```

<b>Note:</b>
For this project to work, a backend is required.

Either clone and run the GraphQL Faker Server:
Clone this Repository
```
# clone the repository
git clone git@github.com:joepk90/graphql-faker-server.git

# move into the repository
cd graphql-faker-server

# create an .env file using env.example
# cp .env.example .env

# start the service
make dev
```

Or run the `graphql-faker-server` image:
```
make docker-run-server
```

## Options
| Environment Variables          | Description                                                                 |
|-------------------------------|----------------------------------------------------------------------------|
| `VITE_API_URL`                | URL of the Server [default: `http://localhost:3000`]                       |
| `IGNORED_PATHS`               | Used only at runtime, after the build. ignore certain paths, allowing others to be served |



# Runtime Environment Variables 

To setup Run Time Environment Variables, the following customisations have been applied.

A Vite plugin (`vite-plugin-runtime-envs.ts`) has been setup to generate a `env.runtime.js` file. This script gets injected into the app by the `index.html` during the build. The  `env.runtime.js` file includes a `window.__RUNTIME_ENV__ ` where run time environment variables can be added. 

An `entrypoint.js` script is then used to serve the applicationn and replaces the specified environment variables
with environemnt variables defined at run time.

See the `docker-run` and `serve` commands to see how the Run Time Environment Variables can be used.

Note:  
The `entrypoint` scrit is not setup to use envrionment variables in the `.env` file itself. We could set it up to this, but it would mean installing `nodenv`. This probably won't cause issues but might be problematic when running in the `graphql-faker-refactored` project.