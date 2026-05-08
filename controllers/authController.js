const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 🔑 Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};



// 📌 REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, addresses, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      addresses,
      role
    });

    res.status(201).json({
      message: 'User registered successfully',
      user
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};



// 📌 LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        addresses: user.addresses,
      },
      token,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// 📌 GET PROFILE
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// 📌 ADD ADDRESS
exports.addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.addresses.push(req.body);

    await user.save();

    res.json({
      message: "Address added",
      user: {
        _id: user._id,
        addresses: user.addresses,
      },
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// 📌 DELETE ADDRESS
exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.addresses.push(req.body);

    await user.save();

    res.json({
      message: "Address added",
      user: {
        _id: user._id,
        addresses: user.addresses,
      },
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};