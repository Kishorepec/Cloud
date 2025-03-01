// controllers/authController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// In-memory user store for demo purposes
const users = [];

const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const userExists = users.find((user) => user.email === email);
    if (userExists) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user object and store it
    const newUser = { email, password: hashedPassword };
    users.push(newUser);

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = users.find((user) => user.email === email);
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Generate a JWT token. The token payload can include user info; here we include the email.
    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser };
