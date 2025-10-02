import React from 'react';

export default function SearchResults({ results }) {
  const { tracks, artists, albums, playlists } = results;

  return (
    <div className="search-results">
      {tracks.length > 0 && (
        <div className="search-results__section">
          <h2>Tracks</h2>
          <div className="search-results__grid">
            {tracks.map((track) => (
              <div key={track.id} className="search-result-item">
                <img
                  src={track.album?.images[0]?.url}
                  alt={track.name}
                  className="search-result-item__image"
                />
                <div className="search-result-item__info">
                  <h3>{track.name}</h3>
                  <p>{track.artists.map(a => a.name).join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {artists.length > 0 && (
        <div className="search-results__section">
          <h2>Artists</h2>
          <div className="search-results__grid">
            {artists.map((artist) => (
              <div key={artist.id} className="search-result-item">
                <img
                  src={artist.images[0]?.url}
                  alt={artist.name}
                  className="search-result-item__image"
                />
                <div className="search-result-item__info">
                  <h3>{artist.name}</h3>
                  <p>{artist.followers?.total} followers</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {albums.length > 0 && (
        <div className="search-results__section">
          <h2>Albums</h2>
          <div className="search-results__grid">
            {albums.map((album) => (
              <div key={album.id} className="search-result-item">
                <img
                  src={album.images[0]?.url}
                  alt={album.name}
                  className="search-result-item__image"
                />
                <div className="search-result-item__info">
                  <h3>{album.name}</h3>
                  <p>{album.artists.map(a => a.name).join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {playlists && playlists.length > 0 && (
        <div className="search-results__section">
          <h2>Playlists</h2>
          <div className="search-results__grid">
            {playlists.map((playlist) => (
              <div key={playlist.id} className="search-result-item">
                <img
                  src={playlist.images?.[0]?.url}
                  alt={playlist.name}
                  className="search-result-item__image"
                />
                <div className="search-result-item__info">
                  <h3>{playlist.name}</h3>
                  <p>{playlist.description || `By ${playlist.owner?.display_name}`}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
