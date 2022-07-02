const express = require('express')
const app = express()
const port = 3000

require('dotenv').config()

const jwt = require('jsonwebtoken')


app.use(express.json())

const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mojang0704',
    database: 'myapp'
  });

let refreshTokens = []

app.post('/token', (req, res) => {
    const refreshToken = req.body.token
    if (refreshToken == null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        const accessToken = generateAccessToken({ name : user.name})
        res.json({accessToken:accessToken})
    })
})

app.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter( token => token !== req.body.token)
    res.sendStatus(204)
})


app.post('/signin', (req, res) => {
  const { body } = req;
  const { username, password } = body;

  const user = { name : username }

  if (username && password) {
		
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
		
			if (error) throw error;
			
			if (results.length > 0) {
			
				request.session.loggedin = true;
				request.session.username = username;
				
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}

  const accessToken = generateAccessToken(user)
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
  refreshTokens.push(refreshToken)
  res.json({ accessToken : accessToken, refreshToken : refreshToken })

})

app.post('/signup', (req, res) => {
  const { body } = req;
  const { id, username, password, email} = body;


  if (id && username && password && email) {
		
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [id, username, password, email], function(error, results, fields) {
		
			if (error) throw error;
			
			if (results.length > 0) {
			
				request.session.loggedin = true;
				request.session.username = username;
				
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}

})



function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' })
}

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })