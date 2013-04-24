/**
 * @author Patrick McEvoy
 */

const Lang = imports.lang;
const Shell = imports.gi.Shell;
const St = imports.gi.St;
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const PopupMenu = imports.ui.popupMenu;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const TenderPopupMenuItem = Me.imports.tenderPopupMenuItem;

// set text domain for localized strings
const _ = imports.gettext.domain(Me.metadata['gettext-domain']).gettext;

/*
 * Popup menu
 */
const TenderPopupMenu = new Lang.Class({
	Name: 'TenderPopupMenu',
	Extends: PopupMenu.PopupMenu,

	_init: function(indicator, sourceActor, arrowAlignment, arrowSide, settings, httpSession) {
		this.parent(sourceActor, arrowAlignment, arrowSide);

		this.indicator = indicator;
		this.settings = settings;
		this.httpSession = httpSession;

		this.tenders = this.settings.tenders;

		for (var i=0;i<this.tenders.length;i++) {
			var tender = this.tenders[i];

			var section = new PopupMenu.PopupMenuSection();

			var item_name = new PopupMenu.PopupMenuItem(tender.name);
			item_name.actor.label_actor.style = 'font-weight: bold;';
			section.addMenuItem(item_name);

			var item_data = new PopupMenu.PopupMenuItem("Awaiting data...");
			section.addMenuItem(item_data);

			this.addMenuItem (section);
			tender.menu_section = section;

			this.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
		}

		// add link to settings dialog
		this._menu_settings = new PopupMenu.PopupMenuItem("Settings");
		this._menu_settings.connect("activate", function(){
			// call gnome settings tool for this extension
			let app = Shell.AppSystem.get_default().lookup_app("gnome-shell-extension-prefs.desktop");
			if( app!=null )
				app.launch(global.display.get_current_time_roundtrip(), ['extension:///' + Me.uuid], -1, null);
		});
		this.addMenuItem(this._menu_settings);
	},
	displayError: function (tender, text) {
		let section = tender.menu_section;

		// Remove all menu items except Tender name
		for (var i=1; i < section.numMenuItems; i++)
			section._getMenuItems ()[i].destroy ();

		let errorItem = new PopupMenu.PopupMenuItem (text, { style_class: 'error' })
		section.addMenuItem (errorItem);
	},
	updateState: function (states) {

		for (var i=0;i<this.tenders.length;i++) {
			var tender = this.tenders[i];

			let state = states[tender.subdomain];
			if (state === undefined || state['pending'] === undefined)
				return;

			var section = tender.menu_section;

			if (section._getMenuItems()[1] instanceof PopupMenu.PopupMenuItem) {
				section._getMenuItems()[1].destroy();

				var item_pending = new TenderPopupMenuItem.TenderPopupMenuItem(this, 'Pending', this.settings, this.httpSession);
				item_pending.update(state);
				section.addMenuItem(item_pending);

				var item_assigned = new TenderPopupMenuItem.TenderPopupMenuItem(this, 'Assigned to me', this.settings, this.httpSession);
				item_assigned.update(state);
				section.addMenuItem(item_assigned);
			} else {
				for (var i=0;i<section.numMenuItems;i++) {
					var item = section._getMenuItems()[i];
					if (item instanceof TenderPopupMenuItem.TenderPopupMenuItem)
						item.update(state);
				}
			}
		}
	},
	// update settings
	updateSettings: function (settings) {
		this.settings = settings;
	}
});