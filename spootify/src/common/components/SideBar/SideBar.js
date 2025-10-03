import React, { useState } from 'react';
import cx from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeadphonesAlt,
  faHeart,
  faPlayCircle,
  faSearch, faStream,
  faUser,
  faClock,
  faPodcast,
  faMusic
} from '@fortawesome/free-solid-svg-icons';
import { ReactComponent as Avatar } from '../../../assets/images/avatar.svg';
import './_sidebar.scss';

export default function SideBar({ onNavigate }) {
  const [selectedPage, setSelectedPage] = useState('discover');

  const handleNavigation = (page) => {
    setSelectedPage(page);
    if (onNavigate) {
      onNavigate(page);
    }
  };

  function renderSideBarOption(link, icon, text, page) {
    return (
      <div
        className={cx('sidebar__option', { 'sidebar__option--selected': selectedPage === page })}
        onClick={() => handleNavigation(page)}
        style={{ cursor: 'pointer' }}
      >
        <FontAwesomeIcon icon={icon} />
        <p>{text}</p>
      </div>
    )
  }

  return (
    <div className="sidebar">
      <div className="sidebar__profile">
        <Avatar />
        <p>Bob Smith</p>
      </div>
      <div className="sidebar__options">
        {renderSideBarOption('/', faHeadphonesAlt, 'Discover', 'discover')}
        {renderSideBarOption('/search', faSearch, 'Search', 'search')}
        {renderSideBarOption('/favourites', faHeart, 'Favourites', 'favourites')}
        {renderSideBarOption('/playlists', faPlayCircle, 'Playlists', 'playlists')}
        {renderSideBarOption('/charts', faStream, 'Charts', 'charts')}
        {renderSideBarOption('/artists', faUser, 'Artists', 'artists')}
        {renderSideBarOption('/browse', faMusic, 'Browse', 'browse')}
        {renderSideBarOption('/recent', faClock, 'Recent', 'recent')}
        {renderSideBarOption('/shows', faPodcast, 'Shows', 'shows')}
      </div>
    </div>
  );
}
