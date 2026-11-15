require("dotenv").config();

/* START CRON SERVICE */
require("./cron");

const express = require("express");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");

const app = express();

/* =========================
   DATABASE
========================= */

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

/* =========================
   MIDDLEWARE
========================= */

app.use(cors());

app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

/* =========================
   TEST DATABASE
========================= */

pool.connect()
    .then(() => {
        console.log("PostgreSQL Connected");
    })
    .catch((err) => {
        console.error(
            "Database Connection Error:",
            err.message
        );
    });

/* =========================
   GET PNR STATUS
========================= */

app.get("/api/pnr/:pnr", async (req, res) => {

    try {

        const pnr = req.params.pnr;

        const response = await fetch(
            `https://api.irctc.dev/api/v1/pnr/${pnr}`,
            {
                method: "GET",
                headers: {
                    "x-api-key":
                        process.env.IRCTC_API_KEY,
                    "accept":
                        "application/json"
                }
            }
        );

        const data =
            await response.json();

        res.json(data);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});

/* =========================
   TRACK PNR
========================= */

app.post("/api/track", async (req, res) => {

    try {

        const { pnr, email } = req.body;

        if (!pnr || !email) {

            return res.status(400).json({
                success: false,
                message:
                    "PNR and Email are required"
            });

        }

        const response = await fetch(
            `https://api.irctc.dev/api/v1/pnr/${pnr}`,
            {
                method: "GET",
                headers: {
                    "x-api-key":
                        process.env.IRCTC_API_KEY,
                    "accept":
                        "application/json"
                }
            }
        );

        const pnrData =
            await response.json();

        if (!pnrData.success) {

            return res.status(400).json({
                success: false,
                message: "Invalid PNR"
            });

        }

        const currentStatus =
            pnrData.data.passengers[0].raw;

        const trainName =
            pnrData.data.trainName;

        const existing =
            await pool.query(
                `
                SELECT *
                FROM pnr_tracking
                WHERE pnr=$1
                AND email=$2
                `,
                [pnr, email]
            );

        if (existing.rows.length > 0) {

            return res.json({
                success: true,
                message:
                    "Tracking already enabled"
            });

        }

        await pool.query(
            `
            INSERT INTO pnr_tracking
            (
                pnr,
                email,
                current_status,
                train_name
            )
            VALUES ($1,$2,$3,$4)
            `,
            [
                pnr,
                email,
                currentStatus,
                trainName
            ]
        );

        res.json({
            success: true,
            message:
                "Tracking started successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});

/* =========================
   GET ALL TRACKING RECORDS
========================= */

app.get("/api/tracking", async (req, res) => {

    try {

        const result =
            await pool.query(
                `
                SELECT *
                FROM pnr_tracking
                ORDER BY created_at DESC
                `
            );

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});

/* =========================
   SERVE FRONTEND
========================= */

app.get("*", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );

});

/* =========================
   START SERVER
========================= */

const PORT =
    process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(
        `Rail Mentor running on port ${PORT}`
    );

});