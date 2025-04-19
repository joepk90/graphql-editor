import { useState } from 'react';
import { SchemaEditor } from 'src/components';
import { GraphQLSchema, GraphQLError } from 'graphql';
import { style } from '../../node_modules/@motionone/dom/lib/animate/style';

type Props = {
  schemaEditorValue: string;
  fullSchema: GraphQLSchema;
  setSchemaEditorValue: (schema: string) => void;
};

export const FakeEditor = ({ schemaEditorValue, fullSchema, setSchemaEditorValue }: Props) => {
  const [validationErrors, setValidationErrors] = useState<readonly GraphQLError[]>([]);
  return (
    <>
      <SchemaEditor
        value={schemaEditorValue}
        onChange={setSchemaEditorValue}
        setValidationErrors={setValidationErrors}
        schema={fullSchema}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <button className="" onClick={() => setSchemaEditorValue(schemaEditorValue)}>
            Update Schema
          </button>
        </div>

        {validationErrors.length > 0 && (
          <div style={{ color: 'red', marginTop: '10px', fontSize: '12px', textAlign: 'right' }}>
            <h4>Validation Errors:</h4>
            <ul>
              {validationErrors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};
