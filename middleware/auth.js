// AUTHENTICATION MIDDLEWARE
// =========================
// This middleware provides route protection for authenticated users
// It's used to ensure only logged-in users can access certain routes

module.exports = {
    // MIDDLEWARE: Ensure user is authenticated
    // ========================================
    // This function checks if a user is logged in before allowing access to protected routes
    // Usage: Apply this middleware to any route that requires authentication
    // Example: router.get('/protected-route', ensureAuth, controller.method)
    ensureAuth: function (req, res, next) {
      // req.isAuthenticated() is a Passport.js method that returns true if user is logged in
      // This method checks if there's a valid user session and the user is deserialized
      if (req.isAuthenticated()) {
        // User is authenticated - proceed to the next middleware/route handler
        return next()
      } else {
        // User is NOT authenticated - redirect to home/login page
        // This prevents unauthorized users from accessing protected content
        res.redirect('/')
      }
    },

    // MIDDLEWARE: Ensure user is NOT authenticated (guest access only)
    // ===============================================================
    // This middleware is used for routes that should only be accessible to non-logged-in users
    // For example: login and signup pages (logged-in users shouldn't see these)
    ensureGuest: function (req, res, next) {
      // If user is NOT authenticated, allow access
      if (!req.isAuthenticated()) {
        return next()
      } else {
        // If user IS authenticated, redirect them away from guest-only pages
        res.redirect('/todos') // Redirect to their dashboard/main app
      }
    }
  }

  /*
  AUTHENTICATION WORKFLOW EXPLANATION:
  ====================================
  
  1. When a user makes a request to a protected route:
     - Express processes the request through middleware chain
     - Session middleware loads the session data
     - Passport.session() middleware deserializes the user from session
     - ensureAuth middleware checks req.isAuthenticated()
     
  2. If authenticated:
     - req.user contains the full user object
     - Request proceeds to the route handler
     
  3. If not authenticated:
     - User is redirected to login page
     - Original route is not executed
     
  4. This creates a seamless authentication flow where:
     - Authenticated users see protected content
     - Unauthenticated users are sent to login
     - No protected data is exposed to unauthorized users
  */
  