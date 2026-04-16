import React, { Component } from 'react';
import config from '../../../config';
import '../styles/_artists.scss';

export default class Artists extends Component {
  constructor() {
    super();

    this.state = {
      topArtists: [],
      popularArtists: [],
      rockArtists: [],
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

      // Fetch all artist sections using the token we just received
      this.fetchTopArtists(token);
      this.fetchPopularArtists(token);
      this.fetchRockArtists(token);
    } catch (error) {
      console.error('Error getting access token:', error);
    }
  }

  async fetchTopArtists(token) {
    try {
      const response = await fetch(
        `${config.api.baseUrl}/search?q=year:2024&type=artist&limit=20`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();
      this.setState({ topArtists: data.artists?.items || [], isLoading: false });
    } catch (error) {
      console.error('Error fetching top artists:', error);
      this.setState({ isLoading: false });
    }
  }

  async fetchPopularArtists(token) {
    try {
      const response = await fetch(
        `${config.api.baseUrl}/search?q=genre:pop&type=artist&limit=15`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();
      this.setState({ popularArtists: data.artists?.items || [] });
    } catch (error) {
      console.error('Error fetching popular artists:', error);
    }
  }

  async fetchRockArtists(token) {
    try {
      const response = await fetch(
        `${config.api.baseUrl}/search?q=genre:rock&type=artist&limit=12`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();
      this.setState({ rockArtists: data.artists?.items || [] });

      // 🔍 HINT: This function makes more than one network request.
      // Is every request actually needed? Check the Network tab
      // in DevTools (F12) to see what's being sent to the server.
      const response2 = await fetch(
        `${config.api.baseUrl}/search?q=genre:rock&type=artist&limit=12`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error fetching rock artists:', error);
    }
  }

  render() {
    const { topArtists, popularArtists, rockArtists, isLoading } = this.state;

    if (isLoading) {
      return <div className="artists__loading">Loading artists...</div>;
    }

    return (
      <div className="artists">
        <h1 className="artists__title">Artists</h1>

        <section className="artists__section">
          <h2 className="artists__subtitle">Trending Now</h2>
          <div className="artists__grid">
            {topArtists.map((artist) => (
              <div key={artist.id} className="artist-card">
                <img
                  src={artist.images?.[0]?.url || ''}
                  alt={artist.name}
                  className="artist-card__image"
                />
                <div className="artist-card__info">
                  <h3>{artist.name}</h3>
                  <p>{artist.genres?.slice(0, 2).join(', ') || 'Artist'}</p>
                  <p>{(artist.followers?.total || 0).toLocaleString()} followers</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="artists__section">
          <h2 className="artists__subtitle">Popular Artists</h2>
          <div className="artists__grid">
            {popularArtists.map((artist) => (
              <div key={artist.id} className="artist-card">
                <img
                  src={artist.images?.[0]?.url || ''}
                  alt={artist.name}
                  className="artist-card__image"
                />
                <div className="artist-card__info">
                  <h3>{artist.name}</h3>
                  <p>{artist.genres?.slice(0, 2).join(', ') || 'Artist'}</p>
                  <p>{(artist.followers?.total || 0).toLocaleString()} followers</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="artists__section">
          <h2 className="artists__subtitle">Rock Artists</h2>
          <div className="artists__grid">
            {rockArtists.map((artist) => (
              <div key={artist.id} className="artist-card">
                <img
                  src={artist.images?.[0]?.url || ''}
                  alt={artist.name}
                  className="artist-card__image"
                />
                <div className="artist-card__info">
                  <h3>{artist.name}</h3>
                  <p>{artist.genres?.slice(0, 2).join(', ') || 'Artist'}</p>
                  <p>{(artist.followers?.total || 0).toLocaleString()} followers</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }
}
