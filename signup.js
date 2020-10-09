const {knex} = require("./db-connection")

const PASSWORD_MISSMATCH_MESSAGE = "Passwords don't match!"
const PASSWORD_TOO_SHORT_MESSAGE = "Password is too short! Must be 8 or more characters."
const USER_EXISTS_ERROR_MESSAGE = "This username already exists!"

const renderLoginForm = (errors = []) => `
<h1>Sign Up</h1>
<form method="post" style="display: flex; flex-direction: column" >
    <input type="text" placeholder="Username" name="username" />
    <input type="password" placeholder="Password" name="password" />
    <input type="password" placeholder="Repeat password" name="passwordCheck" />
    <input type="submit" value="Create acount!" />
    <ul style="color: red">
        ${errors.map(error => `<li>${error}</li>`).join("")}
    </ul>
</form>
`
module.exports = (req, res) => {
    if (req.method === "POST") {
        const errors = []
        if (req.body.password !== req.body.passwordCheck) {
            errors.push(PASSWORD_MISSMATCH_MESSAGE)
        }
        if (req.body.password.length < 8) {
            errors.push(PASSWORD_TOO_SHORT_MESSAGE)
        }

        knex("users")
            .where({name: req.body.username})
            .first()
            .then(user => {
                if (user) {
                    errors.push(USER_EXISTS_ERROR_MESSAGE)
                }
                if (errors.length) {
                    res.send(renderLoginForm(errors))
                } else {
                    gensalt(16)
                        .then(salt => {

                            const saltString = salt.toString('hex')
                            knex("users")
                                .insert({
                                    name: req.body.username,
                                    salt: saltString,
                                    password_hash: sha256(req.body.password + saltString),
                                })
                                .then(id => res.redirect(302, "/"))
                        })
                    
                }
            })

    } else {
        console.log("necakam")
        res.send(renderLoginForm())
    }
}