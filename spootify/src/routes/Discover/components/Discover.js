import React, { Component } from 'react';
import DiscoverBlock from './DiscoverBlock/components/DiscoverBlock';
import '../styles/_discover.scss';
import config from '../../../config';

export default class Discover extends Component {
  constructor() {
    super();

    this.state = {
      newReleases: [],
      playlists: [],
      categories: [],
      topArtists: [],
      popularTracks: [],
      accessToken: ''
    };
  }

  componentDidMount() {
    this.getAccessToken();
  }

  // Bug 1: Missing componentWillUnmount - causes memory leak
  // When user navigates away, setState is called on unmounted component

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

      // Bug 2: Race condition - setState before async operations complete
      this.setState({ accessToken: data.access_token });

      // Bug 3: Sequential API calls (await) instead of parallel - slow performance
      await this.fetchNewReleases();
      await this.fetchTopArtists();
      await this.fetchCategories();
      await this.fetchPopularTracks();
    } catch (error) {
      console.error('Error getting access token:', error);
      // Bug 4: No error state management - user sees nothing when API fails
    }
  }

  async fetchNewReleases() {
    try {
      const response = await fetch(`${config.api.baseUrl}/browse/new-releases?limit=20`, {
        headers: {
          'Authorization': `Bearer ${this.state.accessToken}`
        }
      });

      const data = await response.json();

      // Bug 5: No check if component is still mounted before setState
      // Can cause "Can't perform a React state update on an unmounted component" warning
      this.setState({ newReleases: data.albums.items });
    } catch (error) {
      console.error('Error fetching new releases:', error);
    }
  }

  async fetchTopArtists() {
    try {
      // Using search API to get popular artists
      const response = await fetch(`${config.api.baseUrl}/search?q=year:2024&type=artist&limit=20`, {
        headers: {
          'Authorization': `Bearer ${this.state.accessToken}`
        }
      });

      const data = await response.json();
      this.setState({ topArtists: data.artists.items });
    } catch (error) {
      console.error('Error fetching top artists:', error);
    }
  }

  async fetchPopularTracks() {
    try {
      // BUG: Making duplicate requests simultaneously
      const response = await fetch(`${config.api.baseUrl}/search?q=year:2024&type=track&limit=20`, {
        headers: {
          'Authorization': `Bearer ${this.state.accessToken}`
        }
      });

      fetch(`${config.api.baseUrl}/search?q=year:2024&type=track&limit=20`, {
        headers: {
          'Authorization': `Bearer ${this.state.accessToken}`
        }
      });

      const data = await response.json();

      const tracksWithImages = data.tracks.items.map(track => ({
        ...track,
        images: track.album?.images || []
      }));

      this.setState({ popularTracks: tracksWithImages });
    } catch (error) {
      console.error('Error fetching popular tracks:', error);
    }
  }

  async fetchCategories() {
    try {
      const response = await fetch(`${config.api.baseUrl}/browse/categories?limit=20`, {
        headers: {
          'Authorization': `Bearer ${this.state.accessToken}`
        }
      });

      const data = await response.json();
      this.setState({ categories: data.categories.items });
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  render() {
    const { newReleases, topArtists, categories, popularTracks } = this.state;

    return (
      <div className="discover">
        <DiscoverBlock text="RELEASED THIS WEEK" id="released" data={newReleases} />
        <DiscoverBlock text="TOP ARTISTS" id="artists" data={topArtists} />
        <DiscoverBlock text="BROWSE" id="browse" data={categories} imagesKey="icons" />
        <DiscoverBlock text="POPULAR TRACKS" id="popular" data={popularTracks} imagesKey="album" />
      </div>
    );
  }
}
