require("dotenv").config();

const cron = require("node-cron");
const { Pool } = require("pg");

const {
    sendStatusChangeEmail
} = require("./services/emailService");

console.log("================================");
console.log("Cron Service Started");
console.log("================================");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

cron.schedule("*/5 * * * *", async () => {

    console.log("--------------------------------");
    console.log(
        `Checking PNR Updates : ${new Date().toLocaleString()}`
    );
    console.log("--------------------------------");

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
                        headers: {
                            "x-api-key":
                                process.env.IRCTC_API_KEY,
                            "accept":
                                "application/json"
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

                const latestStatus =
                    latestData.data.passengers[0].raw;

                console.log(
                    "Database Status :",
                    item.current_status
                );

                console.log(
                    "Live API Status :",
                    latestStatus
                );

                if (
                    latestStatus !==
                    item.current_status
                ) {

                    console.log("");
                    console.log(
                        "STATUS CHANGE DETECTED"
                    );

                    console.log(
                        `OLD : ${item.current_status}`
                    );

                    console.log(
                        `NEW : ${latestStatus}`
                    );

                    try {

                        await sendStatusChangeEmail(
                            item.email,
                            item.pnr,
                            item.current_status,
                            latestStatus,
                            latestData.data.trainName
                        );

                        console.log(
                            `Email sent to ${item.email}`
                        );

                    } catch (emailError) {

                        console.error(
                            "Email Send Failed:",
                            emailError.message
                        );
                    }

                    await pool.query(
                        `
                        UPDATE pnr_tracking
                        SET current_status = $1
                        WHERE id = $2
                        `,
                        [
                            latestStatus,
                            item.id
                        ]
                    );

                    console.log(
                        "Database Updated"
                    );

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
                            item.current_status,
                            latestStatus
                        ]
                    );

                    console.log(
                        "History Saved"
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