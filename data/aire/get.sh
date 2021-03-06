#!/bin/bash
DATE=$(`echo date +%Y-%m-%d.%H%M`)
cd /home/bots/cdmx/
/usr/bin/phantomjs data/scripts/phantom.aire.cdmx.js > "data/aire/$DATE.csv"; 
echo "index" > data/aire.csv
find data/aire/ -name "*.csv" | sort -r | head -n 100 >> data/aire.csv
GIT_SSH_COMMAND='ssh -i /root/.ssh/paw-bot.id_rsa' git config user.email "paw@epicwin.mx"
GIT_SSH_COMMAND='ssh -i /root/.ssh/paw-bot.id_rsa' git add "data/aire/$DATE.csv" data/aire.csv
GIT_SSH_COMMAND='ssh -i /root/.ssh/paw-bot.id_rsa' git commit -m "Data from $DATE"
GIT_SSH_COMMAND='ssh -i /root/.ssh/paw-bot.id_rsa' git push

