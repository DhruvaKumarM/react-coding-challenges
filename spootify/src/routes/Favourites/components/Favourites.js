import React, { Component } from 'react';
import config from '../../../config';
import '../styles/_favourites.scss';

export default class Favourites extends Component {
  constructor() {
    super();

    this.state = {
      favouriteTracks: [],
      favouriteArtists: [],
      recentlyPlayed: [],
      topGenres: [],
      accessToken: '',
      isLoading: true
    };
  }

  componentDidMount() {
    this.getAccessToken();
  }

  // Real-world Bug: Missing cleanup in componentWillUnmount
  // If user navigates away quickly, setState will be called on unmounted component

  async getAccessToken() {
    try {
      const response = await fetch(config.api.authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(config.api.clientId + ':' + config.api.clientSecret)
        },
        body: 'grant_type=client_credentials'
      });

      const data = await response.json();
      this.setState({ accessToken: data.access_token }, () => {
        this.fetchFavouriteTracks();
      });
    } catch (error) {
      console.error('Error getting access token:', error);
    }
  }

  async fetchFavouriteTracks() {
    try {
      // Using search for top liked songs
      const response = await fetch(
        `${config.api.baseUrl}/search?q=genre:pop&type=track&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${this.state.accessToken}`
          }
        }
      );

      const data = await response.json();

      const tracksWithImages = data.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artists: track.artists,
        album: track.album,
        duration_ms: track.duration_ms,
        images: track.album?.images || []
      }));

      this.setState({
        favouriteTracks: tracksWithImages,
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching favourite tracks:', error);
      this.setState({ isLoading: false });
    }
  }

  async fetchFavouriteArtists() {
    try {
      const response = await fetch(
        `${config.api.baseUrl}/search?q=genre:rock&type=artist&limit=12`,
        {
          headers: {
            'Authorization': `Bearer ${this.state.accessToken}`
          }
        }
      );

      const data = await response.json();

      this.setState({
        favouriteArtists: data.artists?.items || []
      });
    } catch (error) {
      console.error('Error fetching favourite artists:', error);
    }
  }

  async fetchRecentlyPlayed() {
    try {
      const response = await fetch(
        `${config.api.baseUrl}/search?q=year:2024&type=track&limit=15`,
        {
          headers: {
            'Authorization': `Bearer ${this.state.accessToken}`
          }
        }
      );

      const data = await response.json();

      const recentTracks = data.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artists: track.artists,
        album: track.album,
        images: track.album?.images || []
      }));

      this.setState({
        recentlyPlayed: recentTracks
      });
    } catch (error) {
      console.error('Error fetching recently played:', error);
    }
  }

  render() {
    const { favouriteTracks, favouriteArtists, recentlyPlayed, isLoading } = this.state;

    if (isLoading) {
      return <div className="favourites__loading">Loading your favourites...</div>;
    }

    return (
      <div className="favourites">
        <h1 className="favourites__title">Your Library</h1>

        {/* Favourite Artists Section */}
        <section className="favourites__section">
          <h2 className="favourites__subtitle">Favourite Artists</h2>
          <div className="favourites__artists-grid">
            {favouriteArtists.map((artist) => (
              <div key={artist.id} className="artist-card">
                <img
                  src={artist.images?.[0]?.url || ''}
                  alt={artist.name}
                  className="artist-card__image"
                />
                <h3>{artist.name}</h3>
                <p>{artist.genres?.slice(0, 2).join(', ')}</p>
                <p className="artist-card__followers">
                  {(artist.followers?.total || 0).toLocaleString()} followers
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Favourite Tracks Section */}
        <section className="favourites__section">
          <h2 className="favourites__subtitle">Liked Songs</h2>
          <div className="favourites__grid">
            {favouriteTracks.map((track, index) => (
              <div key={track.id} className="favourite-item">
                <span className="favourite-item__number">{index + 1}</span>
                <img
                  src={track.images[0]?.url}
                  alt={track.name}
                  className="favourite-item__image"
                />
                <div className="favourite-item__info">
                  <h3>{track.name}</h3>
                  <p>{track.artists.map(a => a.name).join(', ')}</p>
                </div>
                <span className="favourite-item__duration">
                  {Math.floor(track.duration_ms / 60000)}:
                  {String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Recently Played Section */}
        <section className="favourites__section">
          <h2 className="favourites__subtitle">Recently Played</h2>
          <div className="favourites__recent-grid">
            {recentlyPlayed.map((track) => (
              <div key={track.id} className="recent-card">
                <img
                  src={track.images[0]?.url}
                  alt={track.name}
                  className="recent-card__image"
                />
                <div className="recent-card__info">
                  <h4>{track.name}</h4>
                  <p>{track.artists.map(a => a.name).join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }
}
