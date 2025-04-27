import React, { useEffect, useRef } from 'react';
import { GraphQLSchema, GraphQLError, validateSchema, printSchema } from 'graphql';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { history, historyKeymap, defaultKeymap, indentWithTab } from '@codemirror/commands';
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

const height = '92vh';

const keymapCompartment = new Compartment();

const minLinesExtension = EditorView.theme({
  '&': {
    minHeight: height, // or calculate via lineHeight * minLines
  },
});

interface GraphQLCodeEditorProps {
  value: string | undefined;
  schema: GraphQLSchema;
  handleEditorValueChange: (view: string) => void;
  handleEditorOnSaveKeyboardShortcut: (text: string) => void;
  setValidationErrors: (errors: GraphQLError[]) => void;
  setErrorMessage: (errorMsg: string | null) => void;
}

export const GraphQLSchemaEditor: React.FC<GraphQLCodeEditorProps> = ({
  schema,
  value,
  setValidationErrors,
  setErrorMessage,
  handleEditorValueChange,
  handleEditorOnSaveKeyboardShortcut,
}) => {
  const editorContainer = useRef(null);
  const latestDoc = useRef('');

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
        graphql(schema),
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
          {
            key: 'Mod-s',
            preventDefault: true,
            run: (_view) => {
              handleEditorOnSaveKeyboardShortcut(latestDoc.current);
              return true;
            },
          },
          ...historyKeymap, // Add undo/redo keybindings
          ...completionKeymap,
          ...defaultKeymap,
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
