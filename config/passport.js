// Passport.js Configuration File
// This file sets up the authentication strategy for our application using Passport.js
// Passport.js is a popular authentication middleware for Node.js

const LocalStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const User = require('../models/User')

module.exports = function (passport) {
  // AUTHENTICATION STRATEGY CONFIGURATION
  // =====================================
  // Configure the Local Strategy for username/password authentication
  // This strategy is used when users log in with email and password
  passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    // Find user in database by email (converted to lowercase for consistency)
    User.findOne({ email: email.toLowerCase() }, (err, user) => {
      // Handle database errors
      if (err) { return done(err) }
      
      // Check if user exists in database
      if (!user) {
        // User not found - return false with error message
        return done(null, false, { msg: `Email ${email} not found.` })
      }
      
      // Check if user has a password (handles cases where users might register via OAuth)
      if (!user.password) {
        return done(null, false, { msg: 'Your account was registered using a sign-in provider. To enable password login, sign in using a provider, and then set a password under your user profile.' })
      }
      
      // Compare the provided password with the hashed password in database
      // This uses the comparePassword method defined in the User model
      user.comparePassword(password, (err, isMatch) => {
        if (err) { return done(err) }
        
        if (isMatch) {
          // Password matches - authentication successful
          // Return the user object (first param: error, second: user, third: info)
          return done(null, user)
        }
        
        // Password doesn't match - authentication failed
        return done(null, false, { msg: 'Invalid email or password.' })
      })
    })
  }))
  

  // SERIALIZATION - STORING USER INFO IN SESSION
  // =============================================
  // Serialize user for storing in session
  // This determines what data should be stored in the session
  // We only store the user ID to keep the session lightweight
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  // DESERIALIZATION - RETRIEVING USER FROM SESSION
  // ===============================================
  // Deserialize user from session
  // This function runs on every request where the user is authenticated
  // It takes the user ID from the session and fetches the full user object from database
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user))
  })
}
