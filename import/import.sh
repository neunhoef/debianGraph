#!/bin/bash

ARANGOIMP=$1
ARANGOIMPCFG=$2
TARGETDB=$3

for dumpfile in Breaks.json  Conflicts.json  Depends.json  Pre-Depends.json  Provides.json  Replaces.json  Suggests.json  packages.json; do
    COLNAME=`echo $dumpfile|sed "s;.json;;"`
    if test ${dumpfile} == packages.json; then
        COLTYPE=document
    else
        COLTYPE=edge
    fi
    ${ARANGOIMP} -c ${ARANGOIMPCFG}  --collection ${COLNAME} --create-collection 1 --server.database ${TARGETDB} --create-collection-type ${COLTYPE} --file ${dumpfile}

done

${ARANGOIMP} -c ${ARANGOIMPCFG}  --collection _graphs --create-collection 0 --server.database ${TARGETDB} --file graph_definition.json

