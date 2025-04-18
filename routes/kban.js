const express = require('express');
const router = express.Router();

router.get('/kban/:id', (req, res) => {
  const kban = req.params.id;
  // Example response logic
  res.json({
    kban,
    isValid: true,
    branchCode: "LA001",
    assignedTo: "Jason",
    issuedOn: "2025-04-17"
  });
});

module.exports = router;