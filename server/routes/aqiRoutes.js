const express = require('express');
const router  = express.Router();
const {
  getLatestOverview,
  getCityLatest,
  getCityHistory,
  compareCities,
  triggerCollectionJob,
  getHealthAdvisory,
} = require('../controllers/aqiController');

router.get('/latest',              getLatestOverview);
router.get('/latest/:cityName',    getCityLatest);
router.get('/history/:cityName',   getCityHistory);
router.post('/compare',            compareCities);
router.post('/trigger-fetch',      triggerCollectionJob);
router.get('/advisory/:category',  getHealthAdvisory);

module.exports = router;
