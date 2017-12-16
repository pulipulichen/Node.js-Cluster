# -*- coding: utf-8 -*-
import sys, json

import configparser
from sklearn.metrics.pairwise import pairwise_distances
import numpy as np
import kmedoids

# simple JSON echo script
for line in sys.stdin:
    input = json.loads(line)
    cluster_number = input["cluster_number"]
    data = input["matrix"]

    attr_list = []

    for c in range(len(data[0])):
        list = []
        for row in data:
            list.append(row[c])
            #print(row[c])
        attr_list.append(list)

    for c_index in range(len(data[0])):
        list = attr_list[c_index]
        for r_index in range(len(data)):
            data[r_index][c_index] = (float(data[r_index][c_index]) - min(list)) / float(max(list) - min(list))

    D = pairwise_distances(data, metric='euclidean')
    retry=0
    while retry < 1000:
        try:
            M, C = kmedoids.kMedoids(D, cluster_number)
            break
        except:
            retry=retry+1

    order_labels = []
    for point_idx in range(len(M)):
        l = data[M[point_idx]]
        avg = sum(l) / float(len(l))
        order_labels.append(avg)

    seq = sorted(order_labels)
    order_labels = [seq.index(v) for v in order_labels]

    data_cluster = []
    for i in range(len(data)):
        for label in C:
            if i in C[label]:
                ordered_label = order_labels[label]
                data_cluster.append(ordered_label)

    print json.dumps(data_cluster)