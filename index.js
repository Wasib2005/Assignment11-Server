require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = "mongodb://localhost:27017"; // updated URI

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const mongodbRun = async () => {
    try {
        await client.connect();
        console.log("Connected to MongoDB!");

        // Example: Access a database and collection
        const db = client.db("RestaurantDatabase");
        const FoodDataCollection = db.collection("FoodData");

        // Example operation: Fetch documents
        const documents = await FoodDataCollection.find().limit(6).toArray();
        console.log("Documents:", documents);

    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
    } finally {
        
    }
};

mongodbRun().catch(console.dir);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
