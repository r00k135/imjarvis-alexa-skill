#!/usr/bin/env python

import json
import simplejson
import urllib2
import re
import os
import subprocess
import time
import datetime
from pprint import pprint

client_server_up = 0

# count errors
tempC = subprocess.Popen("tail -1 /mnt/statsdrive/homegrapher_data/WEB-TEMP-LE100GU.5min.csv | awk -F, '{print $2}'", stdout=subprocess.PIPE, shell=True).stdout.read()

print "Content-type: application/json"
print ""
print '{'
print '"scale": "degrees celsius",'
print '"temp": '+str(tempC).rstrip()
print '}'

