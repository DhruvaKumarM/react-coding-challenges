import React, { Component } from 'react';
import config from '../../../config';
import '../styles/_playlists.scss';

export default class Playlists extends Component {
  constructor() {
    super();

    this.state = {
      featuredPlaylists: [],
      accessToken: '',
      isLoading: true
    };
  }

  componentDidMount() {
    this.getAccessToken();
  }

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
        this.fetchPlaylists();
      });
    } catch (error) {
      console.error('Error getting access token:', error);
    }
  }

  async fetchPlaylists() {
    if (!this.state.accessToken) return;

    try {
      const response = await fetch(
        `${config.api.baseUrl}/browse/featured-playlists?limit=30`,
        {
          headers: {
            'Authorization': `Bearer ${this.state.accessToken}`
          }
        }
      );

      const data = await response.json();

      this.setState({
        featuredPlaylists: data.playlists?.items || [],
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching playlists:', error);
      this.setState({ isLoading: false });
    }
  }

  handlePlaylistClick = (playlistId) => {
    const { navigateTo } = this.props;
    if (navigateTo) {
      navigateTo('playlist', playlistId);
    }
  }

  render() {
    const { featuredPlaylists, isLoading } = this.state;

    if (isLoading) {
      return <div className="playlists__loading">Loading playlists...</div>;
    }

    return (
      <div className="playlists">
        <h1 className="playlists__title">Featured Playlists</h1>

        <div className="playlists__grid">
          {featuredPlaylists.map((playlist) => (
            <div
              key={playlist.id}
              className="playlist-card"
              onClick={() => this.handlePlaylistClick(playlist.id)}
            >
              <img
                src={playlist.images?.[0]?.url}
                alt={playlist.name}
                className="playlist-card__image"
              />
              <div className="playlist-card__info">
                <h3>{playlist.name}</h3>
                <p>{playlist.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
