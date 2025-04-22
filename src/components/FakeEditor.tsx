import { useState } from 'react';
import { GraphQLSchema, GraphQLError } from 'graphql';
import { GraphQLSchemaEditor } from 'src/components/GraphQLSchemaEditor';

type Props = {
  schemaEditorValue: string;
  fullSchema: GraphQLSchema;
  setSchemaEditorValue: (schema: string) => void;
  updateSchema: (schema: string) => void;
};

export const FakeEditor = ({
  schemaEditorValue,
  fullSchema,
  setSchemaEditorValue,
  updateSchema,
}: Props) => {
  console.log('fullSchema: ', fullSchema);
  const [validationErrors, setValidationErrors] = useState<readonly GraphQLError[]>([]);
  return (
    <>
      <GraphQLSchemaEditor value={schemaEditorValue} schema={fullSchema} />

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <button className="" onClick={() => updateSchema(schemaEditorValue)}>
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
