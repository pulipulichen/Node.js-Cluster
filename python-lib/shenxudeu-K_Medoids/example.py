from k_medoids import KMedoids
import numpy as np
import matplotlib.pyplot as plt

def example_distance_func(data1, data2):
    '''example distance function'''
    return np.sqrt(np.sum((data1 - data2)**2))

if __name__ == '__main__':
    X = [ [ 20, 16 ],
  [ 20, 16 ],
  [ 20, 16 ],
  [ 16, 15 ],
  [ 1, 1 ],
  [ 1, 1 ],
  [ 1, 1 ],
  [ 1, 1 ] ]
    X = np.array(X)
    print X
    model = KMedoids(n_clusters=3, dist_func=example_distance_func)
    model.fit(X, plotit=True, verbose=True)

    print X
    model = KMedoids(n_clusters=3, dist_func=example_distance_func)
    model.fit(X, plotit=True, verbose=True)
    #plt.show()




