#!/bin/bash

concurrently "cd cart-service && nodemon app.js 3001" \
             "cd cart-service && nodemon app.js 3002" \
             "cd cart-service && nodemon app.js 3003" \
             "cd cart-service && nodemon app.js 3004" \
             "cd lb-service && nodemon loadbalancer.js"