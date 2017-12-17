# -*- coding: utf-8 -*-
import sys, json
from k_medoids import KMedoids
import numpy as np

def example_distance_func(data1, data2):
    '''example distance function'''
    return np.sqrt(np.sum((data1 - data2)**2))

# simple JSON echo script
for line in sys.stdin:
    input = json.loads(line)
    X = input["matrix"]
    X = np.array(X)
    k = input["k"]
    model = KMedoids(n_clusters=k, dist_func=example_distance_func)
    centers,members = model.fit(X, plotit=False, verbose=False)
    members = members.tolist()

    output = []
    for i in members:
        output.append(centers[int(i)])

    print json.dumps(output)