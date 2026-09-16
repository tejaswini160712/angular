const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let currentUser = null;

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Server is running' });
});

app.post('/api/signin', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required.',
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters.',
    });
  }

  currentUser = {
    email,
    name: email.split('@')[0],
    loggedInAt: new Date().toISOString(),
  };

  return res.status(200).json({
    success: true,
    message: 'Sign in successful.',
    user: currentUser,
  });
});

app.get('/api/user', (req, res) => {
  if (!currentUser) {
    return res.status(404).json({ success: false, message: 'No user signed in.' });
  }

  return res.status(200).json({ success: true, user: currentUser });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
