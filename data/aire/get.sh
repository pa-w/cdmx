#!/bin/bash
DATE=$(`echo date +%Y-%m-%d.%H%M`)
cd /home/bots/cdmx/data/
/usr/bin/phantomjs scripts/phantom.aire.cdmx.js > aire/latests.csv; 
cp aire/latests.csv "aire/$DATE.csv"; 
git add "aire/$DATE.csv"
git commit -m "Data from $DATE"
git push
