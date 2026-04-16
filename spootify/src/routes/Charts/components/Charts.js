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
      const token = data.access_token;

      // Fetch all chart sections using the token we just received
      this.fetchTopCharts(token);
      this.fetchViralTracks(token);
      this.fetchTopAlbums(token);
    } catch (error) {
      console.error('Error getting access token:', error);
    }
  }

  async fetchTopCharts(token) {
    try {
      const response = await fetch(
        `${config.api.baseUrl}/search?q=top&type=track&limit=50`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();

      const tracks = data.tracks.items.map((track, index) => ({
        id: track.id,
        position: index + 1,
        name: track.name,
        artists: track.artists,
        duration_ms: track.duration_ms,
        popularity: track.popularity,
        image: track.album?.images?.[0]?.url || ''
      }));

      this.setState({ topCharts: tracks, isLoading: false });
    } catch (error) {
      console.error('Error fetching top charts:', error);
      this.setState({ isLoading: false });
    }
  }

  async fetchViralTracks(token) {
    try {
      // 🔍 HINT: Promise.all runs all requests in the array at the same time.
      // Read each URL inside this array carefully — do they all look different?
      // Which response is actually being used after the requests finish?
      const [response1, response2] = await Promise.all([
        fetch(`${config.api.baseUrl}/search?q=viral&type=track&limit=20`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${config.api.baseUrl}/search?q=viral&type=track&limit=20`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const data = await response1.json();

      const tracks = data.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artists: track.artists,
        image: track.album?.images?.[0]?.url || ''
      }));

      this.setState({ viralTracks: tracks });
    } catch (error) {
      console.error('Error fetching viral tracks:', error);
    }
  }

  async fetchTopAlbums(token) {
    try {
      const response = await fetch(
        `${config.api.baseUrl}/search?q=year:2024&type=album&limit=15`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();
      this.setState({ topAlbums: data.albums?.items || [] });
    } catch (error) {
      console.error('Error fetching top albums:', error);
    }
  }

  // Convert milliseconds to m:ss format  e.g. 217000 → "3:37"
  formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  render() {
    const { topCharts, viralTracks, topAlbums, isLoading } = this.state;

    if (isLoading) {
      return <div className="charts__loading">Loading charts...</div>;
    }

    return (
      <div className="charts">
        <h1 className="charts__title">Charts</h1>

        <section className="charts__section">
          <h2 className="charts__subtitle">Top 50 Global</h2>
          <div className="charts__list">
            {topCharts.slice(0, 30).map((track) => (
              <div key={track.id} className="chart-item">
                <span className="chart-item__position">#{track.position}</span>
                <img src={track.image} alt={track.name} className="chart-item__image" />
                <div className="chart-item__info">
                  <h3>{track.name}</h3>
                  <p>{track.artists.map(a => a.name).join(', ')}</p>
                </div>
                <span className="chart-item__duration">
                  {this.formatDuration(track.duration_ms)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="charts__section">
          <h2 className="charts__subtitle">Viral Hits</h2>
          <div className="charts__viral-grid">
            {viralTracks.map((track) => (
              <div key={track.id} className="viral-card">
                <img src={track.image} alt={track.name} className="viral-card__image" />
                <div className="viral-card__info">
                  <h4>{track.name}</h4>
                  <p>{track.artists.map(a => a.name).join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

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
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }
}
