module.exports = {
  apps: [
    {
      name: 'mt-interview',
      script: './app',
      watch: true,
      ignore_watch: 'node_modules',
      time: true,
      error_file: './error.txt',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
