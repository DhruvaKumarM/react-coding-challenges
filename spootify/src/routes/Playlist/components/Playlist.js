import React, { Component } from 'react';
import config from '../../../config';
import '../styles/_playlist.scss';

export default class Playlist extends Component {
  constructor(props) {
    super(props);

    this.state = {
      playlist: null,
      tracks: [],
      accessToken: '',
      isLoading: true
    };
  }

  componentDidMount() {
    this.getAccessToken();
  }

  // Real-world Bug: Missing componentDidUpdate to handle prop changes
  // If playlistId prop changes, component won't refetch new data
  // This is a common mistake when using class components

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
        this.fetchPlaylistDetails();
      });
    } catch (error) {
      console.error('Error getting access token:', error);
    }
  }

  async fetchPlaylistDetails() {
    const { playlistId } = this.props;

    // Real-world Bug: No validation of required props
    // Should check if playlistId exists before making API call
    try {
      const response = await fetch(
        `${config.api.baseUrl}/playlists/${playlistId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.state.accessToken}`
          }
        }
      );

      const data = await response.json();

      // Real-world Bug: Race condition - sets loading to false before all data is fetched
      // User sees partial data before tracks are loaded
      this.setState({
        playlist: data,
        isLoading: false
      });

      this.fetchPlaylistTracks(playlistId);
    } catch (error) {
      console.error('Error fetching playlist:', error);
      this.setState({ isLoading: false });
    }
  }

  async fetchPlaylistTracks(playlistId) {
    try {
      const response = await fetch(
        `${config.api.baseUrl}/playlists/${playlistId}/tracks`,
        {
          headers: {
            'Authorization': `Bearer ${this.state.accessToken}`
          }
        }
      );

      const data = await response.json();
      this.setState({ tracks: data.items });
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  }

  render() {
    const { playlist, tracks, isLoading } = this.state;
    const { navigateTo } = this.props;

    if (isLoading) {
      return <div className="playlist__loading">Loading playlist...</div>;
    }

    if (!playlist) {
      return <div className="playlist__error">Playlist not found</div>;
    }

    return (
      <div className="playlist">
        <button className="playlist__back" onClick={() => navigateTo('discover')}>
          ← Back to Discover
        </button>

        <div className="playlist__header">
          <img
            src={playlist.images?.[0]?.url}
            alt={playlist.name}
            className="playlist__image"
          />
          <div className="playlist__info">
            <h1>{playlist.name}</h1>
            <p>{playlist.description}</p>
            <div className="playlist__meta">
              <span>{playlist.owner?.display_name}</span>
              <span>•</span>
              <span>{playlist.tracks?.total} tracks</span>
            </div>
          </div>
        </div>

        <div className="playlist__tracks">
          <h2>Tracks</h2>
          {tracks.map((item, index) => (
            <div key={item.track?.id || index} className="track-item">
              <span className="track-item__number">{index + 1}</span>
              <img
                src={item.track?.album?.images?.[0]?.url}
                alt={item.track?.name}
                className="track-item__image"
              />
              <div className="track-item__info">
                <h3>{item.track?.name}</h3>
                <p>{item.track?.artists?.map(a => a.name).join(', ')}</p>
              </div>
              <span className="track-item__duration">
                {Math.floor(item.track?.duration_ms / 60000)}:
                {String(Math.floor((item.track?.duration_ms % 60000) / 1000)).padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
