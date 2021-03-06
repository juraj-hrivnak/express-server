const express = require('express')
const expressSession = require('express-session')
const bodyParser = require('body-parser')

const signup = require('./signup')
const login = require('./login')
const {knex} = require('./db-connection')

const saveMessage = (userId, message) =>
  knex('messages')
    .insert({
      text: message.replace(/</g, '&lt;').replace(/>/g, '&gt;'),
      user_id: userId,
    })

const app = express()

app.use(bodyParser.urlencoded({extended: true}))
app.use(expressSession({
  secret: 'cotirube',
}))

app.all('/signup', signup)
app.get('/login', login.loginFormRender)
app.post('/login', login.loginFormSubmit)
app.get('/logout', login.renderLogout)

app.get('/', (req, res) => {
  if (req.session.user) {
    res.send(`
            <h1>${req.session.user.name} Vitaj!</h1>
            <a href="/logout" >odhlas sa</a>
        `)
  } else {
    res.send(`
            <h1>Nazdar neni si prihlaseny!/prihlasena!</h1>
            <a href="/login" >Prihlas sa</a>
            <div>alebo sa</div>
            <a href="/signup">zaregistruj</a>.
        `)
  }
})


app.post('/', (req, res) => {
  knex('users')
    .where({name: req.body.userName})
    .first()
    .then(user => {
      if (!user) {
        knex('users')
          .insert({name: req.body.userName})
          .then(id => { saveMessage(id, req.body.message)})
          .then(() => { res.redirect(302, '/')})
      } else
        saveMessage(user.id, req.body.message)
          .then(() => res.redirect(302, '/'))
    })
})

app.listen(8080, '0.0.0.0') 
console.log('listeing on http://localhost:8080')
