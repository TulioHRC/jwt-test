const dotenv = require('dotenv');
const express = require('express');
const jwt = require('jsonwebtoken');

dotenv.config();
const PORT = process.env.PORT || 3000;

const tests = [
  {
    username: "oilut",
    title: "TESTE"
  },
  {
    username: "oilut2",
    title: "TESTE2"
  }
];

const app = express();

app.use(express.json());

function authenticateToken(req, res, next) {
  const auth = req.headers["authorization"];
  const token = auth && auth.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.get('/test', authenticateToken, (req, res) => {
  console.log('oi')
  //return res.status(200).json(req.user);
  return res.status(200).json(tests.filter(test => test.username === req.user.name));
})

app.post('/login', (req, res) => {
  const username = req.body.username;

  const accessToken = jwt.sign({ name: username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10s' });
  const refreshToken = jwt.sign({ name: username }, process.env.REFRESH_TOKEN_SECRET);
  refreshTokens.push(refreshToken);

  res.status(200).json({
    token: accessToken,
    refreshToken: refreshToken
  })
})

let refreshTokens = [];

app.post('/refresh-token', (req, res) => {
  const refreshToken = req.body.token; // In production it'll need a DB to store its values
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = jwt.sign({ name: user.name }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' });

    res.status(200).json({
      token: accessToken
    })
  })
})

app.get('/verify-auth', (req, res) => {
  authenticateToken(req, res);
})

app.listen(PORT, () => {
  console.log("Running on PORT " + PORT);
})