const express = require("express");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2");
const generateToken = require("./utils");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USERNAME,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  port: +process.env.PORT,
});

let refreshTokens = [];

app.post("/refresh", (req, res) => {
  const refreshToken = req.body.token;

  if (!refreshToken || refreshToken === "") {
    return res.sendStatus(401);
  }

  if (!refreshTokens.includes(refreshToken)) {
    return res.sendStatus(401);
  }

  jwt.verify(refreshToken, process.env.TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    const accessToken = generateAccessToken({ name: user.name });
    res.status(200).json({ accessToken });
  });
});

app.get("/sign-out", (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
});

app.post("/sign-in", (req, res) => {
  const { body, session } = req;
  const { username, password } = body;
  const user = { name: body.username };

  if (username && password) {
    const results = connection.query(
      "SELECT * FROM accounts WHERE username = ? AND password = ?",
      [username, password],
      function (error, results, fields) {
        if (error) {
          throw error;
        } else {
          return results;
        }
      }
    );

    if (results.length > 0) {
      const accessToken = generateToken(user, "1m");
      const refreshToken = generateToken({}, "3m");

      session.loggedin = true;
      session.username = username;
      refreshTokens.push(refreshToken);

      res.status(200).json({ accessToken, refreshToken }).end();
      return;
    }
    res.status(401).json({ msg: "Incorrect Username and/or Password!" }).end();
    return;
  } else {
    res.status(400).json({ msg: "Please enter Username and Password!" }).end();
  }
});

app.post("/sign-up", (req, res) => {
  const { body, session } = req;
  const { id, username, password, email } = body;

  if (id && username && password && email) {
    const results = connection.query(
      "SELECT * FROM accounts WHERE username = ? AND password = ?",
      [id, username, password, email],
      function (error, results, fields) {
        if (error) {
          throw error;
        } else {
          return results;
        }
      }
    );

    if (results.length > 0) {
      session.loggedin = true;
      session.username = username;

      res.status(201).json({ msg: "success" }).end();
      return;
    } else {
      res.status(400).json({ msg: "fail" }).end();
      return;
    }
  } else {
    res.status(400).json({ msg: "Please enter Username and Password!" }).end();
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
