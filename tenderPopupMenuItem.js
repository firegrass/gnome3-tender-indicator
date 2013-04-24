/**
 * @author Patrick McEvoy
 */

const Lang = imports.lang;
const St = imports.gi.St;
const PopupMenu = imports.ui.popupMenu;
const Gio = imports.gi.Gio;
const Glib = imports.gi.GLib;
const Soup = imports.gi.Soup;
const MessageTray = imports.ui.messageTray;

const Me = imports.misc.extensionUtils.getCurrentExtension();

// set text domain for localized strings
const _ = imports.gettext.domain(Me.metadata['gettext-domain']).gettext;

/*
 * Represent pending / queue / cat
 */
const TenderPopupMenuItem = new Lang.Class({
	Name: 'TenderPopupMenuItem',
	Extends: PopupMenu.PopupBaseMenuItem,

	_init: function(parentMenu, name, settings, httpSession, params) {
			this.parent(params);

		this.parentMenu = parentMenu;
			this.settings = settings;
		this.httpSession = httpSession;

		this.url = '';
		this.name = name;

		this.label_name = new St.Label({text: name});
		this.addActor(this.label_name);

		this.label_value = new St.Label({text: '-'});
		this.addActor(this.label_value, {span: -1, align: St.Align.END});

		this.connect("activate", Lang.bind(this, function(){
			if (this.url != '')
				Gio.app_info_launch_default_for_uri(this.url, global.create_app_launch_context());
		}));
	},

	getName: function() {
		return this.label.text;
	},

	update: function(tenderState) {
		switch (this.name) {
		case 'Pending':
			if (tenderState['pending'] === undefined)
				return;
			this.label_value.text = tenderState['pending'].total.toString();

			if (tenderState['summary'] === undefined)
				return;
			this.url = tenderState['summary'].html_href + '/dashboard';
			break;
		case 'Assigned to me':
			// TODO Actually assign this val
			break;
		}
	}
});