const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Account = require('./public/Models/Account');

passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const account = await Account.findOne({ email });
      if (!account) {
        console.log('Account not found:', email);
        return done(null, false, { message: 'Incorrect email.' });
      }

      // Assuming you have a method to compare passwords
      const isMatch = await account.comparePassword(password);
      if (!isMatch) {
        console.log('Password mismatch for account:', email);
        return done(null, false, { message: 'Incorrect password.' });
      }

      console.log('Authentication successful for account:', email);
      return done(null, account);
    } catch (err) {
      console.error('Error in Passport strategy:', err);
      return done(err);
    }
  })
);

// Serialize account to store in session
passport.serializeUser((account, done) => {
  done(null, account.id);
});

// Deserialize account from session
passport.deserializeUser(async (id, done) => {
  try {
    const account = await Account.findById(id);
    done(null, account);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;