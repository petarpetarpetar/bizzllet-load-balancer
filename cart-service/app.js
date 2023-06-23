const express = require("express");
const bodyParser = require("body-parser");
const redis = require("redis");

const redisClient = redis.createClient();

const port = Number(process.argv.slice(2)[0]);

redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient
  .connect()
  .then(() => {
    console.log("Connected to Redis");
    redisClient.set("name", "petar");
  })
  .catch((err) => {
    console.log(err.message);
  });

const app = express();
app.use(bodyParser.json());

// Get all products from user's cart
app.get("/cart", async (req, res) => {
  console.log(`[GET] /cart`);

  const cartData = await redisClient.get("cart", (error, cartData) => {
    if (error) {
      console.error("Error retrieving cart data from Redis:", error);
      return res.status(500).json({ error: "Internal server error" });
    }

    return cartData;
  });

  res.json({ cart: JSON.parse(cartData || "[]") });
});

// Add product to user's cart
app.post("/cart", async (req, res) => {
  console.log("[POST] /cart");

  const product = req.body;
  product["_processed_by"] = `app @ ${port}`;

  const cartData = await redisClient.get("cart", (error, cartData) => {
    if (error) {
      console.error("Error retrieving cart data from Redis:", error);
      return res.status(500).json({ error: "Internal server error" });
    }

    return cartData;
  });

  const cart = JSON.parse(cartData || "[]");
  cart.push(product);

  // Store the updated cart data in Redis
  redisClient.set("cart", JSON.stringify(cart), (error) => {
    if (error) {
      console.error("Error storing cart data in Redis:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  res.json({ message: "Product added to cart" });
});

// Resets user's cart
app.delete("/cart", async (req, res) => {
  console.log("[DELETE] /cart");

  redisClient.set("cart", JSON.stringify([]), (error) => {
    if (error) {
      console.error("Error storing cart data in Redis:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  res.json({ message: "Cart is reset" });
});

// Start the server

app.get("/healthcheck", (req, res) => {
  res.json({ healthy: port });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
