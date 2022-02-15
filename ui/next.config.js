module.exports = {
    webpack: (config, { isServer }) => {
      // Fixes npm packages that depend on `fs` module
      if (!isServer) {
        config.resolve.fallback.fs = false;
        config.resolve.fallback.net = false;
  
      }
  
      return config
    }
  };
  