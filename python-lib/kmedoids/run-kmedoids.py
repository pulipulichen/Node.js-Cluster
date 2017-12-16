# -*- coding: utf-8 -*-
import configparser
from sklearn.metrics.pairwise import pairwise_distances
import numpy as np

import kmedoids
import csv
import sys

config = configparser.ConfigParser()
config.read(['config.ini'], encoding='utf8')

cluster_number = config.getint('kmedoids', 'cluster_number')
cluster_labels = config['kmedoids']['cluster_labels']
cluster_labels = cluster_labels.encode("utf8").split(",")
print(cluster_labels)

only_cluster_number = config.getboolean('kmedoids', 'only_cluster_number')
first_row_is_field_name = config.getboolean('csv', 'first_row_is_field_name')

skiprows = 0
if first_row_is_field_name == True:
    skiprows = 1

# 3 points in dataset
input_file_path = 'input/input.csv';
original_data = np.loadtxt(input_file_path, delimiter=',', ndmin=2, dtype = np.float64, skiprows=skiprows)
first_line = []
if first_row_is_field_name == True:
    f = np.loadtxt(input_file_path, delimiter=',', ndmin=2, dtype = np.str)
    #print(f[0])
    first_line = f[0].tolist()
    first_line.append("cluster")
    #print(first_line)

data = np.loadtxt(input_file_path, delimiter=',', ndmin=2, dtype = np.float64, skiprows=skiprows)
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


# split into 2 clusters
retry=0
while retry < 1000:
    try:
        M, C = kmedoids.kMedoids(D, cluster_number)
        break
    except:
        retry=retry+1

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
if first_row_is_field_name == True:
    #print(first_line)
    if only_cluster_number == True:
        output_list.append(["cluster"])
    else:
        output_list.append(first_line)

for i in range(len(data)):
    for label in C:
        if i in C[label]:
            row = original_data[i].tolist()
            for r_index in range(len(row)):
                if int(row[r_index]) == float(row[r_index]):
                    row[r_index] = int(row[r_index])

            
            ordered_label = order_label[label]
            str_label = cluster_labels[ordered_label]
            print('label {0} : {1}'.format(ordered_label, row))        
            
            if only_cluster_number == True:
                output_list.append(str_label)
            else:
                row.append(order_label[label])
                #output_list.append(map(float, row))
                output_list.append(row)

print('')
for i in range(len(order_label)):
    label = order_label.index(i)
    ordered_label = order_label[label]
    str_label = cluster_labels[ordered_label]
    print('label {0} count: {1}'.format(ordered_label, len(C[label])))

#print("----------------")
#print(output_list)

# 輸出吧
with open('output/output.csv', 'wb') as myfile:
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