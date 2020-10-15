const express = require('express');
const router = express.Router();

router.get('*', (req, res, next) => {
    res.status(404);
    res.render('errors/404-not-found');
});

module.exports = router;