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
    latitude: {
        type: String,
        required: true
    },
    longitude: {
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

    username: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
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
    const { username, city, address, email, password, phone, longitude, latitude } = req.body
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
                phone,
                longitude,
                latitude

            })
            res.send('Successfully registered')
        }
        console.log(err)
    })
})

app.post('/login', async (req, res) => {
    console.log(req.body)
    const { email, password } = req.body
    User.findOne({ email: email }, async (err, user) => {
        if (user) {
            console.log(user)
            if (user.password === password) {

                res.send({ message: 'success', username: user.username, email: user.email,donor:user.donor })
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

app.post('/get-user', async (req, res) => {

    const { email } = req.body
    console.log(req.body)
    User.findOne({ email: email }, async (err, user) => {
        if (user) {
            console.log(user)
            res.send({ message: 'success', username: user.username, email: user.email, city: user.city, address: user.address, phone: user.phone, longitude: user.longitude, latitude: user.latitude, bloodgroup: user.bloodgroup ,donor:user.donor})
        }
        else {
            res.send('no data')
        }
    })
});
app.post('/donor-update', async (req, res) => {
    const { username, city, address, email, phone, longitude, latitude, bloodgroup } = req.body;
    console.log(req.body);

    const filter = { email: email };
    const options = { upsert: true };
    const updateDoc = {
        $set: {
            username: username,
            city: city,
            address: address,
            // email:email,
            phone: phone,
            longitude: longitude,
            latitude: latitude,
            bloodgroup: bloodgroup,
            donor: 'true',
        },
    };

    try {
        const result = await mongoose.connection.db.collection("users").updateOne(
            filter,
            updateDoc,
            options,
        );

        if (result.upsertedCount > 0 || result.modifiedCount > 0) {
            console.log('Update successful for', email);
            res.send('success');
        } else {
            console.log('No matching user found for', email);
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Internal Server Error');
    }


});



const adminSchema = new mongoose.Schema({
    username: {
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
    date: {
        type: Date,
        default: Date.now
    },
})

const Admin = new mongoose.model("admins", adminSchema)

app.post('/admin-login', async (req, res) => {
    console.log(req.body)
    const { email, password } = req.body
    Admin.findOne({ email: email }, async (err, user) => {
        if (user) {
            console.log(user)
            if (user.password === password) {

                res.send({ message: 'success', username: user.username, email: user.email })
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



app.post('/post', async (req, res) => {
    console.log(req.body)
    const { username, userEmail, postDescription, bloodgroup, city, phone } = req.body
    User.findOne({ email: userEmail }, async (err, user) => {
        if (user) {
            await Post.create({
                username,
                userEmail,
                postDescription,
                bloodgroup,
                city,
                phone
            })
            res.send({ message: 'success' })
        }
        else {
            res.send({ message: 'wrong' })
        }
    })


})

app.get('/get-post', async (req, res) => {
    const fatchedPost = await mongoose.connection.db.collection("posts");
    const fatchedDonors = mongoose.connection.db.collection("donors");

    try {
        const postData = await fatchedPost.find({}).toArray();
        const donorsData = await fatchedDonors.find({}).toArray();

        const length = donorsData.length;
        console.log(length);

        res.send([postData, length]);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.delete('/post-delete/:id([0-9a-fA-F]{24})', async (req, res) => {
    const id = req.params.id.trim()
    const query = { _id: new ObjectId(id) }
    const result = await mongoose.connection.db.collection("posts").deleteOne(query)
    res.send('success')
})


const donorSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    latitude: {
        type: String,
        required: true
    },
    longitude: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    bloodgroup: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
})

const Donor = new mongoose.model("donors", donorSchema)

app.post('/add-donor', async (req, res) => {
    console.log(req.body)
    const { username, city, email, phone, bloodgroup } = req.body
    Donor.findOne({ email: email }, async (err, user) => {
        if (user) {
            res.send({ message: 'User already registered' })
        }
        else {
            await Donor.create({
                username,
                bloodgroup,
                city,
                email,
                phone
            })
            res.send('Successfully registered')
        }
        console.log(err)
    })
})

app.get('/get-donor', async (req, res) => {
    try {
        const donors = await mongoose.connection.db.collection("users").find({ donor: 'true' }).toArray();
        res.send(donors);
    } catch (error) {
        console.error('Error fetching donor data:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/get-donor-loc', async (req, res) => {
    try {
        const donors = await mongoose.connection.db.collection("users").find({ donor: 'true' }).toArray();
        res.send(donors);
    } catch (error) {
        console.error('Error fetching donor data:', error);
        res.status(500).send('Internal Server Error');
    }
});



app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})