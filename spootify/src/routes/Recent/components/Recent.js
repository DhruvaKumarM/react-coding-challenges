import React, { Component } from 'react';
import config from '../../../config';
import '../styles/_recent.scss';

export default class Recent extends Component {
  constructor() {
    super();

    this.state = {
      recentlyPlayed: [],
      topTracks: [],
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
        this.fetchRecentlyPlayed();
        this.fetchTopTracks();
      });
    } catch (error) {
      console.error('Error getting access token:', error);
    }
  }

  async fetchRecentlyPlayed() {
    try {
      // BUG: isLoading state not managed properly
      const response = await fetch(
        `${config.api.baseUrl}/search?q=year:2024&type=track&limit=30`,
        {
          headers: {
            'Authorization': `Bearer ${this.state.accessToken}`
          }
        }
      );

      const data = await response.json();

      const recentTracks = data.tracks?.items.map((track, index) => ({
        id: track.id,
        name: track.name,
        artists: track.artists,
        album: track.album,
        duration_ms: track.duration_ms,
        images: track.album?.images || [],
        played_at: new Date(Date.now() - index * 3600000).toISOString()
      })) || [];

      this.setState({
        recentlyPlayed: recentTracks,
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching recently played:', error);
      this.setState({ isLoading: false });
    }
  }

  async fetchTopTracks() {
    try {
      const response = await fetch(
        `${config.api.baseUrl}/search?q=top&type=track&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${this.state.accessToken}`
          }
        }
      );

      const data = await response.json();

      const topTracks = data.tracks?.items.map(track => ({
        id: track.id,
        name: track.name,
        artists: track.artists,
        album: track.album,
        duration_ms: track.duration_ms,
        popularity: track.popularity,
        images: track.album?.images || []
      })) || [];
      // BUG: Should show loading state during data fetch
      this.setState({ topTracks });
    } catch (error) {
      console.error('Error fetching top tracks:', error);
    }
  }

  formatTimeAgo(dateString) {
    const now = new Date();
    const played = new Date(dateString);
    const diffMs = now - played;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffHours < 1) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} days ago`;
    }
  }

  render() {
    const { recentlyPlayed, topTracks, isLoading } = this.state;

    if (isLoading) {
      return <div className="recent__loading">Loading recently played...</div>;
    }

    return (
      <div className="recent">
        <h1 className="recent__title">Recently Played</h1>

        <section className="recent__section">
          <h2 className="recent__subtitle">Your Recent Listening History</h2>
          <div className="recent__list">
            {recentlyPlayed.map((track, index) => (
              <div key={`${track.id}-${index}`} className="recent-item">
                <img
                  src={track.images[0]?.url || ''}
                  alt={track.name}
                  className="recent-item__image"
                />
                <div className="recent-item__info">
                  <h3>{track.name}</h3>
                  <p>{track.artists?.map(a => a.name).join(', ')}</p>
                </div>
                <span className="recent-item__album">
                  {track.album?.name}
                </span>
                <span className="recent-item__time">
                  {this.formatTimeAgo(track.played_at)}
                </span>
                <span className="recent-item__duration">
                  {Math.floor(track.duration_ms / 60000)}:
                  {String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="recent__section">
          <h2 className="recent__subtitle">Your Top Tracks</h2>
          <div className="recent__grid">
            {topTracks.map((track, index) => (
              <div key={track.id} className="track-card">
                <span className="track-card__number">#{index + 1}</span>
                <img
                  src={track.images[0]?.url || ''}
                  alt={track.name}
                  className="track-card__image"
                />
                <div className="track-card__info">
                  <h3>{track.name}</h3>
                  <p>{track.artists?.map(a => a.name).join(', ')}</p>
                  <div className="track-card__popularity">
                    <div className="popularity-bar">
                      <div
                        className="popularity-bar__fill"
                        style={{ width: `${track.popularity || 0}%` }}
                      />
                    </div>
                    <span>{track.popularity || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }
}
