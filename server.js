// server.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/cafeDB', { useNewUrlParser: true, useUnifiedTopology: true });

// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});
const User = mongoose.model('User', userSchema);

// Register route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPass = await bcrypt.hash(password, 10);
  const newUser = new User({ username, password: hashedPass });
  await newUser.save();
  res.json({ message: 'User registered successfully!' });
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: 'User not found' });

  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) return res.status(400).json({ message: 'Invalid password' });

  const token = jwt.sign({ id: user._id }, 'secretKey', { expiresIn: '1h' });
  res.json({ token });
});

// Protected route
app.get('/dashboard', (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, 'secretKey', (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    res.json({ sales: 4567, employees: ['Alice','Bob','Carol','Dave'] });
  });
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));
