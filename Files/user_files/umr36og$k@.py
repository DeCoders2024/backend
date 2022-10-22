from collections import defaultdict

#This class represents a undirected graph using adjacency list representation
class Graph:

	def __init__(self,vertices):
		self.V= vertices #No. of vertices
		self.graph = defaultdict(list) # default dictionary to store graph


	# function to add an edge to graph
	def addEdge(self,u,v):
		self.graph[u].append(v)

	# A utility function to find the subset of an element i
	def find_parent(self, parent,i):
		if parent[i] == -1:
			return i
		if parent[i]!= -1:
			return self.find_parent(parent,parent[i])

	# A utility function to do union of two subsets
	def union(self,parent,x,y):
		parent[x] = y

	def isCyclic(self):
         parent=[-1]*self.V
         for i in range(self.V):
             for item in self.graph[i]:
                 x=self.find_parent(parent,i)
                 y=self.find_parent(parent,item)
                 if(x==y):
                     print(parent)
                     return True
                 self.union(parent,i,item)
             print(parent,i)


# Create a graph given in the above diagram
g = Graph(4)
g.addEdge(0, 1)
g.addEdge(1, 0)
g.addEdge(1, 2)
g.addEdge(2, 1)
g.addEdge(0, 3)
g.addEdge(3, 0)
g.addEdge(2, 3)
g.addEdge(3, 2)

if g.isCyclic():
	print ("Graph contains cycle")
else :
	print ("Graph does not contain cycle ")

#This code is contributed by Neelam Yadav
