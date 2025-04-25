import React, { useEffect, useRef } from 'react';
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLError,
  validateSchema,
  printSchema,
} from 'graphql';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { history, defaultKeymap, indentWithTab } from '@codemirror/commands';
import {
  autocompletion,
  closeBrackets,
  acceptCompletion,
  completionStatus,
  completionKeymap,
} from '@codemirror/autocomplete';
import { bracketMatching, syntaxHighlighting } from '@codemirror/language';
import { oneDarkHighlightStyle, oneDark } from '@codemirror/theme-one-dark';
import { graphql } from 'cm6-graphql';
import { buildSchemaWithFakeDefs } from 'src/components/App';

// import { abcdef } from '@uiw/codemirror-themes';
// import { smoothy } from 'thememirror';
const height = '92vh';

const keymapCompartment = new Compartment();

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

const minLinesExtension = EditorView.theme({
  '&': {
    minHeight: height, // or calculate via lineHeight * minLines
  },
});

interface GraphQLCodeEditorProps {
  value: string | undefined;
  schema: GraphQLSchema;
  handleEditorValueChange: (view: string) => void;
  setValidationErrors: (errors: GraphQLError[]) => void;
  setErrorMessage: (errorMsg: string | null) => void;
}

// TODO what happens when eitehr the schema of value is updated?
export const GraphQLSchemaEditor: React.FC<GraphQLCodeEditorProps> = ({
  schema,
  value,
  setValidationErrors,
  setErrorMessage,
  handleEditorValueChange,
}) => {
  const editorContainer = useRef(null);

  useEffect(() => {
    const listener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        handleEditorValueChange(update.state.doc.toString());
      }
    });

    const state = EditorState.create({
      doc: value,
      extensions: [
        listener,
        keymapCompartment.of([]), // placeholder
        minLinesExtension,
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
          onFillAllFields(_view, _schema, _query, _cursor, token) {
            alert(`Filling all fields. Token: ${token}`);
          },
        }),

        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const text = update.state.doc.toString();
            try {
              const fakeSchema = buildSchemaWithFakeDefs(text, printSchema(schema));
              const errors = validateSchema(fakeSchema);
              if (errors.length) {
                setValidationErrors(Array.from(errors));
                console.error('Validation Errors:', errors);
              } else {
                setErrorMessage(null);
                console.log('No validation errors');
              }
            } catch (err) {
              setErrorMessage(String(err));
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

    view.dispatch({
      effects: keymapCompartment.reconfigure(
        keymap.of([
          {
            key: 'Tab',
            preventDefault: true,
            run: (view) => {
              const status = completionStatus(view.state);
              if (status === 'active') {
                return acceptCompletion(view);
              }
              // return (indentWithTab.run as (view: EditorView) => boolean)(view);
              return indentWithTab?.run?.(view) ?? false;
            },
          },
          ...defaultKeymap,
          ...completionKeymap,
        ]),
      ),
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
        height: height,
        overflow: 'auto',
      }}
    />
  );
};

// Hot Module Replacement
// if (module.hot) {
//   module.hot.accept();
// }
