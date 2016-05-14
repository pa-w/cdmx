#!/bin/bash
/usr/bin/phantomjs /home/bots/cdmx/data/scripts/phantom.aire.cdmx.js > /home/bots/cdmx/data/aire/latests.csv; cp /home/bots/cdmx/data/aire/latests.csv /home/bots/cdmx/data/aire/$(`echo date +%Y-%m-%d.%H00`).csv
