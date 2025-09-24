// AUTHENTICATION CONTROLLER
// =========================
// This controller handles all authentication-related routes and logic
// It manages user login, logout, and registration processes

const passport = require('passport')        // Passport.js for authentication
const validator = require('validator')      // Input validation library
const User = require('../models/User')     // User model for database operations

// GET LOGIN PAGE
// ==============
// Displays the login form to users
// Redirects already authenticated users to their dashboard
exports.getLogin = (req, res) => {
    // Check if user is already logged in
    // req.user is populated by Passport.js if user is authenticated
    if (req.user) {
      // User is already logged in - redirect to main app
      return res.redirect('/todos')
    }
    
    // User is not logged in - show login page
    res.render('login', {
      title: 'Login'
    })
  }
  
  // POST LOGIN (AUTHENTICATION PROCESS)
  // ===================================
  // Handles the actual login process when user submits login form
  // This is where the main authentication magic happens
  exports.postLogin = (req, res, next) => {
    // INPUT VALIDATION
    // ================
    // Always validate user input before processing
    const validationErrors = []
    if (!validator.isEmail(req.body.email)) validationErrors.push({ msg: 'Please enter a valid email address.' })
    if (validator.isEmpty(req.body.password)) validationErrors.push({ msg: 'Password cannot be blank.' })
  
    // If validation fails, redirect back to login with error messages
    if (validationErrors.length) {
      req.flash('errors', validationErrors)
      return res.redirect('/login')
    }
    
    // Normalize email (convert to lowercase, remove extra spaces)
    req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false })
  
    // PASSPORT.JS AUTHENTICATION
    // ==========================
    // Use the 'local' strategy we configured in config/passport.js
    // This is a custom callback approach that gives us more control
    passport.authenticate('local', (err, user, info) => {
      // Handle any errors during authentication
      if (err) { return next(err) }
      
      // If authentication failed (user is false), show error and redirect
      if (!user) {
        req.flash('errors', info) // 'info' contains the error message from our strategy
        return res.redirect('/login')
      }
      
      // SUCCESSFUL AUTHENTICATION - LOG USER IN
      // ========================================
      // req.logIn() is a Passport.js method that establishes a login session
      // It calls serializeUser() to store user info in session
      req.logIn(user, (err) => {
        if (err) { return next(err) }
        
        // Show success message and redirect user
        req.flash('success', { msg: 'Success! You are logged in.' })
        
        // Redirect to intended page (if they were redirected to login) or default to /todos
        // req.session.returnTo stores the original URL they were trying to access
        res.redirect(req.session.returnTo || '/todos')
      })
    })(req, res, next) // Immediately invoke the middleware function
  }
  
  // LOGOUT PROCESS
  // ==============
  // Handles user logout and session cleanup
  exports.logout = (req, res) => {
    // PASSPORT.JS LOGOUT
    // ==================
    // req.logout() is a Passport.js method that removes user from req.user
    // and removes their session data related to authentication
    req.logout(() => {
      console.log('User has logged out.')
    })
    
    // COMPLETE SESSION DESTRUCTION
    // ============================
    // Destroy the entire session for security
    // This removes all session data, not just auth data
    req.session.destroy((err) => {
      if (err) console.log('Error : Failed to destroy the session during logout.', err)
      
      // Explicitly clear user object (though session.destroy should handle this)
      req.user = null
      
      // Redirect to home page - user is now fully logged out
      res.redirect('/')
    })
  }
  
  // GET SIGNUP PAGE
  // ===============
  // Displays the registration form to new users
  // Redirects already authenticated users to their dashboard
  exports.getSignup = (req, res) => {
    // Check if user is already logged in
    if (req.user) {
      // User is already authenticated - redirect to main app
      return res.redirect('/todos')
    }
    
    // User is not logged in - show signup page
    res.render('signup', {
      title: 'Create Account'
    })
  }
  
  // POST SIGNUP (USER REGISTRATION)
  // ===============================
  // Handles new user registration process
  // Creates new user account and automatically logs them in
  exports.postSignup = (req, res, next) => {
    // INPUT VALIDATION
    // ================
    // Validate all signup form fields
    const validationErrors = []
    if (!validator.isEmail(req.body.email)) validationErrors.push({ msg: 'Please enter a valid email address.' })
    if (!validator.isLength(req.body.password, { min: 8 })) validationErrors.push({ msg: 'Password must be at least 8 characters long' })
    if (req.body.password !== req.body.confirmPassword) validationErrors.push({ msg: 'Passwords do not match' })
  
    // If validation fails, redirect back with errors
    if (validationErrors.length) {
      req.flash('errors', validationErrors)
      return res.redirect('../signup')
    }
    
    // Normalize email for consistency
    req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false })
  
    // CREATE NEW USER OBJECT
    // ======================
    // Create a new User instance with form data
    // Password will be automatically hashed by the User model's pre-save middleware
    const user = new User({
      userName: req.body.userName,
      email: req.body.email,
      password: req.body.password  // This gets hashed automatically in User.js
    })
  
    // CHECK FOR EXISTING USERS
    // ========================
    // Prevent duplicate accounts with same email or username
    User.findOne({$or: [
      {email: req.body.email},
      {userName: req.body.userName}
    ]}, (err, existingUser) => {
      if (err) { return next(err) }
      
      // If user already exists, show error and redirect
      if (existingUser) {
        req.flash('errors', { msg: 'Account with that email address or username already exists.' })
        return res.redirect('../signup')
      }
      
      // SAVE NEW USER TO DATABASE
      // =========================
      // User doesn't exist - save the new user
      user.save((err) => {
        if (err) { return next(err) }
        
        // AUTOMATIC LOGIN AFTER SIGNUP
        // ============================
        // Automatically log in the new user using Passport.js
        // This provides a seamless experience - signup and immediate access
        req.logIn(user, (err) => {
          if (err) {
            return next(err)
          }
          // Redirect to main app - user is now registered and logged in
          res.redirect('/todos')
        })
      })
    })
  }