const { MongoClient } = require('mongodb');

// MongoDB connection URI
const uri = "mongodb+srv://sid:8156@sidcluster.fwysycx.mongodb.net/?retryWrites=true&w=majority";

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb && cachedClient) {
        return { client: cachedClient, db: cachedDb };
    }

    const client = await MongoClient.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    const db = client.db('user_data');

    cachedClient = client;
    cachedDb = db;

    return { client, db };
}

module.exports = { connectToDatabase };
