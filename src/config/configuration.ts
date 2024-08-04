export default () => ({
  nodeEnv: process.env.NODE_ENV,
  key: {
    encryption: process.env.ENCRYPTION_KEY,
    jwtSecret: process.env.JWT_SECRET_KEY,
  },
  seed: {
    username: process.env.SEED_USERNAME,
    password: process.env.SEED_PASSWORD,
  },
});
