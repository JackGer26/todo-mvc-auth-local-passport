// MAIN ROUTES - AUTHENTICATION AND PUBLIC PAGES
// ==============================================
// This file defines routes for authentication and public pages
// These routes handle user login, signup, logout, and home page

const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth') 
const homeController = require('../controllers/home')
const { ensureAuth, ensureGuest } = require('../middleware/auth')

// PUBLIC ROUTES
// =============
// Routes accessible to everyone (no authentication required)

// Home page - landing page for the application
router.get('/', homeController.getIndex)

// AUTHENTICATION ROUTES
// =====================
// Routes for user authentication workflow

// Login Routes
// ------------
// GET /login - Display login form
// No middleware needed - anyone can view login page
router.get('/login', authController.getLogin)

// POST /login - Process login form submission
// This triggers the Passport.js authentication process
router.post('/login', authController.postLogin)

// Logout Route
// ------------
// GET /logout - Log user out and destroy session
// Note: This could also be POST for better security practices
router.get('/logout', authController.logout)

// Registration Routes
// -------------------
// GET /signup - Display registration form
router.get('/signup', authController.getSignup)

// POST /signup - Process registration form submission
// Creates new user account and automatically logs them in
router.post('/signup', authController.postSignup)

/*
AUTHENTICATION ROUTE WORKFLOW:
==============================

1. NEW USER JOURNEY:
   GET / → GET /signup → POST /signup → Redirect to /todos (logged in)

2. RETURNING USER JOURNEY:
   GET / → GET /login → POST /login → Redirect to /todos (logged in)

3. LOGOUT JOURNEY:
   GET /logout → Destroy session → Redirect to / (logged out)

4. MIDDLEWARE USAGE:
   - No ensureAuth needed here (these are public auth routes)
   - ensureGuest could be added to login/signup to redirect already authenticated users
   - This creates a clean separation between public and protected routes

5. SECURITY CONSIDERATIONS:
   - Login/signup forms should use HTTPS in production
   - CSRF protection should be added for POST routes
   - Rate limiting should be implemented to prevent brute force attacks
   - Input validation is handled in the controllers
*/

module.exports = router