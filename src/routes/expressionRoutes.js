const express = require('express');
const router = express.Router();
const expressionController = require('../controllers/expressionController');

/**
 * RESTful API Mapping
 */
router.post('/', expressionController.create);        // CREATE
router.get('/', expressionController.listPublic);     // READ ALL
router.get('/:id', expressionController.getOne);      // READ ONE
router.get('/my/all', expressionController.listMyExpressions); // MY PROJECTS
router.put('/:id', expressionController.update);      // UPDATE
router.delete('/:id', expressionController.delete);   // DELETE
router.get('/:id/download', expressionController.downloadAsFile); // EXTRA: Export
router.get('/:id/pdf', expressionController.generatePdf);        // PDF Export

module.exports = router;