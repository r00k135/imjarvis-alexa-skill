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
import cgi

computers = {"mikey's" : "c0:3f:d5:69:f0:ec",
"michael's" : "c0:3f:d5:69:f0:ec",
"chris's" : "d8:cb:8a:a1:56:5e",
"joanna's" : "78:24:af:44:8e:bd",
"jo's" : "78:24:af:44:8e:bd",
"daisy's" : "00:01:2e:bc:04:c5",
"james's" : "c0:3f:d5:69:e1:c4"}

arguments = cgi.FieldStorage()

computerToStart=arguments["computer"].value;

try :
	if computers[computerToStart]:
		wolOutput = subprocess.Popen("/usr/bin/wakeonlan "+computers[computerToStart], stdout=subprocess.PIPE, shell=True).stdout.read()
		print "Content-type: application/json"
		print ""
		print '{'
		print '"result": "'+computerToStart+' computer started",'
		print '"debug": "'+str(wolOutput).rstrip()+'"'
		print '}'
except KeyError, e:
	if computerToStart == "all":
		wolOutput = ""
		for i in computers.keys():
			if wolOutput == "":
				wolOutput = str(subprocess.Popen("/usr/bin/wakeonlan "+computers[i], stdout=subprocess.PIPE, shell=True).stdout.read()).rstrip()
			else:
				wolOutput += ", "+str(subprocess.Popen("/usr/bin/wakeonlan "+computers[i], stdout=subprocess.PIPE, shell=True).stdout.read()).rstrip()
			
		print "Content-type: application/json"
                print ""
                print '{'
                print '"result": "all computers started",'
		print '"debug": "'+wolOutput+'"'
                print '}'
	else:
		print "Content-type: application/json"
		print ""
		print '{'
		print '"result": "unknown computer"'
		print '}'
