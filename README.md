# GNOME Tender indicator

## Description

A GNOME3 Shell Extension to display Tender stats and allow quick access to tender website.

## Status

It's early days. It may not work properly, it may break. I may change how it works. Pull requests welcome :)

## Requirements:

- Gnome 3.4+
- [Tender](http://tenderapp.com/) account

## Installation (manually only atm):

1. Copy all files to `~/.local/share/gnome-shell/extensions/tenderindicator@patrick.qmtech.net`
2. Login and out
3. Go to https://extensions.gnome.org/local/ and enable `Tender Indicator`

## Configuration:

1. Once installed click the tender icon and then `Settings`
2. Add custom name, your tender subdomain and API Key
3. Everything should start working

## Credits

Thanks to [Philipp Hoffmann](https://raw.github.com/philipphoffmann) for writing the Jenkins Indicator which I
used to figure out how GNOME3 extensions work.

## Development stuff

### Pending api call testing

curl -H "Accept: application/json"  -H "X-Tender-Auth: AUTHTOKEN" https://api.tenderapp.com/clubhouse/discussions/pending | python -c'import fileinput, json; print(json.dumps(json.loads("".join(fileinput.input())), sort_keys=True, indent=4))' | less



