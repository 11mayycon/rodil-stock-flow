module.exports = {
  apps: [
    {
      name: 'caminho-certo',
      script: 'npm',
      args: 'run dev',
      cwd: '/root/posto/posto',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      log_file: '/var/log/pm2/caminho-certo.log',
      out_file: '/var/log/pm2/caminho-certo-out.log',
      error_file: '/var/log/pm2/caminho-certo-error.log',
      time: true
    },
    {
      name: 'auto-responder-evolution',
      script: 'node',
      args: 'server.js',
      cwd: '/root/posto/auto-responder',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      log_file: '/var/log/pm2/auto-responder.log',
      out_file: '/var/log/pm2/auto-responder-out.log',
      error_file: '/var/log/pm2/auto-responder-error.log',
      time: true
    },
    {
      name: 'caminho-bot',
      script: 'server.js',
      cwd: '/root/posto/posto/bot',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      log_file: '/var/log/pm2/caminho-bot.log',
      out_file: '/var/log/pm2/caminho-bot-out.log',
      error_file: '/var/log/pm2/caminho-bot-error.log',
      time: true
    },
    {
      name: 'sync-server',
      script: 'sync-server.cjs',
      cwd: '/root/posto/posto',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        SYNC_PORT: 5000,
        LINX_IP: '192.168.1.100',
        LINX_PORT: '5050',
        VITE_SUPABASE_URL: 'https://fouylveqthojpruiscwq.supabase.co',
        VITE_SUPABASE_PUBLISHABLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdXlsdmVxdGhvanBydWlzY3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MjM5ODYsImV4cCI6MjA3NjQ5OTk4Nn0.h2fT3BlnwR3bb06ZeOQD8cs88owCe6CpqeOPtt2fZO0'
      },
      log_file: '/var/log/pm2/sync-server.log',
      out_file: '/var/log/pm2/sync-server-out.log',
      error_file: '/var/log/pm2/sync-server-error.log',
      time: true,
      restart_delay: 5000,
      max_restarts: 10
    }
  ]
};