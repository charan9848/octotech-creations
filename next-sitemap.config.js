module.exports = {
  siteUrl: 'https://octotechcreations.com',
  generateRobotsTxt: false, // We have our own robots.txt
  changefreq: 'weekly',
  priority: 0.5,
  exclude: [
    '/artist-dashboard*',
    '/artist-login',
    '/artist-register',
    '/home', // Redirects to /
    '/api/*',
  ],
  transform: async (config, path) => {
    // Custom priority based on path
    let priority = 0.5; // default priority
    
    if (path === '/') {
      priority = 1.0; // Homepage - highest priority
    } else if (path === '/about' || path === '/contact') {
      priority = 0.9; // Main pages - very high priority
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