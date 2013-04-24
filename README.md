

tender api queries

pending

curl -H "Accept: application/json"  -H "X-Tender-Auth: AUTHTOKEN" https://api.tenderapp.com/clubhouse/discussions/pending | python -c'import fileinput, json; print(json.dumps(json.loads("".join(fileinput.input())), sort_keys=True, indent=4))' | less



