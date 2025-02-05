require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error("Missing JWT_SECRET in .env file");
}

const users = new Map();

/**
 * Generate tokens and set refresh token in a secure cookie
 */
function generateTokens(res, email) {
  const accessToken = jwt.sign({ email }, SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ email }, SECRET, { expiresIn: '7d' });

  users.set(email, { password: users.get(email).password, refreshToken });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, // Prevent XSS attacks
    secure: false, // Set to true in production (requires HTTPS)
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return { accessToken };
}

/**
 * Preload a mock user
 */
(async function createMockUser() {
  const mockEmail = "test@example.com";
  const mockPassword = "W!1234565f";
  const hashedPassword = await bcrypt.hash(mockPassword, 10);

  users.set(mockEmail, { password: hashedPassword, refreshToken: '' });
  console.log(`Mock user created: Email: ${mockEmail}, Password: ${mockPassword}`);
})();

/**
 * Login user and issue JWT
 */
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!users.has(email)) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const user = users.get(email);
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const tokens = generateTokens(res, email);
  res.json(tokens);
});

/**
 * Refresh Token Endpoint
 */
app.post('/refresh', (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token missing' });
  }

  try {
    const decoded = jwt.verify(refreshToken, SECRET);
    if (!users.has(decoded.email) || users.get(decoded.email).refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const tokens = generateTokens(res, decoded.email);
    res.json(tokens);
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

/**
 * Logout: Clear the refresh token cookie
 */
app.post('/logout', (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});

/**
 * Protected Route Example
 */
app.get('/protected', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    res.json({ message: 'Access granted', email: decoded.email });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

/**
 * Start Server
 */
app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
});
