const express = require('express')
const app = express()
const port = 3000

require('dotenv').config()

const jwt = require('jsonwebtoken')


app.use(express.json())

const mysql = require('mysql2');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const { nextTick } = require('process')

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mojang0704',
  database: 'myapp'
});

const posts = [
  {
    username : 'test1',
    title : 'Post 1'
  },
  {
    username : 'test2',
    title : 'Post 2'
  }
]



app.get('/posts', authenticateToken, (req, res) => {
    res.json(posts.filter(post => post.username === req.user.name))
})

app.post('/signin', (req, res) => {
  const { body } = req;
  const { username } = body;

  const user = { name : username }

  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
  res.json({ accessToken : accessToken })

})

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

app.get('/', (req, res) => {

  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})