import { FC } from 'react';
import Logo from 'src/assets/logo.svg';
import { ConsoleIcon, EditIcon, GithubIcon, VoyagerIcon } from 'src/components/Icons';

type NavigationProps = {
  hasUnsavedChanges: boolean;
  activeTab: number;
  switchTab: (tab: number) => void;
};

export const Navigation: FC<NavigationProps> = ({ hasUnsavedChanges, activeTab, switchTab }) => {
  return (
    <nav>
      <div className="logo">
        <a href="https://github.com/graphql-kit/graphql-faker" target="_blank" rel="noreferrer">
          {' '}
          <img src={Logo} />{' '}
        </a>
      </div>
      <ul>
        <li
          onClick={() => switchTab(0)}
          className={`${activeTab === 0 ? '-active' : ''} ${hasUnsavedChanges ? '-unsaved' : ''}`}
        >
          {' '}
          <EditIcon />{' '}
        </li>
        <li
          onClick={() => !hasUnsavedChanges && switchTab(1)}
          className={`${activeTab === 1 ? '-active' : ''} ${hasUnsavedChanges ? '-unsaved' : ''}`}
        >
          {' '}
          <ConsoleIcon />{' '}
        </li>
        <li
          onClick={() => !hasUnsavedChanges && switchTab(2)}
          className={`${activeTab === 2 ? '-active' : ''} ${hasUnsavedChanges ? '-unsaved' : ''}`}
        >
          {' '}
          <VoyagerIcon />{' '}
        </li>
        <li className="-pulldown -link">
          <a href="https://github.com/graphql-kit/graphql-faker" target="_blank" rel="noreferrer">
            {' '}
            <GithubIcon />{' '}
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
