const express = require('express');
const router = express.Router();
const controller = require('../controllers/dataController');

router.get('/latest', controller.getLatest);
router.post('/data', controller.postData);
router.post('/fan', controller.updateFan);
router.post('/light', controller.updateLight);
router.get('/history', controller.getHistory);
router.get('/stats', controller.getStats);
router.get('/graph-data', controller.getGraph);




module.exports = router;
