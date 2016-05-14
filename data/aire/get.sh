#!/bin/bash
DATE=$(`echo date +%Y-%m-%d.%H00`)
/usr/bin/phantomjs /home/bots/cdmx/data/scripts/phantom.aire.cdmx.js > /home/bots/cdmx/data/aire/latests.csv; cp /home/bots/cdmx/data/aire/latests.csv /home/bots/cdmx/data/aire/$DATE.csv; git commit -a -m "Data from $DATE" && git push
