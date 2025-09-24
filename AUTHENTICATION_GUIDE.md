# PASSPORT.JS AUTHENTICATION WORKFLOW DOCUMENTATION
# ================================================
# Complete guide to understanding the authentication system in this application

## OVERVIEW
This application uses Passport.js with Local Strategy for user authentication.
The system provides secure user registration, login, logout, and session management.

## KEY COMPONENTS

### 1. PASSPORT.JS CONFIGURATION (config/passport.js)
- Defines the Local Strategy for email/password authentication
- Handles user serialization/deserialization for sessions
- Integrates with User model for password verification

### 2. USER MODEL (models/User.js)
- Mongoose schema for user data
- Automatic password hashing with bcrypt
- Password comparison method for login verification
- Security: Never stores plain text passwords

### 3. AUTHENTICATION MIDDLEWARE (middleware/auth.js)
- ensureAuth: Protects routes requiring authentication
- ensureGuest: Restricts access for already logged-in users
- Route-level security enforcement

### 4. AUTH CONTROLLER (controllers/auth.js)
- Handles login, logout, and registration logic
- Input validation and error handling
- Integration with Passport.js authentication methods

### 5. SERVER CONFIGURATION (server.js)
- Express session setup with MongoDB storage
- Passport.js middleware initialization
- Proper middleware ordering for authentication

## AUTHENTICATION WORKFLOW

### USER REGISTRATION PROCESS:
1. User visits GET /signup
2. Fills out registration form (username, email, password)
3. POST /signup validates input
4. Checks for existing users
5. Creates new User instance
6. User.pre('save') middleware hashes password with bcrypt
7. User saved to database
8. req.logIn() automatically logs in new user
9. Redirect to /todos dashboard

### USER LOGIN PROCESS:
1. User visits GET /login
2. Fills out login form (email, password)
3. POST /login validates input
4. passport.authenticate('local') triggers:
   - User.findOne() searches for user by email
   - user.comparePassword() verifies password against hash
   - If valid: returns user object
   - If invalid: returns false with error message
5. If successful: req.logIn() establishes session
6. Redirect to protected area (/todos)

### SESSION MANAGEMENT:
1. passport.serializeUser() stores user.id in session
2. On each request: passport.deserializeUser() fetches full user object
3. req.user populated with current user data
4. Session stored in MongoDB for persistence

### ROUTE PROTECTION:
1. Protected routes use ensureAuth middleware
2. ensureAuth checks req.isAuthenticated()
3. If authenticated: continue to route handler
4. If not authenticated: redirect to login

### LOGOUT PROCESS:
1. GET /logout called
2. req.logout() removes authentication from session
3. req.session.destroy() completely clears session
4. Redirect to home page

## SECURITY FEATURES

### PASSWORD SECURITY:
- bcrypt hashing with salt rounds (10)
- Unique salt per password
- Passwords never stored in plain text
- Resistant to rainbow table attacks

### SESSION SECURITY:
- Sessions stored in MongoDB (persistent)
- Session cookies signed with secret key
- Session data includes minimal user info (just ID)
- Full user object loaded on each request

### ROUTE SECURITY:
- Middleware-based protection
- Granular control over route access
- Automatic redirects for unauthorized access
- Prevention of direct URL manipulation

## CURRENT SECURITY ISSUES & RECOMMENDATIONS

### ISSUES FOUND:
1. Todo operation routes lack ensureAuth middleware
2. Session secret is hardcoded (should be in .env)
3. Missing CSRF protection
4. No rate limiting on auth routes

### RECOMMENDED FIXES:
1. Add ensureAuth to all todo routes
2. Move session secret to environment variable
3. Implement CSRF tokens for forms
4. Add rate limiting middleware
5. Use HTTPS in production
6. Add password strength requirements
7. Implement account lockout after failed attempts

## DEVELOPMENT VS PRODUCTION

### DEVELOPMENT CONSIDERATIONS:
- Console logging for debugging
- Detailed error messages
- Less restrictive validation

### PRODUCTION REQUIREMENTS:
- Environment variables for secrets
- HTTPS enforcement
- Error logging to files
- Stricter validation and security headers
- Database connection security
- Session configuration optimization

## EXTENDING THE SYSTEM

### ADDING OAUTH PROVIDERS:
1. Install passport strategies (passport-google-oauth20, etc.)
2. Configure strategies in passport.js
3. Add routes for OAuth callbacks
4. Handle OAuth user creation/linking

### ADDING PASSWORD RESET:
1. Create password reset tokens
2. Email integration for reset links
3. Temporary token validation
4. Secure password update process

### ADDING TWO-FACTOR AUTHENTICATION:
1. Generate TOTP secrets for users
2. QR code generation for authenticator apps
3. Token verification during login
4. Backup codes for recovery

## TESTING AUTHENTICATION

### MANUAL TESTING:
1. Test registration with valid/invalid data
2. Test login with correct/incorrect credentials
3. Test access to protected routes while logged out
4. Test logout functionality
5. Test session persistence across browser restarts

### AUTOMATED TESTING:
1. Unit tests for User model methods
2. Integration tests for auth routes
3. Middleware testing for route protection
4. Session management testing

This documentation provides a complete overview of the authentication system
and serves as a reference for understanding, maintaining, and extending
the Passport.js implementation in this application.