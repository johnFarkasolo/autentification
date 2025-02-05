require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
app.use(cors({origin: process.env.CLIENT_ORIGIN, credentials: true}));
app.use(express.json());

const PORT = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET;

if(!SECRET) {
	throw new Error("Missing JWT_SECRET in .env file");
}

// In-memory storage (for now)
const users = new Map();

/**
 * Generate tokens
 */
function generateTokens(email) {
  const accessToken = jwt.sign({ email }, SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ email }, SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

/**
 * Preload a mock user for testing
 */
(async function createMockUser() {
  const mockEmail = "test@example.com";
  const mockPassword = "W!1234565f";
  const hashedPassword = await bcrypt.hash(mockPassword, 10);

  users.set(mockEmail, { password: hashedPassword, refreshToken: '' });
  console.log(`Mock user created: Email: ${mockEmail}, Password: ${mockPassword}`);
})();

/**
 * Register a new user (for testing purposes)
 */
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  if (users.has(email)) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.set(email, { password: hashedPassword, refreshToken: '' });

  return res.json({ message: 'User registered successfully' });
});

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

  const { accessToken, refreshToken } = generateTokens(email);
  users.set(email, { ...user, refreshToken }); // Store refresh token

  res.json({ accessToken, refreshToken });
});

/**
 * Refresh Token Endpoint
 */

app.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, SECRET);
    if (!users.has(decoded.email) || users.get(decoded.email).refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.email);
    users.set(decoded.email, { ...users.get(decoded.email), refreshToken: newRefreshToken });

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

/**
 * Logout and remove refresh token
 */
app.post('/logout', (req, res) => {
  const { email } = req.body;
  if (!users.has(email)) {
    return res.status(400).json({ message: 'Invalid user' });
  }

  users.set(email, { ...users.get(email), refreshToken: '' });
  res.json({ message: 'Logged out successfully' });
});

/**
 * Global error handler middleware
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong' });
});

/**
 * Start Server
 */
app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
});
