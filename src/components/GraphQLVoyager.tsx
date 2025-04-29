import { useEffect, useState } from 'react';
import { Voyager } from 'graphql-voyager';
import { useVoyagerIntrospection } from 'src/hooks';
import 'graphql-voyager/dist/voyager.css';

export const GraphQLVoyager = () => {
  const { data, error, isLoading } = useVoyagerIntrospection();
  const [introspection, setIntrospection] = useState<any>(null);

  useEffect(() => {
    if (data) {
      setIntrospection(data);
    }
  }, [data]);

  if (isLoading) return <div>Loading schema...</div>;
  if (error) return <div>Error loading Voyager schema.</div>;

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
