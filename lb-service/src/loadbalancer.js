const net = require("net");
const http = require("http");
const url = require("url");

require("dotenv").config();

const serviceUrls = process.env.SERVICE_URLS.split(" ");
const serviceWeights = process.env.SERVICE_WEIGHTS.split(" ").map(Number);
const port = process.env.PORT;

let currentServiceIndex = 0;

const totalWeight = serviceWeights.reduce((total, weight) => total + weight, 0);

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const requestData = data.toString().split("\r\n");
    const nextServiceIndex = getNextServiceIndex();
    const requestLine = requestData[0].split(" ");
    const method = requestLine[0];
    const path = requestLine[1];
    const body = requestData.slice(requestData.length - 1).join("\r\n");

    forwardRequest(serviceUrls[nextServiceIndex], method, path, body, socket);
  });
});

// Function to determine the next service index based on the weighted round-robin algorithm
function getNextServiceIndex() {
  let selectedServiceIndex = currentServiceIndex;

  do {
    selectedServiceIndex = (selectedServiceIndex + 1) % serviceUrls.length;
  } while (Math.random() * totalWeight >= serviceWeights[selectedServiceIndex]);

  currentServiceIndex = selectedServiceIndex;
  return selectedServiceIndex;
}

// Function to forward the HTTP request to the selected service
function forwardRequest(urlStr, method, path, body, socket) {
  const parsedUrl = new URL(urlStr);
  const hostname = parsedUrl.hostname;
  const port = parsedUrl.port || 80;
  console.log(`---forwarding to`);
  console.log(`${method} ${hostname}:${port}${path} `);
  console.log(`${body}`);

  const headers = {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
    Connection: "close", // Force HTTP/1.1 behavior
  };
  let requestString = `${method} ${path} HTTP/1.1\r\n`;
  Object.keys(headers).forEach((header) => {
    requestString += `${header}: ${headers[header]}\r\n`;
  });
  requestString += "\r\n" + body;

  const socketOptions = {
    host: hostname,
    port: port,
  };

  const clientSocket = net.createConnection(socketOptions, () => {
    clientSocket.write(requestString);
  });

  let responseData = "";

  clientSocket.setEncoding("utf8");

  clientSocket.on("data", (chunk) => {
    responseData += chunk;
  });

  clientSocket.on("end", () => {
    console.log(responseData);
    const responseHeaders = `HTTP/1.1 200 OK\r\nContent-Length: ${responseData.length}\r\n\r\n`;
    socket.write(responseHeaders + responseData);
    socket.end();
  });

  clientSocket.on("error", (error) => {
    console.error(`Error forwarding request to ${urlStr}: ${error.message}`);
    socket.end();
  });
}

// Start the Load balancer
server.listen(port, () => {
  console.log(`Load balancer listening on port ${port}`);
});
