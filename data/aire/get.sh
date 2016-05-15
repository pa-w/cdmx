#!/bin/bash
DATE=$(`echo date +%Y-%m-%d.%H%M`)
cd /home/bots/cdmx/data/
/usr/bin/phantomjs scripts/phantom.aire.cdmx.js > aire/latests.csv; 
cp aire/latests.csv "aire/$DATE.csv"; 
GIT_SSH_COMMAND='ssh -i /root/.ssh/paw-bot.id_rsa' git add "aire/$DATE.csv" aire/latests.csv
GIT_SSH_COMMAND='ssh -i /root/.ssh/paw-bot.id_rsa' git commit -m "Data from $DATE"
GIT_SSH_COMMAND='ssh -i /root/.ssh/paw-bot.id_rsa' git push

