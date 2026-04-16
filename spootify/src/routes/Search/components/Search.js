import React, { Component } from 'react';
import config from '../../../config';
import SearchResults from './SearchResults';
import '../styles/_search.scss';

export default class Search extends Component {
  constructor() {
    super();

    this.state = {
      searchQuery: '',
      searchResults: {
        tracks: [],
        artists: [],
        albums: [],
        playlists: []
      },
      trendingSearches: [],
      accessToken: '',
      isLoading: false
    };
  }

  componentDidMount() {
    this.getAccessToken();
    this.fetchTrendingSearches();
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
      this.setState({ accessToken: data.access_token });
    } catch (error) {
      console.error('Error getting access token:', error);
    }
  }

  handleSearchInput = (e) => {
    const query = e.target.value;
    this.setState({ searchQuery: query });
    this.performSearch(query);
  }

  async performSearch(query) {
    try {
      const response = await fetch(
        `${config.api.baseUrl}/search?q=${query}&type=track,artist,album,playlist&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${this.state.accessToken}`
          }
        }
      );

      const data = await response.json();

      this.setState({
        searchResults: {
          tracks: data.tracks?.items || [],
          artists: data.artists?.items || [],
          albums: data.albums?.items || [],
          playlists: data.playlists?.items || []
        },
        isLoading: false
      });
    } catch (error) {
      console.error('Error searching:', error);
      this.setState({ isLoading: false });
    }
  }

  async fetchTrendingSearches() {
    try {
      const response = await fetch(
        `${config.api.baseUrl}/search?q=trending&type=track&limit=8`,
        {
          headers: {
            'Authorization': `Bearer ${this.state.accessToken}`
          }
        }
      );

      const data = await response.json();

      const trendsWithImages = data.tracks?.items.map(track => ({
        id: track.id,
        name: track.name,
        artists: track.artists,
        images: track.album?.images || []
      })) || [];

      this.setState({ trendingSearches: trendsWithImages });

      // 🔍 HINT: Read this function top to bottom carefully.
      // After the state has already been updated, does the code do
      // anything else? Check if any extra work is being done that
      // was already completed earlier in this same function.
      await fetch(
        `${config.api.baseUrl}/search?q=trending&type=track&limit=8`,
        {
          headers: {
            'Authorization': `Bearer ${this.state.accessToken}`
          }
        }
      );
    } catch (error) {
      console.error('Error fetching trending:', error);
    }
  }

  render() {
    const { searchQuery, searchResults, trendingSearches, isLoading } = this.state;

    return (
      <div className="search">
        <div className="search__header">
          <h1>Search</h1>
          <input
            type="text"
            className="search__input"
            placeholder="What do you want to listen to?"
            value={searchQuery}
            onChange={this.handleSearchInput}
          />
        </div>

        {isLoading && <div className="search__loading">Searching...</div>}

        {!searchQuery && trendingSearches.length > 0 && (
          <div className="search__trending">
            <h2>Trending Searches</h2>
            <div className="search__trending-grid">
              {trendingSearches.map((item) => (
                <div key={item.id} className="trending-item">
                  <img src={item.images[0]?.url} alt={item.name} />
                  <div className="trending-item__info">
                    <h4>{item.name}</h4>
                    <p>{item.artists.map(a => a.name).join(', ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchQuery && <SearchResults results={searchResults} />}
      </div>
    );
  }
}
