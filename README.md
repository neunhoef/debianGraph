Python Training JPL
===================

Debian Dependency Graph
-----------------------
Graphs have been in our daily lifes for quiet a while. We will pick one that has been evolving for allmost two decades now:
The relations between debian packages - Packages being the Vertices, and their relations the edges. Debian packages may relate to each other
in several ways:

- Depends: this package won't work without that package being installed too.
- Sugests: if you're using this package, you may find that package also usefull (i.e. documentation..)
- Replaces: on upgrade this package can replace that package providing similar functionality
- Breaks: though that package dosn't overlap, you shouldn't install them at once.
- Provides: virtual packages may be implemented by several packages - i.e Mail Transport Agent
- Conflicts: that package overlaps in files they try to deploy to the system
- Pre-Depends: that package has to be configured in order to be able to install this package.

This graph will not always have edges connected to existing vertices, since it may reference packages that only existed in the past.
`Depends`-edges however should be allways available.

The graph is generated using [this python script utilizing pyArango and debian package database parser utilities](https://github.com/tariqdaouda/pyArango/blob/master/examples/debiangraph.py).
Since the scripts takes a bunch of roundtrips to execute (and thus takes a while to run), we will re-import its results by using [arangoimp](https://docs.arangodb.com/3.0/Manual/Administration/Arangoimp.html). The source was [taken from the example dataset repository](https://github.com/arangodb/example-datasets/tree/master/DebianDependencyGraph).

- we provide copy for [arangorestore](https://docs.arangodb.com/3.0/Manual/Administration/Arangorestore.html) `arangorestore --create-database true --include-system-collections true --input-directory restorable --server.database dependencyGraph `
- migrated from the [arangorestore format to plain json with a shellscript](https://github.com/arangodb/example-datasets/blob/master/DebianDependencyGraph/convertToImport.sh), copied to the `import/` directory:
 - graph_definition.json - the graph definition
 - packages.json - 48811 package definitions
 - 25.0781 edges in: `Breaks.json`, `Conflicts.json`, `Depends.json`, `Pre-Depends.json`, `Provides.json`, `Replaces.json`,  `Suggests.json`
   - node count: 195.400 Depends.json
   - node count:  19.535 Suggests.json
   - node count:  10.395 Replaces.json
   - node count:   7.698 Breaks.json
   - node count:   7.313 Provides.json
   - node count:   6.573 Conflicts.json
   - node count:   3.867 Pre-Depends.json
- importable with `cd import; ./import.sh <path to arangoimp> <arangoimpcfg> <existingDBName>`

Comparing the sizes of the database daemon:

```
PID   USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
21709 willi     20   0 5227456 401772 114988 S   0.3  1.2   0:04.74 arangod <- naked DB
21709 willi     20   0 5864600 806944 554844 S   0.0  2.4   0:10.48 arangod <- DB after import
21709 willi     20   0 5899144 864080 555076 S   0.0  2.6   0:11.98 arangod <- after browsing graph in the web viewer
```










Python Scripts - Tutorial: Python in 10 minutes
===============================================

This is a short ArangoDB **Python** tutorial. In less than 10 minutes you will learn the basics to get started with ArangoDB and the pyArango driver.
**Note:** This tutorial is written by [Tariq Daouda](https://github.com/tariqdaouda) and uses [pyArango](https://github.com/tariqdaouda/pyArango) with ArangoDB 3.1.

Install the Python driver
-------------------------
There are several Python drivers available from the [download page](https://arangodb.com/download/arangodb-drivers/). We focus on pyArango. Install the latest stable version using `pip`:

```bash
pip install pyArango
```

If you would like to use the latest development version, you can clone the repository from github:
```bash
git clone https://github.com/tariqdaouda/pyArango.git
cd pyArango
python setup.py develop
```

You can follow this tutorial by launching Python in interactive mode:

`python`

The first step is to load the Connection module:

```python
from pyArango.connection import *
```

You can then instantiate a new connection by typing:

```python
conn = Connection(username="root", password=<root-password>)
```

**Hint:** The default connection is to http://127.0.0.1:8529.

Creating a database
-------------------
Let's create a new database:

```python
db = conn.createDatabase(name="mydb")
```

By typing `db` into Python you should now get:

```
ArangoDB database: mydb
```

Some details you should know about the code:
- `createDatabase()` creates a new database
- `mydb` is the name of the database

Already existing databases are automatically loaded by the connection. From now on you can also access the database through `conn["mydb"]`.

Creating a collection
---------------------
Now let's create our first collection:

```python
usersCollection= db.createCollection(name="Users")
```

Type `db["Users"]` and the result should look something like this:
```
ArangoDB collection name: Users, id: 202035203, type: document, status: loaded
```
Some details you should know about the code.
- `createCollection()` creates the collection
- `Users` is the name of the collection

Creating a document
-------------------
Now we create a document and set the value of a field `"name"`

```python
doc = usersCollection.createDocument()
doc["name"] = "Tesla"
```

If you now type `doc` the result should be:
```
ArangoDoc 'None': {'name': 'Tesla'}
```

You can see that the document has `None` for `_id`, this is because it has not been saved yet.
ArangoDB `_ids` are constructed as such `collection_name/_key`, where `_key` is a unique identifier for the document. If you don't specify a value for `_key` ArangoDB will take care of assign one to the document.

Here's how you assign a value manually:

```python
doc._key = "custom_key"
```

Let's save it now and see the result:

```python
doc.save()
doc
```

Perfect, the `_id` is set to `Users/custom_key`:

```
ArangoDoc 'Users/custom_key': {'name': 'Tesla'}
```

Some details you should know about the code:

- `createDocument()` creates a document
- `doc` is the name of the document
- `doc["name"]` sets the value with the field name `Tesla`
- `save()` saves the value in `custom_key`
- If you wouldn't save the result it would be `ArangoDoc 'None': {'name': 'Tesla'}`. ArangoDB _ids are constructed as `collection_name/_key` where `_key` is an unique identifier for the document

Read a document
---------------
Here's how to acccess the document we have created in the previous step:

```python
readDoc = usersCollection["custom_key"]
```

If you now type `readDoc` the result should look like this:

```python
ArangoDoc 'Users/custom_key': {u'name': u'Tesla'}
```

**Note:** The easiest way to access a document is with its `_key`.

Update the document
-------------------
We can now change the value of `name`:

```python
readDoc["name"] = "Howard"
```

Add a new field:

```python
readDoc["age"] = "78"
```

And save it:

```python
readDoc.save()
```

Read the document again
-----------------------
Let's read the document again:

```python
usersCollection["custom_key"]
```

The result should look like this:

```python
ArangoDoc 'Users/custom_key': {u'age': u'78', u'name': u'Howard'}
```

Create some additional data
---------------------------
Let's add 100 more documents to our collection:

```python
for i in range(100) :
    doc = usersCollection.createDocument()
    doc["name"] = "Tesla_%d" % i
    doc._key = "doc_%d" % i
    doc.save()
```
    
And print them all:
    
```python
for i in range(100):
  print(usersCollection["doc_%d" % i])
```

You should see:

```
ArangoDoc 'Users/doc_0′: {u'name': u'Tesla_0′}
...
ArangoDoc 'Users/doc_99′: {u'name': u'Tesla_99′}
```

List of all documents
---------------------
Here's how you can list all documents in a collection:

```python
for doc in usersCollection.fetchAll():
  print(doc)
```

The result should look something like this:

```
ArangoDoc 'Users/doc_29′: {u'name': u'Tesla_29′}
...
ArangoDoc 'Users/doc_26′: {u'name': u'Tesla_26′}
```

However, the order is not guaranteed.

Delete a document
-----------------
Let's delete our first document:

```python
firstDocument = usersCollection["custom_key"]
firstDocument.delete()
```

If you now type `usersCollection["custom_key"]` the result should be this error:

```
KeyError: (
  'Unable to find document with _key: custom_key', {
    'code': 404,
    'errorNum': 1202,
    'errorMessage': 'document /_api/document/Users/custom_key not found',
    'error': True
    })
```

Execute AQL queries
-------------------
We now use an AQL query to get all `_keys` for all the documents we have in our collection.

```python
aql = "FOR x IN Users RETURN x._key"
queryResult = db.AQLQuery(aql, rawResults=True, batchSize=100)
```

Type the following:

```python
for key in queryResult:
  print(key)
```
  
The result should look something like this:
  
```
doc_29
...
doc_26
```

Some details you should know about the code:
- `rawResults=True` specifies that you want the actual results as returned by the query
- The `batchSize` argument will automatically ask for new batches if there are more results (feature of the pyArango driver)
- `db` is the database object we created earlier
- The order of documents is not guaranteed

Insert a document with AQL
--------------------------
Now we will insert a new document with AQL:

```python
doc = {"_key": 'some_nice_key', "name": 'Robert', "age": '56'}
bindVars = {"doc": doc}
aql = "INSERT @doc INTO Users LET newDoc = NEW RETURN newDoc"
queryResult = db.AQLQuery(aql, bindVars=bindVars)
```

**Note:** the `RETURN newDoc`, because of that if we type into python:

```python
queryResult[0]
```

Or:

```python
db["Users"]["some_nice_key"]
```

We should see:

```
ArangoDoc 'Users/some_nice_key': {u'age': u'56', u'name': u'Robert'}
```

**Note:** `@key` and `@doc` define parameters for the update key and values in AQL.

Update a document with AQL
--------------------------
Updating an existind document is very similar. Here we will update the document that we have just created:

```python
doc = {"name": 'Carlos', "age": '103'}
bindVars = {"doc": doc, "key" : 'some_nice_key'}
aql = "UPDATE @key WITH @doc IN Users LET updated = NEW RETURN updated"
queryResult = db.AQLQuery(aql, bindVars=bindVars)
```

And if we type into python:

```python
queryResult[0]
```

or

```python
db["Users"]["some_nice_key"]
```

We should see:

```
ArangoDoc 'Users/some_nice_key': {u'age': u'103′, u'name': u'Carlos'}
```

**Note:** `@key` and `@doc` define parameters for the update key and values in AQL.

Delete a document with AQL
--------------------------
Now we will delete the document that we have just created:

```python
bindVars = {'@collection': 'Users'};
aql = '''
FOR x IN @@collection 
  FILTER x.age == "103" 
  REMOVE x IN @@collection 
    LET removed = OLD RETURN removed
'''

queryResult = db.AQLQuery(aql, bindVars=bindVars)
```

Now we type:

```python
print(queryResult[0])
```

Because we have asked the query to return the old document, we should get:

```
ArangoDoc 'Users/some_nice_key': {u'age': u'103′, u'name': u'Carlos'}
```

But because the document was effectively removed from the database, if we type:

```python
print(db["Users"]["some_nice_key"])
```

We should get the error:

```
KeyError: ('Unable to find document with _key: some_nice_key', 
{
  'code': 404,
  'errorNum': 1202,
  'errorMessage': u'document /_api/document/Users/some_nice_key not found',
  'error': True}
  )
```
  
Some details you should know about the code:
- `FILTER condition` only iterates over documents matching the condition
- `REMOVE x IN ` deletes a document (matching the filter)
- `@@collection` defines a parameter for a collection name, note the "@@"



Graphs with pyArango
--------------------
Lets translate one of [the graph examples of arangodb]() to python:

This is the original javascript example:
```js
// we create a graph with 'relation' pointing from 'female' to 'male' and 'male
var createSocialGraph = function () {
  var edgeDefinition = [];
  edgeDefinition.push(Graph._relation('relation', ['female', 'male'], ['female', 'male']));
  var g = Graph._create('social', edgeDefinition);
  var a = g.female.save({name: 'Alice', _key: 'alice'});
  var b = g.male.save({name: 'Bob', _key: 'bob'});
  var c = g.male.save({name: 'Charly', _key: 'charly'});
  var d = g.female.save({name: 'Diana', _key: 'diana'});
  g.relation.save(a._id, b._id, {type: 'married', _key: 'aliceAndBob'});
  g.relation.save(a._id, c._id, {type: 'friend', _key: 'aliceAndCharly'});
  g.relation.save(c._id, d._id, {type: 'married', _key: 'charlyAndDiana'});
  g.relation.save(b._id, d._id, {type: 'friend', _key: 'bobAndDiana'});
  return g;
};
```

translating into python like that:

```
#!/usr/bin/python
import sys
from pyArango.connection import *
from pyArango.graph import *
from pyArango.collection import *


class Social(object):
        class male(Collection) :
            _fields = {
                "name" : Field()
            }
            
        class female(Collection) :
            _fields = {
                "name" : Field()
            }
            
        class relation(Edges) :
            _fields = {
                "number" : Field()
            }
            
        class social(Graph) :

            _edgeDefinitions = (EdgeDefinition ('relation',
                                                fromCollections = ["female", "male"],
                                                toCollections = ["female", "male"]),)
            _orphanedCollections = []


        def __init__(self):
               self.conn = Connection(username="root", password="")
        
               self.db = self.conn["_system"]
               if self.db.hasGraph('social'):
                   raise Exception("The social graph was already provisioned! remove it first")

               self.female   = self.db.createCollection("female")
               self.male     = self.db.createCollection("male")
               
               self.relation = self.db.createCollection("relation")
               
               g = self.db.createGraph("social")
               
               a = g.createVertex('female', {"name": 'Alice',  "_key": 'alice'});
               b = g.createVertex('male',  {"name": 'Bob',    "_key": 'bob'});
               c = g.createVertex('male',   {"name": 'Charly', "_key": 'charly'});
               d = g.createVertex('female', {"name": 'Diana',  "_key": 'diana'});
               a.save()
               b.save()
               c.save()
               d.save()

               g.link('relation', a, b, {"type": 'married', "_key": 'aliceAndBob'})
               g.link('relation', a, c, {"type": 'friend', "_key": 'aliceAndCharly'})
               g.link('relation', c, d, {"type": 'married', "_key": 'charlyAndDiana'})
               g.link('relation', b, d, {"type": 'friend', "_key": 'bobAndDiana'})


Social()
```


Learn more
----------
Now you know how to work with ArangoDB.
- We also have a <a href="https://www.arangodb.com/tutorials">Tutorials</a> page with even more How-to's.
- Look at <a href="https://docs.arangodb.com/latest/AQL/index.html" target="_blank">AQL</a> to learn more about our query language.
- Do you want to know more about Databases? <a href="https://docs.arangodb.com/latest/Manual/DataModeling/Databases/index.html" target="_blank">Click here!</a>
- Read more about <a href="https://docs.arangodb.com/latest/Manual/DataModeling/Collections/index.html" target="_blank">Collections</a>.
- Explore <a href="https://docs.arangodb.com/latest/Manual/DataModeling/Documents/index.html" target="_blank">Documents</a> in our documentation.
- For more examples you can explore the <a href="https://docs.arangodb.com/cookbook" target="_blank">ArangoDB cookbook</a>.


Working with the dependency graph
=================================
*The script leans on the above steps having created `dependencyGraph` and imported the graph into it.*

We use `asciitree` in python to visualize the results of our query; Install it using

```
pip install asciitree
```

We create a simple test script `fetchGraph.py` that connects to the database as shown above, and executes
a simple graph traversal:

```python
graphQuery = '''
FOR package, depends, path IN
    1..2 ANY
     @startPackage Depends RETURN path
'''

startNode = sys.argv[1]

bindVars =  { "startPackage": "packages/" + startNode }

queryResult = db.AQLQuery(graphQuery, bindVars=bindVars, rawResults=True)
```

The rest of the script re-formats the `path` components of the traversal to build a compatible structure for the `asciitree`. 


We pick a nice starting node from the graph; `kanyremote` is a nice mixup from python and qt, so its got a nice graph:

```
./fetchGraph.py kanyremote
kanyremote
  +--python-kde4
  |  +--libkparts4
  |  +--libqt4-svg
  |  +--libkprintutils4
  |  +--sip-api-11.1
  |  +--libknewstuff3-4
  |  +--libkhtml5
  |  +--python
  ...
  |  +--libqtcore4
  |  +--kdepim-runtime
  +--anyremote
  |  +--libdbus-glib-1-2
  |  +--libbluetooth3
  |  +--libx11-6
  |  +--libc6
  |  +--libxtst6
  |  +--libglib2.0-0
  |  +--anyremote-data
  |  +--libdbus-1-3
  +--python-bluez
  |  +--python
  |  +--libbluetooth3
  |  +--libc6
  +--python-qt4
  |  +--libqt4-designer
  |  +--libqt4-test
  |  +--libqt4-xmlpatterns
  |  +--libqt4-dbus
  |  +--libqtcore4
  ...
  |  +--libqt4-svg
  +--python:any
     +--python:any
```

Foxx Service
============
*The script leans on the above steps having created `dependencyGraph` and imported the graph into it.*

PyArango doesn't offer a convenient layer for foxx services (yet). Though we can reuse parts of its infrastructure.

For simplicity we split `fetchGraph.py` into `fetchGraphFoxx.py` and a simple foxx service.

Usually foxx services should be self contained - this tiny sample will lean on that you already provisioned the debian dependency graph in the database you deploy it into.

We Reuse as much of pyArangos as possible construct the routes to our foxx service:

```python
foxxBaseUrl = conn.arangoURL + '/_db/'+ db.name + '/' + mountPoint
```

We now prepare a post document that we will send to the rest endpoint calculated above, and pick the structured result body:


```python
parameters={ 'startPackage': startNode }
queryResult = conn.session.post(foxxBaseUrl + '/documentsjpl/executeAQL', data=json.dumps(parameters)).json()
```

The mountpoint is configured during deploy time of the foxx service; its REST-Endpoints will be reacheable beneath it. Since thats quiet a valid usecase to have several instances of it, we make it a commandline argument.

The main thing which our foxx service `jpl_0.0.0.zip` does are these things:
- fetch the parameter `startPackage` from the json post body
- put it into a aqlQuery template which inserts `startPackage` as a bind parameter into the query
- executes the result
- returns it as the result

```js
router.post('/executeAQL', function (req, res) {
  const values = req.body;
  var startPackage = "packages/" + values.startPackage;
  var query = aqlQuery`
    FOR package, depends, path IN 1..2 ANY 
    ${startPackage} Depends
  RETURN path`;
  var cursor = require("internal").db._query(query);
  res.send(cursor);
})
.body(['application/json'], 'startPackage variable')
.response(['application/json'], 'A generic greeting.')
.summary('Generic greeting')
.description('Prints a generic greeting.');
```

We assume that you will install the foxx service under the `/jpl` mountpoint. You then can execute 

```bash
fetchGraphFoxx.py jpl kanyremote
```

and should see a similar output as in `fetchGraph.py`.
