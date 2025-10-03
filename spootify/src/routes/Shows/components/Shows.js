import React, { Component } from 'react';
import config from '../../../config';
import '../styles/_shows.scss';

export default class Shows extends Component {
  constructor() {
    super();

    this.state = {
      shows: [],
      episodes: [],
      trendingShows: [],
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
        this.fetchShows();
        this.fetchEpisodes();
        this.fetchTrendingShows();
      });
    } catch (error) {
      console.error('Error getting access token:', error);
    }
  }

  async fetchShows() {
    try {
      const response = await fetch(
        `${config.api.baseUrl}/search?q=podcast&type=show&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${this.state.accessToken}`
          }
        }
      );

      const data = await response.json();
      // BUG: User sees loading indefinitely, should set isLoading before fetch
      this.setState({
        shows: data.shows?.items || [],
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching shows:', error);
      this.setState({ isLoading: false });
    }
  }

  async fetchEpisodes() {
    try {
      // BUG: Two consecutive calls to same endpoint
      const response1 = await fetch(
        `${config.api.baseUrl}/search?q=episode&type=episode&limit=15`,
        {
          headers: {
            'Authorization': `Bearer ${this.state.accessToken}`
          }
        }
      );

      const response2 = await fetch(
        `${config.api.baseUrl}/search?q=episode&type=episode&limit=15`,
        {
          headers: {
            'Authorization': `Bearer ${this.state.accessToken}`
          }
        }
      );

      const data = await response1.json();
      this.setState({
        episodes: data.episodes?.items || []
      });
    } catch (error) {
      console.error('Error fetching episodes:', error);
    }
  }

  async fetchTrendingShows() {
    try {
      // BUG: Missing loading state management
      const response = await fetch(
        `${config.api.baseUrl}/search?q=trending&type=show&limit=12`,
        {
          headers: {
            'Authorization': `Bearer ${this.state.accessToken}`
          }
        }
      );

      const data = await response.json();
      this.setState({
        trendingShows: data.shows?.items || []
      });
    } catch (error) {
      console.error('Error fetching trending shows:', error);
    }
  }

  formatDuration(ms) {
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  render() {
    const { shows, episodes, trendingShows, isLoading } = this.state;

    if (isLoading) {
      return <div className="shows__loading">Loading podcasts...</div>;
    }

    return (
      <div className="shows">
        <h1 className="shows__title">Podcasts & Shows</h1>

        <section className="shows__section">
          <h2 className="shows__subtitle">Popular Podcasts</h2>
          <div className="shows__grid">
            {shows.map((show) => (
              <div key={show.id} className="show-card">
                <img
                  src={show.images?.[0]?.url || ''}
                  alt={show.name}
                  className="show-card__image"
                />
                <div className="show-card__info">
                  <h3>{show.name}</h3>
                  <p className="show-card__publisher">{show.publisher}</p>
                  <p className="show-card__description">
                    {show.description}
                  </p>
                  <p className="show-card__episodes">
                    {show.total_episodes || 0} episodes
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="shows__section">
          <h2 className="shows__subtitle">Latest Episodes</h2>
          <div className="shows__episodes-list">
            {episodes.map((episode) => (
              <div key={episode.id} className="episode-card">
                <img
                  src={episode.images?.[0]?.url || ''}
                  alt={episode.name}
                  className="episode-card__image"
                />
                <div className="episode-card__info">
                  <h3>{episode.name}</h3>
                  <p className="episode-card__description">
                    {episode.description}
                  </p>
                  <div className="episode-card__meta">
                    <span className="episode-card__duration">
                      {this.formatDuration(episode.duration_ms || 0)}
                    </span>
                    <span className="episode-card__date">
                      {episode.release_date ?
                        new Date(episode.release_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="shows__section">
          <h2 className="shows__subtitle">Trending Shows</h2>
          <div className="shows__trending-grid">
            {trendingShows.map((show) => (
              <div key={show.id} className="trending-show-card">
                <img
                  src={show.images?.[0]?.url || ''}
                  alt={show.name}
                  className="trending-show-card__image"
                />
                <div className="trending-show-card__overlay">
                  <h3>{show.name}</h3>
                  <p>{show.publisher}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }
}
