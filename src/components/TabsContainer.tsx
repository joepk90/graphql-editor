import { FC } from 'react';
import GraphiQL from 'graphiql';
import { GraphQLSchema } from 'graphql';
import { Voyager } from 'graphql-voyager';
import GraphQLEditor from '../GraphQLEditor/GraphQLEditor';
import { graphQLFetcher } from 'src/api/graphql';

type TabsContainerProps = {
  activeTab: number;
  hasUnsavedChanges: boolean;
  schema: GraphQLSchema | null;
  unsavedSchema: GraphQLSchema | null;
  value: string;
  error: string | null;
  status: string | null;
  onEdit: (value: string) => void;
  saveUserSDL: () => void;
};

export const TabsContainer: FC<TabsContainerProps> = ({
  activeTab,
  hasUnsavedChanges,
  schema,
  unsavedSchema,
  value,
  error,
  status,
  onEdit,
  saveUserSDL,
}) => {
  return (
    <div className="tabs-container">
      <div className={`tab-content editor-container ${activeTab === 0 ? '-active' : ''}`}>
        <GraphQLEditor
          schema={unsavedSchema || schema}
          onEdit={onEdit}
          onCommand={saveUserSDL}
          value={value}
        />
        <div className="action-panel">
          <a
            className={`material-button ${hasUnsavedChanges ? '' : '-disabled'}`}
            onClick={saveUserSDL}
          >
            <span> Save </span>
          </a>
          <div className="status-bar">
            <span className="status"> {status} </span>
            <span className="error-message">{error}</span>
          </div>
        </div>
      </div>
      <div className={`tab-content ${activeTab === 1 ? '-active' : ''}`}>
        <GraphiQL fetcher={(e) => graphQLFetcher(e)} schema={schema} />
      </div>
      <div className={'tab-content ' + (activeTab === 2 ? '-active' : '')}>
        <Voyager
          introspection={(e) => graphQLFetcher({ query: e })}
          hideSettings={activeTab !== 2}
          workerURI="/voyager.worker.js"
        />
      </div>
    </div>
  );
};

export default TabsContainer;
