import { FC } from 'react';
import Logo from 'src/assets/logo.svg';
import { ConsoleIcon, EditIcon, GithubIcon, VoyagerIcon } from 'src/components/Icons';

const navigationItemClassName = 'navigation-item';

type NavigationProps = {
  hasUnsavedChanges: boolean;
  activeTab: number;
  switchTab: (tab: number) => void;
};

export const Navigation: FC<NavigationProps> = ({ hasUnsavedChanges, activeTab, switchTab }) => {
  const getNavigationItemClassList = (tabIndex: number) => {
    const classList = [navigationItemClassName];

    if (activeTab === tabIndex) {
      classList.push('-active');
    }

    if (hasUnsavedChanges) {
      classList.push('-unsaved');
    }

    return classList.join(' ');
  };

  return (
    <div className="sidebar">
      <div className="sidebar__top">
        <div className="logo">
          <a href="https://github.com/graphql-kit/graphql-faker" target="_blank" rel="noreferrer">
            {' '}
            <img src={Logo} />{' '}
          </a>
        </div>
        <nav className="navigation">
          <ul>
            <li onClick={() => switchTab(0)} className={getNavigationItemClassList(0)}>
              {' '}
              <EditIcon />{' '}
            </li>
            <li
              onClick={() => !hasUnsavedChanges && switchTab(1)}
              className={getNavigationItemClassList(1)}
            >
              {' '}
              <ConsoleIcon />{' '}
            </li>
            <li
              onClick={() => !hasUnsavedChanges && switchTab(2)}
              className={getNavigationItemClassList(2)}
            >
              {' '}
              <VoyagerIcon />{' '}
            </li>
          </ul>
        </nav>
      </div>

      <div className={`${navigationItemClassName} github-icon`}>
        <a href="https://github.com/graphql-kit/graphql-faker" target="_blank" rel="noreferrer">
          {' '}
          <GithubIcon />{' '}
        </a>
      </div>
    </div>
  );
};

export default Navigation;
