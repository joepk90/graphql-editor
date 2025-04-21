# GraphQL Editor
This project is technically a refactor of the [https://github.com/graphql-kit/graphql-faker](github.com/graphql-kit/graphql-faker) project - The dependancies have been updated and the project modernised.

The Back End Project can be found here:
[github.com/joepk90/graphql-faker](https://github.com/joepk90/graphql-faker) 

The main reason for making this project was to change the functionality of extending types. It is now possible to override existing types and return the data that you define. For example:

```
extend type PreExistingType 	{
  	PreExisting: Boolean @examples(values: [false])
}
```

Also, the existing fields on the type that have not been overridden will continue to return the real data - I don't beleive this was happening in the current version of [https://github.com/graphql-kit/graphql-faker](github.com/graphql-kit/graphql-faker).

---

## Regression (Warning)
In the migration process a major regression has taken place. Due to migrating to react-codemirror2, autocompletion has stopped working on the GraphiQL edito.

<b>This is a sgnificant feature that should be resolved before continuing.</b>

Not much investigation has taken place into this, it could be quite easy to fix - I am not sure.


## Usage
This is currently only setup to work with the back end project - [github.com/joepk90/graphql-faker](https://github.com/joepk90/graphql-faker).

It has also only been tested when used to extend existing schema (these are configuration settings in the backend project).

## TODOs
- [ ] Can we move all schema/faker definition logic to the backend, and remove it completely from the front end? Can we request the "fake" schema to use in GraphiQL?
- [ ] Make it possible a Request Headers to Voyager in the browser (unsure why this isn't currently possible)
- [ ] Improve the editors UX:
    - Button design and saving feedback
    - Validation Errors
    - Autocomple functionality
---
## TODOs (for both the backend and front end)\
- [ ] Setup Dockerfile/Docker Image creation logic
- [ ] Setup Github Actions workflows
- [ ] Setup new Repository with just a Docker Compose file that pulls the images and runs the service