require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Middle ware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f1wcz6a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // DB Collections
        const tipsCollection = client.db("GreenNest").collection("all-tips");

        // Api for tips
        app.get('/tips', async (req, res) => {
            const email = req.query.email;
            const query = {};

            if(email){
                query.userEmail = email
            }

            const result = await tipsCollection.find(query).toArray();
            res.send(result);
        })
        app.get('/tips/:id', async (req, res) => {
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)}
            const result = await tipsCollection.findOne(filter)
            res.send(result)
        })
        app.post('/tips', async (req, res) => {
            const newTips = req.body;
            const result = await tipsCollection.insertOne(newTips);
            res.send(result)
        })
        app.put('/tips/:id', async (req, res) => {
            const id = req.params.id;
            const updatedTips = req.body;
            const filter = {_id: new ObjectId(id)}
            const updateDoc = {
                $set: updatedTips
            }
            const result = await tipsCollection.updateOne(filter, updateDoc)
            res.send(result)
        })
        app.patch('/tips/:id', async ( req, res) => {
            const id = req.params.id;
            const {email} = req.body;
            const filter = {_id: new ObjectId(id)}
            const updateDoc = {
                $inc: {totalLikes: 1},
                $addToSet: {likedBy: email }
            }
            const result = await tipsCollection.updateOne(filter, updateDoc)
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('GreenNest Server Is Running')
})

app.listen(port, () => {
    console.log(`GreenNest Server Is Running On Port ${port}`)
})