from bs4 import BeautifulSoup
import requests, json

r = requests.get("https://u.gg/lol/top-lane-tier-list?rank=gold&region=euw1")
html_doc = r.text

soup = BeautifulSoup(html_doc, 'html.parser')
data = soup.find(id="reactn-preloaded-state").contents[0]

keyword_s = "window.__SSR_DATA__ = "
keyword_e = "\n                window.__APOLLO_STATE__ = {}"
data = json.loads(data[data.find(keyword_s)+len(keyword_s):data.find(keyword_e)])
data = data[list(data.keys())[-1]]["data"]


""" t = []
for c in data["win_rates"]["all"]:
	if c["champion_id"] == "86":
		print(c["role"], c["tier"]) """

