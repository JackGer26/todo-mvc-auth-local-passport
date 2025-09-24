// USER MODEL FOR AUTHENTICATION
// ==============================
// This model defines the User schema and includes password hashing functionality
// It's designed to work seamlessly with Passport.js authentication

const bcrypt = require('bcrypt')    // For password hashing and comparison
const mongoose = require('mongoose')

// USER SCHEMA DEFINITION
// ======================
// Define the structure of user documents in MongoDB
const UserSchema = new mongoose.Schema({
  userName: { 
    type: String, 
    unique: true    // Ensures no duplicate usernames
  },
  email: { 
    type: String, 
    unique: true    // Ensures no duplicate emails
  },
  password: String  // Will store the hashed password, never plain text
})

// PASSWORD HASHING MIDDLEWARE
// ===========================
// This pre-save middleware automatically hashes passwords before saving to database
// This is CRITICAL for security - we never store plain text passwords
UserSchema.pre('save', function save(next) {
  const user = this  // 'this' refers to the user document being saved
  
  // Only hash the password if it has been modified (or is new)
  // This prevents re-hashing the password on every user update
  if (!user.isModified('password')) { 
    return next() 
  }
  
  // BCRYPT HASHING PROCESS
  // ======================
  // Step 1: Generate a salt (random data) for this password
  // Salt rounds = 10 (higher = more secure but slower)
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err) }
    
    // Step 2: Hash the password using the generated salt
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) { return next(err) }
      
      // Step 3: Replace the plain text password with the hash
      user.password = hash
      next() // Continue with the save operation
    })
  })
})

// PASSWORD COMPARISON METHOD
// ==========================
// Instance method to compare a provided password with the stored hash
// This is used during login to verify user credentials
UserSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  // bcrypt.compare() safely compares plain text password with stored hash
  // It handles the salt automatically and returns true/false for match
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    // Callback with (error, isMatch) - isMatch is boolean
    cb(err, isMatch)
  })
}

/*
AUTHENTICATION SECURITY WORKFLOW:
=================================

1. USER REGISTRATION:
   - User submits plain text password
   - Pre-save middleware automatically hashes password with bcrypt
   - Only the hash is stored in database
   - Original password is never stored anywhere

2. USER LOGIN:
   - User submits plain text password
   - comparePassword() method compares it with stored hash
   - bcrypt handles the salt and comparison internally
   - Returns true if passwords match, false otherwise

3. WHY THIS IS SECURE:
   - Even if database is compromised, passwords are hashed
   - Each password has a unique salt (prevents rainbow table attacks)
   - bcrypt is designed to be slow (prevents brute force attacks)
   - Hashes cannot be "unhashed" to get original password

4. INTEGRATION WITH PASSPORT.JS:
   - Passport calls comparePassword() during authentication
   - If password matches, user is authenticated
   - If not, authentication fails
   - This model provides the foundation for secure authentication
*/


module.exports = mongoose.model('User', UserSchema)
