const express = require('express');
const router = express.Router();

router.get('/session/:token', (req, res) => {
  const token = req.params.token;
  // Example session verification
  res.json({
    token,
    active: true,
    user: "jason@reapwallet",
    expires: "2025-12-31"
  });
});

module.exports = router;