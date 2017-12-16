# -*- coding: utf-8 -*-
import sys, json

# simple JSON echo script
for line in sys.stdin:
	groups = json.loads(line)
	print json.dumps(groups)