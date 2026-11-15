require("dotenv").config();

const cron = require("node-cron");
const { Pool } = require("pg");

const {
    sendStatusChangeEmail
} = require("./services/emailService");

console.log("==================================");
console.log("Cron Service Started");
console.log("==================================");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

cron.schedule("0 */3 * * *", async () => {

    console.log("");
    console.log("==================================");
    console.log("Checking PNR Updates...");
    console.log(new Date().toLocaleString());
    console.log("==================================");

    try {

        const result = await pool.query(`
            SELECT *
            FROM pnr_tracking
            WHERE active = true
        `);

        console.log(
            `Tracked Records Found: ${result.rows.length}`
        );

        for (const item of result.rows) {

            try {

                console.log("");
                console.log(
                    `Checking PNR ${item.pnr}`
                );

                const response = await fetch(
                    `https://api.irctc.dev/api/v1/pnr/${item.pnr}`,
                    {
                        method: "GET",
                        headers: {
                            "x-api-key": process.env.IRCTC_API_KEY,
                            "accept": "application/json"
                        }
                    }
                );

                const latestData =
                    await response.json();

                if (
                    !latestData.success ||
                    !latestData.data ||
                    !latestData.data.passengers ||
                    latestData.data.passengers.length === 0
                ) {

                    console.log(
                        `Could not fetch latest status for ${item.pnr}`
                    );

                    continue;
                }

                /* -----------------------------
                   STORE OLD & NEW STATUS
                ----------------------------- */

                const oldStatus =
                    item.current_status;

                const newStatus =
                    latestData.data.passengers[0].raw;

                const trainName =
                    latestData.data.trainName;

                console.log(
                    "OLD STATUS:",
                    oldStatus
                );

                console.log(
                    "NEW STATUS:",
                    newStatus
                );

                /* -----------------------------
                   COMPARE
                ----------------------------- */

                if (oldStatus !== newStatus) {

                    console.log("");
                    console.log(
                        "STATUS CHANGE DETECTED"
                    );

                    console.log(
                        `PREVIOUS STATUS: ${oldStatus}`
                    );

                    console.log(
                        `CURRENT STATUS: ${newStatus}`
                    );

                    /* -----------------------------
                       SEND EMAIL FIRST
                    ----------------------------- */

                    try {

                        await sendStatusChangeEmail(
                            item.email,
                            item.pnr,
                            oldStatus,
                            newStatus,
                            trainName
                        );

                        console.log(
                            `Email Sent To ${item.email}`
                        );

                    } catch (emailError) {

                        console.error(
                            "Email Error:",
                            emailError.message
                        );

                    }

                    /* -----------------------------
                       SAVE HISTORY
                    ----------------------------- */

                    await pool.query(
                        `
                        INSERT INTO pnr_status_history
                        (
                            tracking_id,
                            old_status,
                            new_status
                        )
                        VALUES ($1,$2,$3)
                        `,
                        [
                            item.id,
                            oldStatus,
                            newStatus
                        ]
                    );

                    console.log(
                        "History Saved"
                    );

                    /* -----------------------------
                       UPDATE DATABASE
                    ----------------------------- */

                    await pool.query(
                        `
                        UPDATE pnr_tracking
                        SET current_status = $1
                        WHERE id = $2
                        `,
                        [
                            newStatus,
                            item.id
                        ]
                    );

                    console.log(
                        "Database Updated"
                    );

                } else {

                    console.log(
                        "No Status Change"
                    );

                }

            } catch (pnrError) {

                console.error(
                    `PNR ${item.pnr} Error:`,
                    pnrError.message
                );

            }

        }

    } catch (error) {

        console.error(
            "Cron Error:",
            error.message
        );

    }

});