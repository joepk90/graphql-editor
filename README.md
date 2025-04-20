# GraphQL Editor
This project is technically a refactor of the [https://github.com/graphql-kit/graphql-faker](github.com/graphql-kit/graphql-faker) project - The dependancies have been updated and the project modernised.

The Back End Project can be found here:
[github.com/joepk90/graphql-faker](https://github.com/joepk90/graphql-faker) 


## Regression (Warning)
In the migration process a major regression has taken place. Due to migrating to react-codemirror2, autocompletion has stopped working on the GraphiQL edito.

<b>This is a sgnificant feature that should be resolved before continuing.</b>

Not much investigation has taken place into this, it could be quite easy to fix - I am not sure.


## Usage
This is currently only setup to work with the back end project - [github.com/joepk90/graphql-faker](https://github.com/joepk90/graphql-faker).

It has also only been tested when used to extend existing schema (these are configuration settings in the backend project).