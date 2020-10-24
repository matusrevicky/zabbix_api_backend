# How to run

Install node.js, npm  https://nodejs.org/en/download/


Initialize
```
npm install
```

Run with this command
```
node main.js
```

## Tested on zabbix from https://github.com/zabbix/zabbix-docker 
see https://www.zabbix.com/documentation/current/manual/installation/containers, I used docker compose

## Documentation 
jsdocs used
see how https://www.valentinog.com/blog/jsdoc/
```
node_modules/jsdoc/jsdoc.js main.js
```

POST http://127.0.0.1:8088/map
```
[{
        "name": "TEST5 Trigger map",
        "width": 600,
        "height": 600,
        "selements": [
            {
                "elements": [
                    {"triggerid": "16199"}
                ],
                "label": "1",
                "label_location": "0",
                "elementtype": 2,
                "iconid_off": "2",
                "iconid_disabled": "2",
                "iconid_maintenance": "2",
                "iconid_on": "2",
                "x": 50,
                "y": 150
            },
            {
                "elements": [
                    {"triggerid": "13467"}
                ],
                "label" : "2",
                "label_location": "3",
                "elementtype": 2,
                "iconid_off": "2",
                "iconid_disabled": "2",
                "iconid_maintenance": "2",
                "iconid_on": "2",
                "x": 100,
                "y": 150
            }
        ]
    }]
```