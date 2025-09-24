// TODOS ROUTES - PROTECTED ROUTES FOR AUTHENTICATED USERS
// =======================================================
// This file defines routes for todo functionality
// ALL routes here require user authentication to access

const express = require('express')
const router = express.Router()
const todosController = require('../controllers/todos') 
const { ensureAuth } = require('../middleware/auth')

// PROTECTED ROUTE - VIEW TODOS
// ============================
// GET /todos - Display user's todo list
// ensureAuth middleware ensures only logged-in users can access this
// If user is not authenticated, they'll be redirected to login page
router.get('/', ensureAuth, todosController.getTodos)

// PROTECTED ROUTES - TODO OPERATIONS
// ==================================
// Note: These routes are missing ensureAuth middleware!
// This is a potential security issue - unauthorized users could potentially access these routes
// In a production app, ALL todo routes should have ensureAuth middleware

// POST /todos/createTodo - Create a new todo item
// TODO: Add ensureAuth middleware for security
router.post('/createTodo', todosController.createTodo)

// PUT /todos/markComplete - Mark a todo as completed
// TODO: Add ensureAuth middleware for security
router.put('/markComplete', todosController.markComplete)

// PUT /todos/markIncomplete - Mark a todo as incomplete
// TODO: Add ensureAuth middleware for security
router.put('/markIncomplete', todosController.markIncomplete)

// DELETE /todos/deleteTodo - Delete a todo item
// TODO: Add ensureAuth middleware for security
router.delete('/deleteTodo', todosController.deleteTodo)

/*
AUTHENTICATION PROTECTION ANALYSIS:
===================================

CURRENT STATE:
- Only GET /todos route is protected with ensureAuth
- All other todo operations (create, update, delete) are NOT protected
- This creates a security vulnerability

RECOMMENDED IMPROVEMENTS:
1. Add ensureAuth to all routes:
   router.post('/createTodo', ensureAuth, todosController.createTodo)
   router.put('/markComplete', ensureAuth, todosController.markComplete)
   router.put('/markIncomplete', ensureAuth, todosController.markIncomplete)
   router.delete('/deleteTodo', ensureAuth, todosController.deleteTodo)

2. Or apply middleware to entire router:
   router.use(ensureAuth) // Protect all routes in this file

WORKFLOW WITH PROPER AUTHENTICATION:
1. User visits /todos
2. ensureAuth middleware checks if user is logged in
3. If not authenticated: redirect to login page
4. If authenticated: continue to todo controller
5. Controller has access to req.user (current logged-in user)
6. Operations are scoped to the current user's data

SECURITY BENEFITS:
- Prevents unauthorized access to todo operations
- Ensures users can only see/modify their own todos
- Maintains session-based authentication throughout the app
- Provides consistent user experience
*/

module.exports = router