const express = require("express");
const router = express.Router();

router.post("/track", async (req, res) => {

    try {

        const { pnr, email } = req.body;

        console.log("Tracking Request:");
        console.log(pnr);
        console.log(email);

        return res.json({
            success: true,
            message: "Tracking started"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
});

module.exports = router;