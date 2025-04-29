import { useState } from 'react';

import { useSchema } from 'src/contexts';
import { TabsContainer, SideBar, FakeEditor, GraphiQLEditor, GraphQLVoyager } from 'src/components';

export const App = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const { hasUnsavedChanges } = useSchema();

  return (
    <div className="faker-editor-container">
      <SideBar
        hasUnsavedChanges={hasUnsavedChanges}
        activeTab={activeTab}
        switchTab={setActiveTab}
      />
      <TabsContainer
        activeTab={activeTab}
        children={[<FakeEditor key={1} />, <GraphiQLEditor key={2} />, <GraphQLVoyager key={3} />]}
      />
    </div>
  );
};
