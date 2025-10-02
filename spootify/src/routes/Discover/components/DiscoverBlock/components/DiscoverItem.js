import React from 'react';
import '../styles/_discover-item.scss';

export default function DiscoverItem({ images, name }) {
  const imageUrl = images && images[0] && images[0].url ? images[0].url : '';

  return (
    <div className="discover-item animate__animated animate__fadeIn">
      <div
        className="discover-item__art"
        style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : 'none' }}
      />
      <p className="discover-item__title">{name}</p>
    </div>
  );
}
