require("dotenv").config();
const express = require("express");

const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173", // Only allow requests from this domain
  })
);
app.use(express.json());

const uri = "mongodb://localhost:27017";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const mongodbRun = async () => {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    // Example: Access a database and collection
    const db = client.db("RestaurantDatabase");
    const FoodDataCollection = db.collection("FoodData");

    app.get("/foodData", async (req, res) => {
      const { id } = req.query;
      const query = {};
      if (id) {
        query._id = new ObjectId(id);
      }
      console.log(query);
      result = await FoodDataCollection.findOne(query);

      res.status(200).send(result);
    });

    app.get("/total_food_data", async (req, res) => {
      const totalData = await FoodDataCollection.countDocuments();
      const result = { totalData };
      res.status(200).send(result);
    });

    app.post("/onlyPrice", async (req, res) => {
      console.log(1);
      const dataCard = req.body;
      // const dataCard = [
      //   { id: "673235274926400fd5f923f4", quantity: 5 },
      //   { id: "673235274926400fd5f923e2", quantity: 2 },
      //   { id: "673235274926400fd5f923e8", quantity: 1 },
      //   { id: "673235274926400fd5f923ca", quantity: 1 },
      //   { id: "673235274926400fd5f923ee", quantity: 1 },
      // ];
      // [ { id: '673235274926400fd5f923f4', quantity: 4 } ]
      const ids = await dataCard.map((e) => e.id);

      const queryIds = ids.map((e) => new ObjectId(e));
      const query = { _id: { $in: queryIds } };
      const option = {projection:{_id:0,price:1}};
      const data = await FoodDataCollection.find(query,option);
      const result = await data.toArray();
      res.status(200).send(result);
      // console.log(dataCard);
    });

    // {
    //     "_id": {
    //       "$oid": "673235274926400fd5f923c5"
    //     },
    //     "name": "Grilled Chicken Caesar Salad",
    //     "description": "A delicious Caesar salad topped with grilled chicken breast, Parmesan cheese, croutons, and our homemade Caesar dressing.",
    //     "price": 12.99,
    //     "category": "Salads",
    //     "ingredients": [
    //       "Grilled chicken breast",
    //       "Romaine lettuce",
    //       "Parmesan cheese",
    //       "Croutons",
    //       "Caesar dressing"
    //     ],
    //     "image": {
    //       "1:1": "https://www.foodiesfeed.com/wp-content/uploads/2023/06/burger-with-melted-cheese.jpg",
    //       "16:9": "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1080"
    //     },
    //     "available": true,
    //     "rating": 4.5,
    //     "cookingTime": 15,
    //     "reviews": [
    //       {
    //         "user": "user123",
    //         "rating": 5,
    //         "comment": "Absolutely loved this salad! Fresh and flavorful.",
    //         "date": "2024-11-11",
    //         "time": "12:30 PM",
    //         "photoURL": "https://pics.craiyon.com/2023-10-25/b65f72d6d11a48c1bc560059cc36e31f.webp",
    //         "useremail": "user123@example.com"
    //       },
    //       {
    //         "user": "user456",
    //         "rating": 4,
    //         "comment": "Very tasty but could use a bit more dressing.",
    //         "date": "2024-11-10",
    //         "time": "6:45 PM",
    //         "photoURL": "https://pics.craiyon.com/2023-10-25/b65f72d6d11a48c1bc560059cc36e31f.webp",
    //         "useremail": "user456@example.com"
    //       }
    //     ]
    //   }

    app.get("/food_data_random", async (req, res) => {
      const {
        name = 1,
        needData = 6,
        description = 1,
        price = 1,
        category,
        ingredients,
        image = 1,
        rating = 1,
        cookingTime = 1,
        reviews,
      } = req.query;
      const projection = {};
      if (name) projection.name = 1;
      if (description) projection.description = 1;
      if (price) projection.price = 1;
      if (category) projection.category = 1;
      if (ingredients) projection.ingredients = 1;
      if (image) projection.image = 1;
      if (rating) projection.rating = 1;
      if (cookingTime) projection.cookingTime = 1;
      if (reviews) projection.reviews = 1;
      if (Object.keys(projection).length === 0) {
        return res
          .status(400)
          .send("Please provide at least one property to retrieve.");
      }

      const randomData = await FoodDataCollection.aggregate([
        { $sample: { size: Math.ceil(needData) } },
        {
          $project: projection,
        },
      ]).toArray();
      res.status(200).send(randomData);
    });

    app.get("/food_data_top_sell", async (req, res) => {
      const {
        name = 1,
        needData = 6,
        description = 1,
        price = 1,
        category,
        ingredients,
        image = 1,
        rating = 1,
        cookingTime = 1,
        reviews,
      } = req.query;

      // Create a projection object based on query parameters
      const projection = {};
      if (name) projection.name = 1;
      if (description) projection.description = 1;
      if (price) projection.price = 1;
      if (category) projection.category = 1;
      if (ingredients) projection.ingredients = 1;
      if (image) projection.image = 1;
      if (rating) projection.rating = 1;
      if (cookingTime) projection.cookingTime = 1;
      if (reviews) projection.reviews = 1;

      if (Object.keys(projection).length === 0) {
        return res
          .status(400)
          .send("Please provide at least one property to retrieve.");
      }

      console.log(projection);

      const randomData = await FoodDataCollection.aggregate([
        { $sort: { rating: -1 } },

        { $limit: parseInt(needData, 10) },

        { $project: projection },
      ]).toArray();

      res.status(200).send(randomData);
    });
    app.get("/food_filter_option/:option", async (req, res) => {
      const option = req.params.option;

      const filterArray = await FoodDataCollection.aggregate([
        { $group: { _id: `$${option}` } },
        { $project: { value: "$_id" } },
        { $sort: { value: 1 } },
      ]).toArray();

      const values = filterArray.map((item) => item.value);

      res.status(200).json({ filterArray: values });
    });
    app.get("/max_min_price_food", async (req, res) => {
      const maxPriceFood = await FoodDataCollection.aggregate([
        {
          $group: {
            _id: null,
            maxPrice: { $max: "$price" },
          },
        },
      ]).toArray();
      const minPriceFood = await FoodDataCollection.aggregate([
        {
          $group: {
            _id: null,
            minPrice: { $min: "$price" },
          },
        },
      ]).toArray();

      const result = {
        max: maxPriceFood[0].maxPrice,
        min: minPriceFood[0].minPrice,
      };

      res.status(200).send(result);
    });
    app.get("/cooking_time_food", async (req, res) => {
      const maxCookingTime = await FoodDataCollection.aggregate([
        {
          $group: {
            _id: null,
            maxCookingTime: { $max: "$cookingTime" },
          },
        },
      ]).toArray();
      const minCookingTime = await FoodDataCollection.aggregate([
        {
          $group: {
            _id: null,
            minCookingTime: { $min: "$cookingTime" },
          },
        },
      ]).toArray();

      const result = {
        max: maxCookingTime[0].maxCookingTime,
        min: minCookingTime[0].minCookingTime,
      };

      res.status(200).send(result);
    });

    app.post("/data_filter", async (req, res) => {
      const filter = req.body;

      const query = {};

      if (filter.Category && filter.Category !== "default") {
        query.category = filter.Category;
      }

      if (filter.minPrice || filter.maxPrice) {
        query.price = {};
        if (filter.minPrice) {
          query.price.$gte = parseFloat(filter.minPrice);
        }
        if (filter.maxPrice) {
          query.price.$lte = parseFloat(filter.maxPrice);
        }
      }

      if (filter.minCookingTime || filter.maxCookingTime) {
        query.cookingTime = {};
        if (filter.minCookingTime) {
          query.cookingTime.$gte = parseInt(filter.minCookingTime);
        }
        if (filter.maxCookingTime) {
          query.cookingTime.$lte = parseInt(filter.maxCookingTime);
        }
      }

      if (filter.rating > 0) {
        query.rating = { $gte: parseFloat(filter.rating) };
      }

      const filterConfig = [
        { $match: query },
        { $sort: { [filter.SortBy]: filter.Order === "asc" ? 1 : -1 } },
        { $skip: (filter.selectedPage - 1) * filter.perPage },
        { $limit: filter.perPage },
      ];

      const count = await FoodDataCollection.countDocuments(query);
      const results = await FoodDataCollection.aggregate(
        filterConfig
      ).toArray();

      console.log(filter);
      console.log(filter.rating, query.rating, count);

      res.status(200).json({ results, count });
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);

    const restartTime = 1000;
    console.log(`Attempting to reconnect in ${restartTime / 60000} minutes`);

    setTimeout(mongodbRun, restartTime);
  } finally {
  }
};
mongodbRun().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
