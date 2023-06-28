# bizzllet-load-balancer


## Setup and run
clone the repo and cd into it.
Since eveything is dockerized a simplee
```
docker-compose build
```
and then
```
docker-compose up
```
will start the app. 

Alternatively, a small change inside .env files is required to run the app without docker.

`build-infra.sh` and `healthcheck.py` were used in early stages of development.
I prefer using Insomnia over Postman for API testing so there's `insomnia-collection.yaml` containing tests.

## Known issues
Only one user is supported, I haven't had time to implement it's 
