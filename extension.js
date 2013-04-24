/**
 * @author Patrick McEvoy
 */

const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Lang = imports.lang;
const Gio = imports.gi.Gio;
const Soup = imports.gi.Soup;

const Me = imports.misc.extensionUtils.getCurrentExtension ();
const Convenience = Me.imports.convenience;
const Settings = Me.imports.settings;
const TenderIndicator = Me.imports.tenderIndicator;

const _httpSession = new Soup.SessionAsync ();
Soup.Session.prototype.add_feature.call (_httpSession, new Soup.ProxyResolverDefault ());

let tenderIndicator;
let settings, settingsJSON;

function init () {
	// load localization dictionaries
	Convenience.initTranslations ();

	// load extension settings
	settings = Convenience.getSettings ();
	settingsJSON = Settings.getSettingsJSON (settings);
}

function enable () {
	tenderIndicator = new TenderIndicator.TenderIndicator (settingsJSON, _httpSession);
	Main.panel.addToStatusArea ("tenderindicator", tenderIndicator);
}

function disable () {
	Main.panel.remove_child (tenderIndicator);
}
