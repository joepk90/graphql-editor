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
| `VITE_API_URL`                | URL of the Server                                                          |
| `AUTH_TOKEN`                  | Auth Token used to pass to the server, required for auth purposes for protected graphql endponts  |
