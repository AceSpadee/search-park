const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
    },
    userName: {
        type: String,
        required: [true, 'User name is required'],
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: [4, 'Password must be at least 4 characters'],
    },
    locations: [{
      lat: Number,
      lng: Number,
      timestamp: { 
        type: Date,
        default: Date.now,
      },
      notes: {
        type: String,
        required: false,
      },
    }]
});


// Set up pre-save middleware to create password
userSchema.pre('save', async function (next) {
  if (this.isModified('password') || this.isNew) {
    try {
      const saltRounds = 10;
      this.password = await bcrypt.hash(this.password, saltRounds);
      console.log('Hashed password in pre-save hook:', this.password);  // Log the hashed password
      next();
    } catch (err) {
      return next(err);
    }
  } else {
    next();
  }
});
  
  // Compare the incoming password with the hashed password
  userSchema.methods.isCorrectPassword = async function (password) {
    return bcrypt.compare(password, this.password);
  };

const User = model('User', userSchema);

module.exports = User;