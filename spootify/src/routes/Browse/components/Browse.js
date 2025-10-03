import React, { Component } from 'react';
import config from '../../../config';
import '../styles/_browse.scss';

export default class Browse extends Component {
  constructor() {
    super();

    this.state = {
      newReleases: [],
      featuredPlaylists: [],
      categories: [],
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
        this.fetchNewReleases();
        this.fetchFeaturedPlaylists();
        this.fetchCategories();
      });
    } catch (error) {
      console.error('Error getting access token:', error);
    }
  }

  async fetchNewReleases() {
    try {
      const response = await fetch(
        `${config.api.baseUrl}/browse/new-releases?limit=30`,
        {
          headers: {
            'Authorization': `Bearer ${this.state.accessToken}`
          }
        }
      );

      const data = await response.json();
      // BUG: Setting isLoading to false without first setting it to true
      this.setState({
        newReleases: data.albums?.items || [],
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching new releases:', error);
      this.setState({ isLoading: false });
    }
  }

  async fetchFeaturedPlaylists() {
    try {
      // BUG: No loading indicator while fetching playlists
      const response = await fetch(
        `${config.api.baseUrl}/browse/featured-playlists?limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${this.state.accessToken}`
          }
        }
      );

      const data = await response.json();
      this.setState({
        featuredPlaylists: data.playlists?.items || []
      });
    } catch (error) {
      console.error('Error fetching featured playlists:', error);
    }
  }

  async fetchCategories() {
    try {
      const response = await fetch(
        `${config.api.baseUrl}/browse/categories?limit=30`,
        {
          headers: {
            'Authorization': `Bearer ${this.state.accessToken}`
          }
        }
      );

      const data = await response.json();
      this.setState({
        categories: data.categories?.items || []
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  render() {
    const { newReleases, featuredPlaylists, categories, isLoading } = this.state;

    if (isLoading) {
      return <div className="browse__loading">Loading browse content...</div>;
    }

    return (
      <div className="browse">
        <h1 className="browse__title">Browse All</h1>

        <section className="browse__section">
          <h2 className="browse__subtitle">New Releases</h2>
          <div className="browse__grid">
            {newReleases.map((album) => (
              <div key={album.id} className="browse-card">
                <img
                  src={album.images?.[0]?.url || ''}
                  alt={album.name}
                  className="browse-card__image"
                />
                <div className="browse-card__info">
                  <h3>{album.name}</h3>
                  <p>{album.artists?.map(a => a.name).join(', ')}</p>
                  <p className="browse-card__date">
                    {album.release_date ? new Date(album.release_date).getFullYear() : ''}
                  </p>
                  <p className="browse-card__tracks">
                    {album.total_tracks} tracks
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="browse__section">
          <h2 className="browse__subtitle">Featured Playlists</h2>
          <div className="browse__grid">
            {featuredPlaylists.map((playlist) => (
              <div key={playlist.id} className="browse-card">
                <img
                  src={playlist.images?.[0]?.url || ''}
                  alt={playlist.name}
                  className="browse-card__image"
                />
                <div className="browse-card__info">
                  <h3>{playlist.name}</h3>
                  <p>{playlist.description}</p>
                  <p className="browse-card__tracks">
                    {playlist.tracks?.total || 0} tracks
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="browse__section">
          <h2 className="browse__subtitle">Browse Categories</h2>
          <div className="browse__categories-grid">
            {categories.map((category) => (
              <div key={category.id} className="category-card">
                <img
                  src={category.icons?.[0]?.url || ''}
                  alt={category.name}
                  className="category-card__image"
                />
                <h3>{category.name}</h3>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }
}
