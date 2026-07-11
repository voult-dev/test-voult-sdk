const sessionConfig = {
  secret: process.env.SESSION_SECRET || process.env.SECRET || 'voult-playground-dev-secret',
  resave: false,
  saveUninitialized: false,
  name: 'voult_playground_sid',
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

export default sessionConfig;
