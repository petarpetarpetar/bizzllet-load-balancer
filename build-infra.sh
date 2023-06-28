#!/bin/bash

concurrently "cd cart-service/src && nodemon app.js 3001" \
             "cd cart-service/src && nodemon app.js 3002" \
             "cd cart-service/src && nodemon app.js 3003" \
             "cd cart-service/src && nodemon app.js 3004" \
             "cd lb-service/src && nodemon loadbalancer.js"