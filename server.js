const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const User = require('./model/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


//jwt secret key
const JWT_SECRET = 'asdfasdf@r334ojdhsf34934kjsd000hjahei'


// monogoDB atlas
mongoose.connect("mongodb+srv://ankit-awasthi:ankit123@cluster0.xdv5c.mongodb.net/Cluster0?retryWrites=true&w=majority", () => {
    console.log("database is connected")
});

const app = express()
app.use('/', express.static(path.join(__dirname, "static")))
app.use(bodyParser.json())


//Registration 
app.post('/api/register', async(req, res) => {
    const { username, password: plainTextPassword } = req.body

    if (!plainTextPassword || typeof plainTextPassword !== 'string') {
        return res.json({ status: 'error', error: 'Invalid password' })
    }


    if (!username || typeof username !== 'string') {
        return res.json({ status: 'error', error: 'Invalid username' })
    }

    if (plainTextPassword.length < 5) {
        return res.json({
            status: 'error',
            error: 'small pass'
        })
    }

    const password = await bcrypt.hash(plainTextPassword, 10)

    try {

        const response = await User.create({
            username,
            password
        })
        console.log('User created: ', response)
    } catch (error) {
        if (error.code === 11000) {

            return res.json({ status: 'error', error: 'invalid username' })
        }
        throw error
    }

    res.json({ status: 'ok' })
})


//implementing jwt for auth
app.post('/api/login', async(req, res) => {
    const { username, password } = req.body
    const user = await User.findOne({ username }).lean()

    if (!user) {
        return res.json({ status: 'error', error: 'Invalid username/password' })
    }

    if (await bcrypt.compare(password, user.password)) {

        const token = jwt.sign({
                id: user._id,
                username: user.username
            },
            JWT_SECRET
        )

        return res.json({ status: 'ok', data: token })
    }

    res.json({ status: 'error', error: 'Invalid entry' })
})



app.listen(5000, () => {
    console.log('Server started')
})