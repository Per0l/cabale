var port, password, URL_LOL, champids, URL_DRAGON, tierlist

var loading = 0
var to_load = 0

function json_get(url)
{
	var request = new XMLHttpRequest();
	request.open("GET", url, false);
	request.send(null);
	if (request.status === 200) {
		return JSON.parse(request.responseText)
	} else
		return null;
}

function ugg_parse()
{
	var request = new XMLHttpRequest();
	request.open("GET", "https://u.gg/lol/top-lane-tier-list?rank=gold&region=euw1", false);
	request.send(null);
	if (request.status === 200) {
		var data = request.responseText
		var keyword_s = "window.__SSR_DATA__ = "
		var keyword_e = "\n                window.__APOLLO_STATE__ = {}"
		data = JSON.parse(data.slice(data.search(keyword_s) + keyword_s.length, data.search(keyword_e)))
		return data[Object.keys(data)[Object.keys(data).length - 1]]["data"]
	} else
		return null;
}

function init()
{
	URL_DRAGON = "https://ddragon.leagueoflegends.com/cdn/"+json_get("https://ddragon.leagueoflegends.com/api/versions.json")[0]
	tierlist = ugg_parse()

	to_load += 2
	window.ipcRenderer.on('render-lockfile', (arg) => {
		var data = arg.split(":")
	
		port = data[2]
		password = data[3]
		URL_LOL = "https://riot:"+password+"@127.0.0.1:"+port
		loading++
	})
	window.ipcRenderer.send('main-lockfile', 'get-lockfile')

	window.ipcRenderer.on('render-champion_ids', (arg) => {
		champids = JSON.parse(arg)
		loading++
	})
	window.ipcRenderer.send('main-champion_ids', 'get-champion_ids')
}

document.addEventListener("DOMContentLoaded", function(){
    init()
	main()
});

function call_lol(endpoint, method="GET")
{
    var request = new XMLHttpRequest();
	request.open(method, URL_LOL + endpoint, false);  // `false` makes the request synchronous
	request.send(null);

	console.log(method, endpoint, request.status)
	if (request.status === 200) {
		return (request.responseText);
	} else
		return null;
}

function call_ddragon(endpoint, method="GET")
{
    var request = new XMLHttpRequest();
	request.open(method, URL_DRAGON + endpoint, false);  // `false` makes the request synchronous
	request.send(null);

	console.log(method, endpoint, request.status)
	if (request.status === 200) {
		return (request.responseText);
	} else
		return null;
}

function getLuTier(stdevs)
{
	if (stdevs >= 2) {
		return "S+";
	} else if (stdevs >= 0.75) {
		return "S";
	} else if (stdevs >= 0) {
		return "A";
	} else if (stdevs >= -0.5) {
		return "B";
	} else if (stdevs >= -0.75) {
		return "C";
	} else {
		return "D";
	}
}

function getLuTierColorHex(stdevs)
{
	if (stdevs >= 2) {
		return "#FF9B00";
	} else if (stdevs >= 0.75) {
		return "#3273FA";
	} else if (stdevs >= 0) {
		return "#7EA4F4";
	} else if (stdevs >= -0.5) {
		return "#FFFFFF";
	} else if (stdevs >= -0.75) {
		return "#FCB1B2";
	} else {
		return "#FF4E50";
	}
}

function get_tier(id)
{
	var stdev_arr = {}
	tierlist["win_rates"]["all"].forEach(obj => {
		if (obj["champion_id"] == id)
			stdev_arr[parseFloat(obj["tier"]["stdevs"]).toFixed(4)] = [obj["role"], parseFloat(obj["win_rate"]).toFixed(2)]
	})
	//var max_stdev = Math.max.apply(null, Object.keys(stdev_arr))
	var res = "| "
	var stdev_sorted = {}
	Object.keys(stdev_arr).sort(function(a,b) { return b - a;}).forEach(n => {
		stdev_sorted[n] = stdev_arr[n]
	})
	Object.keys(stdev_sorted).forEach(n => {
		res += stdev_arr[n][0].charAt(0).toUpperCase() + stdev_arr[n][0].slice(1) + " : " + getLuTier(n) + " " + stdev_arr[n][1] + "% | "
	})
	return res
}

async function main()
{
	var loop = true
	var time_sleep = 1000
	while (loop)
	{
		await new Promise(r => setTimeout(r, time_sleep));
		if (loading < 2)
			continue

		var res = call_lol("/lol-champ-select/v1/session")
		 
		if (res)
		{
			time_sleep = 1000
			var data = JSON.parse(res)
			data.myTeam.forEach(function(player, i){
				if (player.championId > 0)
				{
					document.getElementById("img0_"+i).src = URL_DRAGON + "/img/champion/" + champids[player.championId] + ".png"
					var champ_data = get_tier(player.championId)
					document.getElementById("tier0_"+i).innerText = champ_data
				}
			});
			data.theirTeam.forEach(function(player, i){
				if (player.championId > 0)
				{
					document.getElementById("img1_"+i).src = URL_DRAGON + "/img/champion/" + champids[player.championId] + ".png"
					var champ_data = get_tier(player.championId)
					document.getElementById("tier1_"+i).innerText = champ_data
				}
			});

		} else
		{
			time_sleep = 1000
			for (var i = 0; i < 5; i++) {
				document.getElementById("img0_"+i).src = "empty.png"
				document.getElementById("img1_"+i).src = "empty.png"
				document.getElementById("tier0_"+i).innerText = "?"
				document.getElementById("tier1_"+i).innerText = "?"
			}
		}
	}
}
