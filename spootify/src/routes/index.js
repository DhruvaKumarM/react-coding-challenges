import React, { useState } from 'react';
import Discover from './Discover';
import Search from './Search';
import Playlist from './Playlist';
import Favourites from './Favourites';
import Playlists from './Playlists';
import Charts from './Charts';

export default function Routes({ currentPage = 'discover' }) {
  const [activePage, setActivePage] = useState(currentPage);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);

  const navigateTo = (page, playlistId = null) => {
    setActivePage(page);
    setSelectedPlaylistId(playlistId);

    // Notify parent if needed
    if (window.updateCurrentPage) {
      window.updateCurrentPage(page);
    }
  };

  return (
    <div className="routes-container">
      <div className="page-content">
        {activePage === 'discover' && <Discover navigateTo={navigateTo} />}
        {activePage === 'search' && <Search />}
        {activePage === 'favourites' && <Favourites />}
        {activePage === 'playlists' && <Playlists navigateTo={navigateTo} />}
        {activePage === 'charts' && <Charts />}
        {activePage === 'playlist' && <Playlist playlistId={selectedPlaylistId} navigateTo={navigateTo} />}
      </div>
    </div>
  );
}
