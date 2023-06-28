const express = require("express");
const bodyParser = require("body-parser");
const redis = require("redis");

console.log("change");
function connectToRedis() {
  const redisClient = redis.createClient({
    socket: {
      host: "redis",
      port: "6379",
    },
  });

  redisClient.on("error", (error) => {
    console.error("Error connecting to Redis:", error);

    setTimeout(connectToRedis, 500);
  });

  redisClient.on("connect", () => {
    console.log("Connected to Redis");
  });

  // Perform your Redis operations using the `redisClient` instance

  return redisClient;
}

// Call the function to establish the initial connection
const redisClient = connectToRedis();

console.log("App run");
const port = 3000; //Number(process.argv.slice(2)[0]);

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
  var found = false;

  cart.forEach((item) => {
    if (item.id === product.id) {
      item.quantity += 1;
      found = true;
    }
  });

  if (!found) {
    product.quantity = 1;
    cart.push(product);
  }

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
app.delete("/cart/:productId", async (req, res) => {
  const delete_id = req.params.productId;
  console.log(`[DELETE] /cart/${delete_id}`);
  console.log(delete_id);
  const cartData = await redisClient.get("cart", (error, cartData) => {
    if (error) {
      console.error("Error retrieving cart data from Redis:", error);
      return res.status(500).json({ error: "Internal server error" });
    }

    return cartData;
  });

  cart = JSON.parse(cartData);
  const updatedCart = cart.filter((item) => item.id != delete_id);

  cart = updatedCart;

  redisClient.set("cart", JSON.stringify(cart), (error) => {
    if (error) {
      console.error("Error storing cart data in Redis:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  res.json({ message: `Successfuly deleted product with id ${delete_id}` });
});

app.put("/cart/:productId/:newQuantity", async (req, res) => {
  const productId = req.params.productId;
  const newQuantity = Number(req.params.newQuantity);
  console.log(`[PUT] /cart/${productId}/${newQuantity}`);

  const cartData = await redisClient.get("cart", (error, cartData) => {
    if (error) {
      console.error("Error retrieving cart data from Redis:", error);
      return res.status(500).json({ error: "Internal server error" });
    }

    return cartData;
  });

  cart = JSON.parse(cartData);
  cart.forEach((item) => {
    if (item.id == productId) item.quantity = newQuantity;
  });

  redisClient.set("cart", JSON.stringify(cart), (error) => {
    if (error) {
      console.error("Error storing cart data in Redis:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  res.json({
    message: `Successfuly updated product with id ${productId} to quantity: ${newQuantity}`,
  });
});
// Start the server

app.get("/healthcheck", (req, res) => {
  res.json({ healthy: port });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
