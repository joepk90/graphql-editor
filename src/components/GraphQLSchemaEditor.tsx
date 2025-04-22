import React, { useEffect, useRef } from 'react';
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLError,
  parse,
  validate,
} from 'graphql';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { history } from '@codemirror/commands';
import { autocompletion, closeBrackets } from '@codemirror/autocomplete';
import { bracketMatching, syntaxHighlighting } from '@codemirror/language';
import { oneDarkHighlightStyle, oneDark } from '@codemirror/theme-one-dark';
import { defaultKeymap } from '@codemirror/commands';
import { graphql } from 'cm6-graphql';

// import { abcdef } from '@uiw/codemirror-themes';
// import { smoothy } from 'thememirror';

export const TestSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      search: {
        type: GraphQLString,
        resolve: () => 'GraphQL is awesome!',
      },
    },
  }),
});

interface GraphQLCodeEditorProps {
  value: string;
  schema: GraphQLSchema;
  onChange?: (newValue: string) => void;
  setValidationErrors?: (errors: GraphQLError[]) => void;
}

export const GraphQLSchemaEditor: React.FC<GraphQLCodeEditorProps> = ({ schema, value }) => {
  const editorContainer = useRef(null);

  useEffect(() => {
    const state = EditorState.create({
      doc: value,
      extensions: [
        bracketMatching(),
        closeBrackets(),
        history(),
        autocompletion(),
        lineNumbers(),
        oneDark,
        syntaxHighlighting(oneDarkHighlightStyle),
        graphql(schema, {
          onShowInDocs(field, type, parentType) {
            alert(`Showing in docs.: Field: ${field}, Type: ${type}, ParentType: ${parentType}`);
          },
          onFillAllFields(view, schema, _query, cursor, token) {
            alert(`Filling all fields. Token: ${token}`);
          },
        }),
        // TODO use fake schema validation here... then set validation errors...
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const text = update.state.doc.toString();
            try {
              const parsed = parse(text);
              // const errors = validate(TestSchema, parsed, specifiedRules);
              const errors = validate(TestSchema, parsed);
              if (errors.length) {
                console.error('Validation Errors:', errors);
              } else {
                console.log('No validation errors');
              }
            } catch (err) {
              console.error('Parse Error:', err);
            }
          }
        }),

        keymap.of([
          ...defaultKeymap, // This includes the Enter keymap and other default commands
        ]),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorContainer.current!,
    });

    // Cleanup on component unmount
    return () => {
      view.destroy();
    };
  }, [schema, value]);

  return (
    <div
      ref={editorContainer}
      id="editor"
      // TODO potentially move to container component
      style={{
        height: '90vh',
        overflow: 'auto',
      }}
    />
  );
};

// Hot Module Replacement
// if (module.hot) {
//   module.hot.accept();
// }
