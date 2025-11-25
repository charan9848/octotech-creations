"use client";

import { useEffect } from 'react';

export default function VisitorTracker() {
  useEffect(() => {
    // Check if we already counted this session
    const visited = sessionStorage.getItem('visited_session');
    
    if (!visited) {
      // Mark as visited
      sessionStorage.setItem('visited_session', 'true');
      
      // Send tracking request
      fetch('/api/track-visit', { method: 'POST' })
        .catch(err => console.error('Tracking error:', err));
    }
  }, []);

  return null;
}
