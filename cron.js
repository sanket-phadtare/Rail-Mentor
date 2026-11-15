require("dotenv").config();

const cron = require("node-cron");

const pool = require("./db");

const {
    fetchPNR
} = require("./services/pnrService");

const {
    sendStatusChangeEmail
} = require("./services/emailService");

cron.schedule("*/5 * * * *", async ()=>{

    console.log("Checking PNR updates");

    const result =
    await pool.query(
        `SELECT * FROM pnr_tracking
         WHERE active=true`
    );

    for(const item of result.rows){

        try{

            const latest =
            await fetchPNR(item.pnr);

            const newStatus =
            latest.data.passengers[0].raw;

            if(
                newStatus !==
                item.current_status
            ){

                await sendStatusChangeEmail(

                    item.email,

                    item.pnr,

                    item.current_status,

                    newStatus
                );

                await pool.query(

                    `
                    UPDATE
                    pnr_tracking
                    SET current_status=$1
                    WHERE id=$2
                    `,

                    [
                        newStatus,
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
                        newStatus
                    ]
                );

            }

        }catch(err){

            console.log(err);

        }

    }

});