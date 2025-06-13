module.exports = {
  siteUrl: 'https://octotechcreations.com',
  generateRobotsTxt: true,
  changefreq: 'weekly',
  priority: 0.5,
  transform: async (config, path) => {
    // Custom priority based on path
    let priority = 0.5; // default priority
    
    if (path === '/' || path === '/home') {
      priority = 1.0; // Homepage - highest priority
    } else if (path === '/about' || path === '/contact') {
      priority = 0.9; // Main pages - very high priority
    } else if (path.startsWith('/artist-login') || path.startsWith('/artist-register')) {
      priority = 0.6; // Auth pages - medium priority
    } else if (path.startsWith('/artist-dashboard')) {
      if (path === '/artist-dashboard') {
        priority = 0.7; // Main dashboard - high priority
      } else {
        priority = 0.4; // Dashboard sub-pages - lower priority
      }
    } else if (path.startsWith('/portfolio/')) {
      priority = 0.8; // Portfolio pages - high priority
    } else if (path.startsWith('/feedback/')) {
      priority = 0.3; // Feedback pages - lowest priority
    }

    return {
      loc: path,
      changefreq: config.changefreq,
      priority: priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    }
  },
}