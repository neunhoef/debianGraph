/* global AQL_EXECUTE */

'use strict';
const dd = require('dedent');
const joi = require('joi');
const httpError = require('http-errors');
const status = require('statuses');
const errors = require('@arangodb').errors;
const createRouter = require('@arangodb/foxx/router');
const DocumentsJpl = require('../models/documentsjpl');

const documentsJplItems = module.context.collection('documentsJpl');
const keySchema = joi.string().required()
.description('The key of the documentsJpl');

const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;
const ARANGO_DUPLICATE = errors.ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED.code;
const ARANGO_CONFLICT = errors.ERROR_ARANGO_CONFLICT.code;
const HTTP_NOT_FOUND = status('not found');
const HTTP_CONFLICT = status('conflict');

const router = createRouter();
module.exports = router;

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

router.get(function (req, res) {
  res.send(documentsJplItems.all());
}, 'list')
.response([DocumentsJpl], 'A list of documentsJplItems.')
.error(HTTP_CONFLICT, 'Could not execute query.')
.summary('List all documentsJplItems')
.description(dd`
  Retrieves a list of all documentsJplItems.
`);


router.post(function (req, res) {
  const documentsJpl = req.body;
  let meta;
  try {
    meta = documentsJplItems.save(documentsJpl);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_DUPLICATE) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  Object.assign(documentsJpl, meta);
  res.status(201);
  res.set('location', req.makeAbsolute(
    req.reverse('detail', {key: documentsJpl._key})
  ));
  res.send(documentsJpl);
}, 'create')
.body(DocumentsJpl, 'The documentsJpl to create.')
.response(201, DocumentsJpl, 'The created documentsJpl.')
.error(HTTP_CONFLICT, 'The documentsJpl already exists.')
.summary('Create a new documentsJpl')
.description(dd`
  Creates a new documentsJpl from the request body and
  returns the saved document.
`);


router.get(':key', function (req, res) {
  const key = req.pathParams.key;
  let documentsJpl
  try {
    documentsJpl = documentsJplItems.document(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    throw e;
  }
  res.send(documentsJpl);
}, 'detail')
.pathParam('key', keySchema)
.response(DocumentsJpl, 'The documentsJpl.')
.summary('Fetch a documentsJpl')
.description(dd`
  Retrieves a documentsJpl by its key.
`);


router.put(':key', function (req, res) {
  const key = req.pathParams.key;
  const documentsJpl = req.body;
  let meta;
  try {
    meta = documentsJplItems.replace(key, documentsJpl);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    if (e.isArangoError && e.errorNum === ARANGO_CONFLICT) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  Object.assign(documentsJpl, meta);
  res.send(documentsJpl);
}, 'replace')
.pathParam('key', keySchema)
.body(DocumentsJpl, 'The data to replace the documentsJpl with.')
.response(DocumentsJpl, 'The new documentsJpl.')
.summary('Replace a documentsJpl')
.description(dd`
  Replaces an existing documentsJpl with the request body and
  returns the new document.
`);


router.patch(':key', function (req, res) {
  const key = req.pathParams.key;
  const patchData = req.body;
  let documentsJpl;
  try {
    documentsJplItems.update(key, patchData);
    documentsJpl = documentsJplItems.document(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    if (e.isArangoError && e.errorNum === ARANGO_CONFLICT) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  res.send(documentsJpl);
}, 'update')
.pathParam('key', keySchema)
.body(joi.object().description('The data to update the documentsJpl with.'))
.response(DocumentsJpl, 'The updated documentsJpl.')
.summary('Update a documentsJpl')
.description(dd`
  Patches a documentsJpl with the request body and
  returns the updated document.
`);


router.delete(':key', function (req, res) {
  const key = req.pathParams.key;
  try {
    documentsJplItems.remove(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    throw e;
  }
}, 'delete')
.pathParam('key', keySchema)
.response(null)
.summary('Remove a documentsJpl')
.description(dd`
  Deletes a documentsJpl from the database.
`);
