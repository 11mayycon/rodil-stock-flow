module.exports = {
  apps: [{
    name: 'caminho-certo',
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
    error_file: '/var/log/pm2/caminho-certo-error.log',
    out_file: '/var/log/pm2/caminho-certo-out.log',
    log_file: '/var/log/pm2/caminho-certo-combined.log',
    time: true
  }]
};