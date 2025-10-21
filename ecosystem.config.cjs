module.exports = {
  apps: [{
    name: 'posto-rodoil',
    script: 'npx',
    args: 'serve -s dist -p 3000',
    cwd: '/root/posto/posto',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/posto-rodoil-error.log',
    out_file: '/var/log/pm2/posto-rodoil-out.log',
    log_file: '/var/log/pm2/posto-rodoil-combined.log',
    time: true
  }]
};