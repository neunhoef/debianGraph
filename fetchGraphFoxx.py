#!/usr/bin/python
import sys, json
from pyArango.connection import *
from pyArango.graph import *
from asciitree import *

conn = Connection(username="root", password="")
db = conn["dependencyGraph"]

mountPoint = sys.argv[1]
startNode = sys.argv[2]

# Reuse the connection objects URL to construct the foxx service:
foxxBaseUrl = conn.arangoURL + '/_db/'+ db.name + '/' + mountPoint
parameters={ 'startPackage': startNode }
queryResult = conn.session.post(foxxBaseUrl + '/documentsjpl/executeAQL', data=json.dumps(parameters)).json()

# sub iterateable object to build up the tree for draw_tree:
class Node(object):
    def __init__(self, name, children):
        self.name = name
        self.children = children
        
    def getChild(self, searchName):
        for child in self.children:
            if child.name == searchName:
                return child
        return None
    
    def __str__(self):
        return self.name

def iteratePath(path, depth, currentNode):
    pname = path[depth]['name']
    subNode = currentNode.getChild(pname)
    if subNode == None:
        subNode = Node(pname, [])
        currentNode.children.append(subNode)
    if len(path) > depth + 1:
        iteratePath(path, depth + 1, subNode)

# Now we fold the paths substructure into the tree:
rootNode = Node(startNode, [])
for path in queryResult:
    p = path['edges']
    iteratePath(p, 0, rootNode)

print draw_tree(rootNode)
