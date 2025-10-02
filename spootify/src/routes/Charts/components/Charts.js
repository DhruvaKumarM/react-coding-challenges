import React, { Component } from 'react';
import config from '../../../config';
import '../styles/_charts.scss';

export default class Charts extends Component {
  constructor() {
    super();

    this.state = {
      topCharts: [],
      viralTracks: [],
      topAlbums: [],
      accessToken: '',
      isLoading: true
    };
  }

  componentDidMount() {
    this.getAccessToken();
  }

  // Real-world Bug: Missing componentWillUnmount
  // Multiple async operations without cleanup tracking

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
        // Bug: Called here AND in componentDidUpdate - duplicate call
        this.fetchTopCharts();
      });
    } catch (error) {
      console.error('Error getting access token:', error);
    }
  }

  async fetchTopCharts() {
    try {
      // Get top global tracks
      const response = await fetch(
        `${config.api.baseUrl}/search?q=top&type=track&limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${this.state.accessToken}`
          }
        }
      );

      const data = await response.json();

      const chartsWithImages = data.tracks.items.map((track, index) => ({
        id: track.id,
        position: index + 1,
        name: track.name,
        artists: track.artists,
        album: track.album,
        duration_ms: track.duration_ms,
        popularity: track.popularity,
        images: track.album?.images || []
      }));

      this.setState({
        topCharts: chartsWithImages,
        isLoading: false
      });

      // Fetch other data
      this.fetchViralTracks();
      this.fetchTopAlbums();
    } catch (error) {
      console.error('Error fetching charts:', error);
      this.setState({ isLoading: false });
    }
  }

  async fetchViralTracks() {
    try {
      const response = await fetch(
        `${config.api.baseUrl}/search?q=viral&type=track&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${this.state.accessToken}`
          }
        }
      );

      const data = await response.json();

      const viralWithImages = data.tracks.items.map(track => ({
        ...track,
        images: track.album?.images || []
      }));

      this.setState({ viralTracks: viralWithImages });
    } catch (error) {
      console.error('Error fetching viral tracks:', error);
    }
  }

  async fetchTopAlbums() {
    try {
      const response = await fetch(
        `${config.api.baseUrl}/search?q=year:2024&type=album&limit=15`,
        {
          headers: {
            'Authorization': `Bearer ${this.state.accessToken}`
          }
        }
      );

      const data = await response.json();

      this.setState({ topAlbums: data.albums?.items || [] });
    } catch (error) {
      console.error('Error fetching top albums:', error);
    }
  }

  render() {
    const { topCharts, viralTracks, topAlbums, isLoading } = this.state;

    if (isLoading) {
      return <div className="charts__loading">Loading charts...</div>;
    }

    return (
      <div className="charts">
        <h1 className="charts__title">Charts</h1>

        {/* Top Global Charts */}
        <section className="charts__section">
          <h2 className="charts__subtitle">Top 50 Global</h2>
          <div className="charts__list">
            {topCharts.slice(0, 30).map((track) => (
              <div key={track.id} className="chart-item">
                <span className="chart-item__position">#{track.position}</span>
                <img
                  src={track.images[0]?.url}
                  alt={track.name}
                  className="chart-item__image"
                />
                <div className="chart-item__info">
                  <h3>{track.name}</h3>
                  <p>{track.artists.map(a => a.name).join(', ')}</p>
                </div>
                <div className="chart-item__popularity">
                  <div className="popularity-bar">
                    <div
                      className="popularity-bar__fill"
                      style={{ width: `${track.popularity}%` }}
                    />
                  </div>
                  <span>{track.popularity}</span>
                </div>
                <span className="chart-item__duration">
                  {Math.floor(track.duration_ms / 60000)}:
                  {String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Viral Tracks */}
        <section className="charts__section">
          <h2 className="charts__subtitle">Viral Hits</h2>
          <div className="charts__viral-grid">
            {viralTracks.map((track) => (
              <div key={track.id} className="viral-card">
                <img
                  src={track.images[0]?.url}
                  alt={track.name}
                  className="viral-card__image"
                />
                <div className="viral-card__info">
                  <h4>{track.name}</h4>
                  <p>{track.artists.map(a => a.name).join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Top Albums */}
        <section className="charts__section">
          <h2 className="charts__subtitle">Top Albums 2024</h2>
          <div className="charts__albums-grid">
            {topAlbums.map((album) => (
              <div key={album.id} className="album-card">
                <img
                  src={album.images?.[0]?.url}
                  alt={album.name}
                  className="album-card__image"
                />
                <div className="album-card__info">
                  <h4>{album.name}</h4>
                  <p>{album.artists.map(a => a.name).join(', ')}</p>
                  <p className="album-card__year">{album.release_date?.split('-')[0]}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }
}
