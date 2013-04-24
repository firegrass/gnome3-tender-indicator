/*
 * @author Patrick McEvoy
 */

const Params = imports.misc.params;

// default settings for new servers
let DefaultSettings = {
	"tenders": [
		{
			"id": 1,
			"name": "Default",
			"subdomain": "help",
			"api_key": "",
			"autorefresh": true,
			"autorefresh_interval": 60
		}
	]
}

// helper to prevent weird errors if possible settings change in future updates by using default settings
function getSettingsJSON(settings)
{
	let settingsJSON = JSON.parse(settings.get_string ("settings-json"));

	// assert that at least default settings are available
	settingsJSON = settingsJSON || DefaultSettings;
	settingsJSON.tenders = settingsJSON.tenders || DefaultSettings.tenders;

	for (let i=0; i < settingsJSON.tenders.length; ++i) {
		for (setting in DefaultSettings.tenders[0]) {
			if (!(setting in settingsJSON.tenders[i]))
				settingsJSON.tenders[i][setting] = DefaultSettings.tenders[0][setting];
		}
	}

	return settingsJSON;
}
