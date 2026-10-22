const express = require('express');
const router  = express.Router();
const { getAllCities, addCity } = require('../controllers/cityController');

router.get('/',  getAllCities);
router.post('/', addCity);

module.exports = router;
