import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { db } from '../db/index.js';
import { config } from './index.js';
import crypto from 'crypto';

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackUrl,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const avatarUrl = profile.photos[0]?.value;

        // Check if user exists
        const result = await db.query(
          'SELECT * FROM users WHERE email = $1',
          [email]
        );
        let user = result.rows[0];

        if (!user) {
          // Create new user
          const randomPassword = crypto.randomBytes(16).toString('hex');
          const insertResult = await db.query(
            `INSERT INTO users (name, email, password, avatar_url)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [name, email, randomPassword, avatarUrl]
          );
          user = insertResult.rows[0];
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// We don't need serialize/deserialize because we use JWT
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

export default passport;
