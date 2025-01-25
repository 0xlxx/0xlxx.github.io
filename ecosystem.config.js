module.exports = {
  apps: [
    {
      name: "blog",
      script: "./server.js",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
