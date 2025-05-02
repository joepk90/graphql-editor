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
| `VITE_API_URL`                | URL of the Server [default: `http://localhost:9092`]                       |



# Runtime Environment Variables
To enable Dynamic Environment Variables at run time, the following customisations have been applied.

**`.env.js`**
An `env.js` file has been added to the `public` directory. This is used to load runtime variables on the `window.__RUNTIME_CONFIG__` field.

**`index.html`**
A script import in the `index.html` file has been added to load the `env.js` file.

**`entrypoint.sh`**
An `entrypoint` bash script has been setup which replaces variables in the `env.js` file aat run time. The `Dockerfile` now uses this this `entrypoint`  bash script to run the environment variables replacement and tthen start the server.

**`config.ts/config.d.ts`**
A `config.d.ts` types file has been created for the new `__RUNTIME_CONFIG__` property on the `window` object and the file which loads the environment variables (`config.ts`) now looks for runtime environment variables as well 


This appraoch seems slightly hacky/custom, especially considering we are touching the default `index.html` file. Ideally a vite plugin can be used in the future which can handle injecting run time environment variables for us.

- PR: https://github.com/joepk90/graphql-faker-editor/pull/8