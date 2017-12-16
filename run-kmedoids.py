# coding: utf-8
import configparser
from sklearn.metrics.pairwise import pairwise_distances
import numpy as np

import kmedoids
import csv

config = configparser.ConfigParser()
config.read('config.ini')

# 3 points in dataset
original_data = np.loadtxt('input/input.csv', delimiter=',', ndmin=2, dtype = np.float64)

data = np.loadtxt('input/input.csv', delimiter=',', ndmin=2, dtype = np.float64)
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
        data[r_index][c_index] = (data[r_index][c_index] - min(list)) / float(max(list) - min(list))
    
# distance matrix
D = pairwise_distances(data, metric='euclidean')

cluster_number = config.getint('kmedoids', 'cluster_number')
# split into 2 clusters
M, C = kmedoids.kMedoids(D, cluster_number)

print('medoids:')
order_label = []
for point_idx in range(len(M)):
    l = data[M[point_idx]]
    avg = sum(l) / float(len(l))
    print( avg )
    order_label.append(avg)

seq = sorted(order_label)
order_label = [seq.index(v) for v in order_label]
print(order_label)

print('')
print('clustering result:')
output_list = []
for i in range(len(data)):
    for label in C:
        if i in C[label]:
            row = original_data[i].tolist()
            for r_index in range(len(row)):
                if int(row[r_index]) == float(row[r_index]):
                    row[r_index] = int(row[r_index])
            
            print('label {0} : {1}'.format(order_label[label], row))        
                    
            row.append(order_label[label])
            #output_list.append(map(float, row))
            output_list.append(row)

print('')
for i in range(len(order_label)):
    label = order_label.index(i)
    print('label {0} count: {1}'.format(order_label[label], len(C[label])))

# 輸出吧
with open('output.csv', 'wb') as myfile:
    wr = csv.writer(myfile)
    for row in output_list:
        wr.writerow(row)
        
# 輸出圖片
#plt.hist(original_data)
#plt.title("Gaussian Histogram")
#plt.xlabel("Value")
#plt.ylabel("Frequency")

#fig = plt.gcf()

#plot_url = py.plot_mpl(fig, filename='mpl-basic-histogram')