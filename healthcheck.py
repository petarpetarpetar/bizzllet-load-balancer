import requests
urls = [
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
    "http://127.0.0.1:3003",
    "http://127.0.0.1:3004"
]

for url in urls:
    try:
        r = requests.get(f"{url}/healthcheck")
        if r.status_code == 200:
            alive = r.json()['healthy']
            print(f"[ALIVE] @ {url}")
        else:
            print(f"[.DEAD] @ {url}")
    except Exception as e:
        print(e)