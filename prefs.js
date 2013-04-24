/*
 * @author Patrick McEvoy
 */

const Lang = imports.lang;
const Gtk = imports.gi.Gtk;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Settings = Me.imports.settings;

const _ = imports.gettext.domain(Me.metadata['gettext-domain']).gettext;

let settings, settingsJSON;

function init() {
	Convenience.initTranslations();
	settings = Convenience.getSettings();
	settingsJSON = Settings.getSettingsJSON(settings);
}

// update JSON settings for server in settings schema
function updateServerSetting(num, setting, value)
{
	settingsJSON = Settings.getSettingsJSON(settings);
	settingsJSON["tenders"][num][setting] = value;
	settings.set_string("settings-json", JSON.stringify(settingsJSON));
}

function addTenderPage (notebook, num) {
	let tabLabel = new Gtk.Label({ label: settingsJSON['tenders'][num]['name']});

	let vbox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, border_width: 10 });

	let vboxTenderSettings = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, margin_left: 20, margin_bottom: 15 });

	// Tender name
	let hboxTenderName = new Gtk.Box ({orientation: Gtk.Orientation.HORIZONTAL});
	let labelTenderName = new Gtk.Label ({label: _("Tender name"), xalign: 0});
	let inputTenderName = new Gtk.Entry ({ hexpand: true, text: settingsJSON['tenders'][num]['name'] });

	inputTenderName.connect ("changed", Lang.bind (this, function (input) {
		tabLabel.set_text(input.text);
		updateServerSetting (num, "name", input.text);
	}));

	hboxTenderName.pack_start (labelTenderName, true, true, 0);
	hboxTenderName.add (inputTenderName);
	vboxTenderSettings.add (hboxTenderName);

	// Subdomain
	let hboxSubdomain = new Gtk.Box ({orientation: Gtk.Orientation.HORIZONTAL});
	let labelSubdomain = new Gtk.Label ({label: _("Subdomain"), xalign: 0});
	let inputSubdomain = new Gtk.Entry ({ hexpand: true, text: settingsJSON['tenders'][num]['subdomain'] });

	inputSubdomain.connect ("changed", Lang.bind (this, function (input) { updateServerSetting (num, "subdomain", input.text); }));

	hboxSubdomain.pack_start (labelSubdomain, true, true, 0);
	hboxSubdomain.add (inputSubdomain);
	vboxTenderSettings.add (hboxSubdomain);

	// API Key
	let hboxApiKey = new Gtk.Box ({orientation: Gtk.Orientation.HORIZONTAL});
	let labelApiKey = new Gtk.Label ({label: _("API Key"), xalign: 0});
	let inputApiKey = new Gtk.Entry ({ hexpand: true, text: settingsJSON['tenders'][num]['api_key'] });

	inputApiKey.connect ("changed", Lang.bind (this, function (input) { updateServerSetting (num, "api_key", input.text); }));

	hboxApiKey.pack_start (labelApiKey, true, true, 0);
	hboxApiKey.add (inputApiKey);
	vboxTenderSettings.add (hboxApiKey);

	// Auto refresh
	let hboxAutoRefresh = new Gtk.Box ({orientation: Gtk.Orientation.HORIZONTAL});
	let labelAutoRefresh = new Gtk.Label ({label: _("Auto-refresh"), xalign: 0});
	let inputAutoRefresh = new Gtk.Switch ({active: settingsJSON['tenders'][num]['autorefresh']});

	inputAutoRefresh.connect ("notify::active", Lang.bind(this, function(input){
		updateServerSetting (num, 'autorefresh', input.get_active ());
	}));

	hboxAutoRefresh.pack_start (labelAutoRefresh, true, true, 0);
	hboxAutoRefresh.add (inputAutoRefresh);
	vboxTenderSettings.add (hboxAutoRefresh);

	// Auto refresh interval
	let hboxAutorefreshInterval = new Gtk.Box ({orientation: Gtk.Orientation.HORIZONTAL});
	let labelAutorefreshInterval = new Gtk.Label ({label: _("Auto-refresh interval (seconds)"), xalign: 0});

	let inputAutorefreshInterval = new Gtk.HScale.new_with_range (1, 600, 1);
	inputAutorefreshInterval.set_value (settingsJSON['tenders'][num]['autorefresh_interval']);
	inputAutorefreshInterval.set_size_request (200, -1);

	inputAutorefreshInterval.connect ("value_changed", Lang.bind(inputAutorefreshInterval, function () {
		updateServerSetting (num, 'autorefresh_interval', this.get_value ());
	}));

	hboxAutorefreshInterval.pack_start (labelAutorefreshInterval, true, true, 0);
	hboxAutorefreshInterval.add (inputAutorefreshInterval);
	vboxTenderSettings.add (hboxAutorefreshInterval);

	vbox.add(vboxTenderSettings);

	// button to remove tab
	let iconRemoveServer = new Gtk.Image ({ stock: Gtk.STOCK_CLOSE });
	let btnRemoveServer = new Gtk.Button ({ image: iconRemoveServer });

	btnRemoveServer.connect ('clicked', Lang.bind (notebook, function() {
		if (notebook.get_n_pages() > 1) {
			// remove server from settings
			settingsJSON['tenders'].splice (notebook.page_num(tabContent), 1);
			settings.set_string("settings-json", JSON.stringify(settingsJSON));

			// remove tab from notebook
			notebook.remove_page (notebook.page_num (tabContent));
		}
	}));

	// widget for tab containing label and close button
	let tabWidget = new Gtk.HBox ({ spacing: 5 });
	tabWidget.add (tabLabel);
	tabWidget.add (btnRemoveServer);
	tabWidget.show_all ();

	// tab content
	let tabContent = new Gtk.ScrolledWindow ({ vexpand: true });
	tabContent.add_with_viewport (vbox);

	// append tab to notebook
	notebook.append_page (tabContent, tabWidget);
}

function buildPrefsWidget() {
	let notebook = new Gtk.Notebook();

	// Build a page for each tender support
	for (let i=0; i < settingsJSON['tenders'].length; ++i) {
		// add tab panels for each server
		addTenderPage (notebook, i);
	}

	let labelTitle = new Gtk.Label({ label: '<big>Tender Indicator Extension Settings</big>', use_markup: true, xalign: 0 }); 

	// Add new button
	let btnNewServer = new Gtk.Button({label: _('Add new Tender')});
	btnNewServer.connect ('clicked', Lang.bind (notebook, function() {
		// get default settings for this new server
		settingsJSON['tenders'][settingsJSON['tenders'].length] = Settings.DefaultSettings['tenders'][0];

		// set new id
		let currentDate = new Date;
		settingsJSON['tenders'][settingsJSON['tenders'].length-1]['id'] = currentDate.getTime();

		// save new settings
		settings.set_string("settings-json", JSON.stringify (settingsJSON));

		// add tab with copied settings
		addTenderPage (notebook, settingsJSON['tenders'].length-1);
		notebook.show_all();

		// jump to added tab
		notebook.set_current_page (settingsJSON['tenders'].length-1);
	}));

	let hbox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, border_width: 0 });
	hbox.pack_start (labelTitle, true, true, 0);
	hbox.pack_start (btnNewServer, false, false, 0);
	hbox.show_all ();

	// container
	let frame = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, border_width: 10 });
	frame.add(hbox);
	frame.add(notebook);
	frame.show_all();
	return frame;
}