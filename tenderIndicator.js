/**
 * @author Patrick McEvoy
 */

const Lang = imports.lang;
const St = imports.gi.St;
const Mainloop = imports.mainloop;
const Glib = imports.gi.GLib;
const Soup = imports.gi.Soup;
const PopupMenu = imports.ui.popupMenu;
const PanelMenu = imports.ui.panelMenu;

const Me = imports.misc.extensionUtils.getCurrentExtension ();
//const Utils = Me.imports.utils;
const TenderPopupMenu = Me.imports.tenderPopupMenu;

// set text domain for localized strings
const _ = imports.gettext.domain(Me.metadata['gettext-domain']).gettext;

/*
 * Represents the indicator in the top menu bar.
 */
const TenderIndicator = new Lang.Class ({
	Name: 'TenderIndicator',
	Extends: PanelMenu.Button,

	_init: function (settings, httpSession) {
		this.parent (0.25, "Tender Indicator", false );

		// the number of the server this indicator refers to
		var tenders = new Array();
		this.settings = settings;
		this.httpSession = httpSession;

		// start off with no state to display
		this.states = { };
		for (var i=0;i<this.settings.tenders.length;i++) {
			this.states[this.settings.tenders[i].subdomain] = {};
		}

		this._dueUpdate = false;

		// Defines if new content is available to see
		this._active = false;

		// add indicator image
		this._icon = new St.Icon ({ icon_size : 16, style_class: 'button-box' })
		this.actor.add_actor (this._icon);

		// Add menu
		this.setMenu(new TenderPopupMenu.TenderPopupMenu(this, this.actor, 0.25, St.Side.TOP, this.settings, this.httpSession));

		// Do stuff when indicator is clicked
		this.actor.connect("button-press-event", Lang.bind(this, this.menuOpened));

		// Initial fetch
		this.fetch ();

		// Enter main loop for refreshing
		this._loopsInit ();
	},

	_loopsInit: function () {
		this._autorefreshloops = [];
		for (var i=0;i<this.settings.tenders.length;i++) {
			let autorefreshloop = Mainloop.timeout_add (this.settings.tenders[i]['autorefresh_interval']*1000, Lang.bind (this, function () {
				this.fetch ();
				return true;
			}));
			this._autorefreshloops.push (autorefreshloop);
		}

		this._mainloop = Mainloop.timeout_add (200, Lang.bind (this, function () {
			if (this._dueUpdate) {
				this.update ();
				this._dueUpdate = false;
			}
			return true;
		}));
	},
	menuOpened: function() {
		this.setIconUnactive ();
		this.fetch ();
	},
	fetch: function(tender, url, handler) {
		for (var i=0;i<this.settings.tenders.length;i++) {
			if (this.settings.tenders[i].autorefresh) {
				this.request(this.settings.tenders[i], '/discussions/pending', this.pendingHandler);
				this.request(this.settings.tenders[i], '', this.summaryHandler);
				// TODO: request other data
			}
		}
	},
	request: function(tender, url, handler) {
		// only update if no update is currently running
		let request = Soup.Message.new ('GET', 'https://api.tenderapp.com/' + tender.subdomain + url);

		request.timeout = this.settings.autorefresh_interval - 1;
		request.request_headers.append ('X-Tender-Auth', tender.api_key);
		request.request_headers.append ('Accept', 'application/json');

		if (request) {
			this.httpSession.queue_message (request, Lang.bind (this, function (httpSession, message) {
				if (message.status_code !== 200) {
					this.showError (tender, 'Couldn\'t fetch data from Tender');
				} else {
					// parse JSON and handle
					try {
						let newState = JSON.parse(request.response_body.data);
						var hasNewContent = handler (this.states[tender.subdomain], newState);
						if (hasNewContent) {
							this._dueUpdate = true;
						}
					} catch (e) {
						this.showError (tender, 'Tender sent unexpected data');
						global.log(e);
					}
				}
			}));
		} else {
			this.showError (tender, 'Couldn\'t fetch data from Tender');
		}
	},
	// JSON handlers
	pendingHandler: function (state, newState) {
		var hasNewContent = false;
		if (state['pending'] != undefined && state['pending'].discussions != undefined) {
			var previousNumbers = [];
			for (let i=0; i < state['pending'].discussions.length; ++i) {
				previousNumbers.push(state['pending'].discussions[i].number);
			}
			for (let i=0; i < newState.discussions.length; ++i) {
				if (previousNumbers.indexOf(newState.discussions[i].number) == -1) {
					hasNewContent = true;
					break;
				}
			}
		} else
			hasNewContent = true;

		state['pending'] = newState;
		return hasNewContent;
	},
	summaryHandler: function (state, newState) {
		state['summary'] = newState;
		return false;
	},
	//
	setIconActive: function () {
		this._active = true;
		this._icon.style_class = 'button-box-active';
	},
	setIconUnactive: function () {
		this._active = false;
		this._icon.style_class = 'button-box';
	},
	// update indicator icon and popupmenu contents
	update: function() {
		// Update icon
		this.setIconActive ();

		// Update popup menu
		this.menu.updateState(this.states);
	},

	// update settings
	updateSettings: function (settings) {
		this.settings = settings;

		// update server menu item
		this.menu.updateSettings (this.settings);

		// refresh main loop
		for (var i=0; i<this._autorefreshloops.length; i++)
			Mainloop.source_remove (this._autorefreshloops[i]);
		ainloop.source_remove (this._mainloop);
		this._loopsInit ();

		this.fetch ();
	},

	// displays an error message in the popup menu
	showError: function(tender, text) {
		// set default error message if none provided
		text = text || "unknown error";

		// Show error message in popup menu
		this.menu.displayError (tender, text);
	},
	// destroys the indicator
	destroy: function() {
		// destroy loops
		for (var i=0; i<this._autorefreshloops.length; i++)
			Mainloop.source_remove (this._autorefreshloops[i]);
		Mainloop.source_remove (this._mainloop);

		this.parent();
	}
});