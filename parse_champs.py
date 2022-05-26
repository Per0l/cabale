import json
import requests

res = requests.get("http://ddragon.leagueoflegends.com/cdn/12.6.1/data/en_US/champion.json")

data = res.json()

res = {}
for champ in data["data"]:
	res[data["data"][champ]["key"]] = champ

res["0"] = "None"

with open("champids.json", "w") as f:
	json.dump(res, f)
