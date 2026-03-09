import express, { json } from 'express'
import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check user exists or not
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = createToken(user._id);
      return res.json({ 
        success: true, 
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          cartData: user.cartData || {}
        }
      });
    } else {
      return res.json({ success: false, message: "Invalid credentials" });
    }

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check if user exists
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    // validate email
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email" });
    }

    // validate password
    if (password.length < 8) {
      return res.json({ success: false, message: "Please enter a strong password (min 8 characters)" });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create user
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      cartData: {} // Initialize empty cart
    });

    const user = await newUser.save();

    // create token
    const token = createToken(user._id);

    res.json({ 
      success: true, 
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        cartData: user.cartData || {}
      }
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET)
      res.json({ success: true, token })
    } else {
      res.json({ success: false, message: "Invalid credentials" })
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

// ✅ NEW: Get user by token
const getUserByToken = async (req, res) => {
  try {
    const { token } = req.headers;
    
    if (!token) {
      return res.json({ success: false, message: "No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        cartData: user.cartData || {}
      }
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ NEW: Update user cart
const updateCart = async (req, res) => {
  try {
    const { userId, cartData } = req.body;
    const { token } = req.headers;

    if (!token) {
      return res.json({ success: false, message: "No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Make sure the user is updating their own cart
    if (decoded.id !== userId) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    const user = await userModel.findByIdAndUpdate(
      userId,
      { cartData },
      { new: true }
    );

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "Cart updated successfully",
      cartData: user.cartData
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ NEW: Get user cart
const getCart = async (req, res) => {
  try {
    const { userId } = req.body;
    const { token } = req.headers;

    if (!token) {
      return res.json({ success: false, message: "No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Make sure the user is accessing their own cart
    if (decoded.id !== userId) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    const user = await userModel.findById(userId);
    
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      cartData: user.cartData || {}
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ NEW: Clear user cart
const clearCart = async (req, res) => {
  try {
    const { userId } = req.body;
    const { token } = req.headers;

    if (!token) {
      return res.json({ success: false, message: "No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.id !== userId) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    const user = await userModel.findByIdAndUpdate(
      userId,
      { cartData: {} },
      { new: true }
    );

    res.json({
      success: true,
      message: "Cart cleared successfully"
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { 
  loginUser, 
  registerUser, 
  adminLogin, 
  getUserByToken, 
  updateCart, 
  getCart, 
  clearCart 
};