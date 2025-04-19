import { useEffect, useState } from 'react';
import { Voyager } from 'graphql-voyager';
import { voyagerIntrospectionQueryRequest } from 'src/api';
import 'graphql-voyager/dist/voyager.css';

export const GraphQLVoyager = () => {
  const [introspection, setIntrospection] = useState<any>(null);
  useEffect(() => {
    const voyagerResult = voyagerIntrospectionQueryRequest();
    setIntrospection(voyagerResult);
  }, []);

  return (
    <Voyager
      introspection={introspection}
      displayOptions={{ skipRelay: false, showLeafFields: true }}
      hideSettings
      // workerURI="/voyager.worker.js"
    />
  );
};

export default GraphQLVoyager;
