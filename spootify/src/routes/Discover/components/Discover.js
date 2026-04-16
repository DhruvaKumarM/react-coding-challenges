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
        headers: { 'Authorization': `Bearer ${this.state.accessToken}` }
      });
      const data = await response.json();
      this.setState({ newReleases: data.albums.items });
    } catch (error) {
      console.error('Error fetching new releases:', error);
    }
  }

  async fetchTopArtists() {
    try {
      const response = await fetch(`${config.api.baseUrl}/search?q=year:2024&type=artist&limit=20`, {
        headers: { 'Authorization': `Bearer ${this.state.accessToken}` }
      });
      const data = await response.json();
      this.setState({ topArtists: data.artists.items });
    } catch (error) {
      console.error('Error fetching top artists:', error);
    }
  }

  async fetchCategories() {
    try {
      const response = await fetch(`${config.api.baseUrl}/browse/categories?limit=20`, {
        headers: { 'Authorization': `Bearer ${this.state.accessToken}` }
      });
      const data = await response.json();
      this.setState({ categories: data.categories.items });
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  async fetchPopularTracks() {
    try {
      const response = await fetch(`${config.api.baseUrl}/search?q=year:2024&type=track&limit=20`, {
        headers: { 'Authorization': `Bearer ${this.state.accessToken}` }
      });

      const data = await response.json();

      const tracks = data.tracks.items.map(track => ({
        ...track,
        images: track.album?.images || []
      }));

      this.setState({ popularTracks: tracks });

      // 🔍 HINT: Open the Network tab in DevTools (F12) and watch
      // the requests when this page loads. Count how many times
      // the tracks endpoint gets called. Does that number seem right?
      fetch(`${config.api.baseUrl}/search?q=year:2024&type=track&limit=20`, {
        headers: { 'Authorization': `Bearer ${this.state.accessToken}` }
      });
    } catch (error) {
      console.error('Error fetching popular tracks:', error);
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
