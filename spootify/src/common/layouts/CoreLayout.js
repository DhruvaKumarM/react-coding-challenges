import React, { useState } from 'react';
import Header from '../components/Header';
import SideBar from '../components/SideBar';
import Player from '../components/Player';
import Discover from '../../routes/Discover';
import Search from '../../routes/Search';
import Favourites from '../../routes/Favourites';
import Playlists from '../../routes/Playlists';
import Charts from '../../routes/Charts';
import Playlist from '../../routes/Playlist';

function CoreLayout({ history }) {
  const [currentPage, setCurrentPage] = useState('discover');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);

  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  const navigateTo = (page, playlistId = null) => {
    setCurrentPage(page);
    setSelectedPlaylistId(playlistId);
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'discover':
        return <Discover navigateTo={navigateTo} />;
      case 'search':
        return <Search />;
      case 'favourites':
        return <Favourites />;
      case 'playlists':
        return <Playlists navigateTo={navigateTo} />;
      case 'charts':
        return <Charts />;
      case 'playlist':
        return <Playlist playlistId={selectedPlaylistId} navigateTo={navigateTo} />;
      default:
        return <Discover navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="main">
      <SideBar onNavigate={handleNavigation} />
      <div className="main__content">
        <Header history={history} />
        <div className="main__content__child">
          {renderPage()}
        </div>
      </div>
      <Player />
    </div>
  );
}

export default CoreLayout;
