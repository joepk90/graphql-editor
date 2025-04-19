import { useEffect, useState, FC } from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';

// CodeMirror core and addons
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/fold/foldgutter.css'; // Needed for folding
import 'codemirror/addon/hint/show-hint.css';

import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/matchbrackets';

import 'codemirror-graphql/mode'; // GraphQL mode
import 'codemirror-graphql/hint'; // Autocompletion

import { Editor, EditorConfiguration } from 'codemirror';
import { GraphQLSchema, validate, parse, specifiedRules, GraphQLError } from 'graphql';

interface GraphQLHintOptions {
  schema: GraphQLSchema;
  closeOnUnfocus?: boolean;
  completeSingle?: boolean;
}

interface ExtendedEditorConfiguration extends EditorConfiguration {
  foldGutter?: boolean;
  gutters?: string[];
}

interface SchemaEditorProps {
  value: string;
  schema: GraphQLSchema;
  onChange: (newValue: string) => void;
  setValidationErrors: (errors: GraphQLError[]) => void;
}

export const SchemaEditor: FC<SchemaEditorProps> = ({
  value,
  schema,
  onChange,
  setValidationErrors,
}) => {
  const [editor, setEditor] = useState<Editor | null>(null);

  const validateGraphQL = (query: string) => {
    try {
      const document = parse(query);
      const errors = validate(schema, document, specifiedRules);
      setValidationErrors(Array.from(errors));
    } catch (parseError: unknown) {
      if (parseError instanceof GraphQLError) {
        setValidationErrors(Array.from([parseError]));
      } else {
        console.error('Unexpected error during validation:', parseError);
        setValidationErrors([]);
      }
    }
  };

  useEffect(() => {
    if (editor && schema) {
      editor.setOption('hintOptions', {
        schema,
        closeOnUnfocus: false,
        completeSingle: false,
      } as GraphQLHintOptions);

      // editor.setOption('lint', {
      //   schema,
      //   validationRules: specifiedRules,
      // });

      validateGraphQL(value);
    }
  }, [editor, schema, value]);

  return (
    <CodeMirror
      value={value}
      options={
        {
          mode: 'graphql',
          theme: 'default',
          lineNumbers: true,
          autoCloseBrackets: true,
          matchBrackets: true,
          foldGutter: true,
          lint: true, // graphql lint
          height: '100%',
          viewportMargin: Infinity,
          scrollbarStyle: 'native',
          gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
          hintOptions: {
            schema,
            closeOnUnfocus: true,
            completeSingle: false,
          } as GraphQLHintOptions,
          extraKeys: {
            'Ctrl-Space': (editor: Editor) => editor.showHint(),
            'Cmd-Space': (editor: Editor) => editor.showHint(),
          },
        } as ExtendedEditorConfiguration
      }
      editorDidMount={(editorInstance: Editor) => {
        setEditor(editorInstance);
      }}
      onBeforeChange={(_, __, newValue) => {
        onChange(newValue);
        validateGraphQL(newValue);
      }}
    />
  );
};
