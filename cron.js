require("dotenv").config();

console.log("Cron Service Started");

const cron = require("node-cron");
const pool = require("./db");

const {
    sendStatusChangeEmail
} = require("./services/emailService");

const {
    fetchPNR
} = require("./services/pnrService");

cron.schedule("*/5 * * * *", async () => {

    console.log(
        "Checking PNR updates..."
    );

    try {

        const result =
            await pool.query(
                `
                SELECT *
                FROM pnr_tracking
                WHERE active = true
                `
            );

        for (const item of result.rows) {

            try {

                const latestData =
                    await fetchPNR(
                        item.pnr
                    );

                if (
                    !latestData.success
                ) {
                    continue;
                }

                const latestStatus =
                    latestData
                    .data
                    .passengers[0]
                    .raw;

                if (
                    latestStatus !==
                    item.current_status
                ) {

                    console.log(
                        `Status Changed: ${item.pnr}`
                    );

                    await sendStatusChangeEmail(
                        item.email,
                        item.pnr,
                        item.current_status,
                        latestStatus,
                        latestData.data.trainName
                    );

                    await pool.query(
                        `
                        UPDATE pnr_tracking
                        SET current_status=$1
                        WHERE id=$2
                        `,
                        [
                            latestStatus,
                            item.id
                        ]
                    );

                    await pool.query(
                        `
                        INSERT INTO
                        pnr_status_history
                        (
                            tracking_id,
                            old_status,
                            new_status
                        )
                        VALUES($1,$2,$3)
                        `,
                        [
                            item.id,
                            item.current_status,
                            latestStatus
                        ]
                    );

                    console.log(
                        `Email sent to ${item.email}`
                    );
                }

            } catch (err) {

                console.error(
                    "PNR Error:",
                    err.message
                );
            }
        }

    } catch (err) {

        console.error(
            "Cron Error:",
            err.message
        );
    }

});