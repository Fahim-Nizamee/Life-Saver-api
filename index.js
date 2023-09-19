const express = require("express")
const cors = require("cors")
const app = express()
const port = 5000
const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId

mongoose.set('strictQuery', true)
app.use(cors())
app.use(express.json())

const mongoURI = 'mongodb+srv://fahim1:fahim1@cluster0.sosmzzm.mongodb.net/Life-Saver?retryWrites=true&w=majority';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, () => {
    console.log("=== DB successfully Connected ===")
})

app.get('/', (req, res) => {
    res.send('Yooooooooooooo')
})

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    bloodgroup: {
        type: String,
    },
    city: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    donor: {
      type: String,
    },
    date: {
        type: Date,
        default: Date.now
    },
})

const User = new mongoose.model("users", userSchema)

const postSchema = new mongoose.Schema({

    userEmail: {
        type: String,
    },
    postDescription: {
        type: String,
        required: true
    },
    postDate: {
        type: Date,
        default: Date.now
    },
    bloodgroup: {
        type: String,
        require: true
    },
    city: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    }
})

const Post = new mongoose.model("posts", postSchema)




app.post('/signup', async (req, res) => {
    console.log(req.body)
    const { username, city, address, email, password, phone } = req.body
    const bloodgroup = "null"
    const donor = "false"
    User.findOne({ email: email }, async (err, user) => {
        if (user) {
            res.send({ message: 'User already registered' })
        }
        else {
            await User.create({
                username,
                bloodgroup,
                donor,
                city,
                address,
                email,
                password,
                phone
            })
            res.send('Successfully registered')
        }
    })
})

app.post('/login', async (req, res) => {
    console.log(req.body)
    const { email, password } = req.body
    User.findOne({ email: email }, async (err, user) => {
        if (user) {
            console.log(user)
            if (user.password === password) {
                
                res.send({ message: 'success', username: user.username })
            }
            else {
                res.send('wrong pass')
            }
        }
        else {
            res.send('wrong mail')
        }
    })

})

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})