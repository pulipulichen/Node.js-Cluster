# -*- coding: utf-8 -*-
import sys, json
import pam, time

# simple JSON echo script
for line in sys.stdin:
    input = json.loads(line)

    k = input["k"]
    data = input["matrix"]

    startTime = time.time()
    best_cost, best_choice, best_medoids = pam.kmedoids(data, k)
    endTime = time.time()

    print json.dumps(best_medoids)