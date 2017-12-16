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
    max_retry=10
    M = []
    C = []
    print json.dumps(kmedoids.kMedoids(D, cluster_number))
    break

    while retry < max_retry:
        try:
            M, C = kmedoids.kMedoids(D, cluster_number)
            if M is not None and C is not None:
                break
            else:
                retry=retry+1
        except:
            retry=retry+1

    if retry == max_retry:
        raise "k-medoids failed"

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
    break