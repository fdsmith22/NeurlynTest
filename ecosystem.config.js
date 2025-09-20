module.exports = {
  apps: [{
    name: 'neurlyn-backend',
    script: './backend.js',
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '30s',
    // Graceful shutdown
    kill_timeout: 5000,
    listen_timeout: 3000,
    // Health monitoring
    cron_restart: '0 3 * * *', // Restart daily at 3 AM
  }],

  deploy: {
    production: {
      user: 'deploy',
      host: 'YOUR_SERVER_IP',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/neurlyn.git',
      path: '/var/www/neurlyn',
      'pre-deploy-local': 'npm test',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt-get install git nodejs npm'
    }
  }
};