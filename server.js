// EXPRESS SERVER WITH PASSPORT.JS AUTHENTICATION
// ===============================================
// This is the main server file that sets up Express with Passport.js authentication

const express = require('express')
const app = express()
const mongoose = require('mongoose')
const passport = require('passport')           // Main Passport.js library for authentication
const session = require('express-session')    // Session management for user persistence
const MongoStore = require('connect-mongo')(session) // Store sessions in MongoDB
const flash = require('express-flash')        // Flash messages for user feedback
const logger = require('morgan')
const connectDB = require('./config/database')
const mainRoutes = require('./routes/main')
const todoRoutes = require('./routes/todos')

// Load environment variables from .env file
require('dotenv').config({path: './config/.env'})

// PASSPORT.JS CONFIGURATION
// =========================
// Load and configure Passport.js strategies and serialization
// This must be done BEFORE initializing Passport middleware
require('./config/passport')(passport)

// Connect to MongoDB database
connectDB()

// BASIC EXPRESS MIDDLEWARE SETUP
// ==============================
app.set('view engine', 'ejs')              // Set EJS as template engine
app.use(express.static('public'))           // Serve static files
app.use(express.urlencoded({ extended: true })) // Parse form data
app.use(express.json())                     // Parse JSON data
app.use(logger('dev'))                      // HTTP request logging

// SESSION CONFIGURATION FOR AUTHENTICATION
// =========================================
// Sessions are CRITICAL for Passport.js to work
// They store user authentication state between requests
app.use(
    session({
      secret: 'keyboard cat',           // Secret key for signing session cookies (should be in .env!)
      resave: false,                    // Don't save session if unmodified
      saveUninitialized: false,         // Don't create session until something stored
      store: new MongoStore({ 
        mongooseConnection: mongoose.connection // Store sessions in MongoDB (persists across server restarts)
      }),
    })
  )
  
// PASSPORT.JS MIDDLEWARE INITIALIZATION
// ====================================
// These middlewares MUST come after session middleware and BEFORE routes
app.use(passport.initialize())  // Initialize Passport.js
app.use(passport.session())     // Enable persistent login sessions (deserialize user from session)

// FLASH MESSAGES MIDDLEWARE
// =========================
// Must come after session middleware - used for displaying error/success messages
app.use(flash())
  
// ROUTE CONFIGURATION
// ===================
app.use('/', mainRoutes)     // Routes for authentication (login, signup, logout)
app.use('/todos', todoRoutes) // Protected routes for todo functionality
 
app.listen(process.env.PORT, ()=>{
    console.log('Server is running, you better catch it!')
})    