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

      await this.fetchNewReleases();
      await this.fetchTopArtists();
      await this.fetchCategories();
      await this.fetchPopularTracks();
    } catch (error) {
      console.error('Error getting access token:', error);
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
      // 🔍 HINT: Open the Network tab in your browser DevTools (F12) and
      // navigate to this page. Count how many requests are made to the
      // tracks endpoint. Does the number match what you'd expect?
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
