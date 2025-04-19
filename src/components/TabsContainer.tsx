import * as React from 'react';
import { FC } from 'react';

type TabsContainerProps = {
  activeTab: number;
  children: React.ReactNode[];
};

export const TabsContainer: FC<TabsContainerProps> = ({ children, activeTab }) => {
  return (
    <div className="tabs-container">
      {children.map((child, index) => (
        <div key={index} className={`tab-content ${activeTab === index ? '-active' : ''}`}>
          {child}
        </div>
      ))}
    </div>
  );
};

export default TabsContainer;
