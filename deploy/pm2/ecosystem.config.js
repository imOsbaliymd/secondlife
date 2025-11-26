module.exports = {
  apps: [
    {
      name: 'secondlife',
      cwd: './secondlife',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
      time: true,
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
}