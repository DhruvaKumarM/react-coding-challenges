import React, { Component } from 'react';
import config from '../../../config';
import '../styles/_artists.scss';

export default class Artists extends Component {
  constructor() {
    super();

    this.state = {
      topArtists: [],
      popularArtists: [],
      genreArtists: [],
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
        this.fetchTopArtists();
        this.fetchPopularArtists();
        this.fetchGenreArtists();
      });
    } catch (error) {
      console.error('Error getting access token:', error);
    }
  }

  async fetchTopArtists() {
    try {
      // BUG: isLoading should be set to true before fetching
      const response = await fetch(
        `${config.api.baseUrl}/search?q=year:2024&type=artist&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${this.state.accessToken}`
          }
        }
      );

      const data = await response.json();
      this.setState({
        topArtists: data.artists?.items || [],
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching top artists:', error);
      this.setState({ isLoading: false });
    }
  }

  async fetchPopularArtists() {
    try {
      const response = await fetch(
        `${config.api.baseUrl}/search?q=genre:pop&type=artist&limit=15`,
        {
          headers: {
            'Authorization': `Bearer ${this.state.accessToken}`
          }
        }
      );

      const data = await response.json();
      this.setState({
        popularArtists: data.artists?.items || []
      });
    } catch (error) {
      console.error('Error fetching popular artists:', error);
    }
  }

  async fetchGenreArtists() {
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
        genreArtists: data.artists?.items || []
      });
    } catch (error) {
      console.error('Error fetching genre artists:', error);
    }
  }

  render() {
    const { topArtists, popularArtists, genreArtists, isLoading } = this.state;

    if (isLoading) {
      return <div className="artists__loading">Loading artists...</div>;
    }

    return (
      <div className="artists">
        <h1 className="artists__title">Top Artists</h1>

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
                  <p className="artist-card__genres">
                    {artist.genres?.slice(0, 2).join(', ') || 'Artist'}
                  </p>
                  <p className="artist-card__followers">
                    {(artist.followers?.total || 0).toLocaleString()} followers
                  </p>
                  <div className="artist-card__popularity">
                    <div className="popularity-bar">
                      <div
                        className="popularity-bar__fill"
                        style={{ width: `${artist.popularity || 0}%` }}
                      />
                    </div>
                    <span>{artist.popularity || 0}</span>
                  </div>
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
                  <p className="artist-card__genres">
                    {artist.genres?.slice(0, 2).join(', ') || 'Artist'}
                  </p>
                  <p className="artist-card__followers">
                    {(artist.followers?.total || 0).toLocaleString()} followers
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="artists__section">
          <h2 className="artists__subtitle">Rock Artists</h2>
          <div className="artists__grid">
            {genreArtists.map((artist) => (
              <div key={artist.id} className="artist-card">
                <img
                  src={artist.images?.[0]?.url || ''}
                  alt={artist.name}
                  className="artist-card__image"
                />
                <div className="artist-card__info">
                  <h3>{artist.name}</h3>
                  <p className="artist-card__genres">
                    {artist.genres?.slice(0, 2).join(', ') || 'Artist'}
                  </p>
                  <p className="artist-card__followers">
                    {(artist.followers?.total || 0).toLocaleString()} followers
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }
}
