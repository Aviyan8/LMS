module.exports = {
  apps: [{
    name: 'lms-app',
    script: 'server.js', // Make sure this matches your main file!
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
