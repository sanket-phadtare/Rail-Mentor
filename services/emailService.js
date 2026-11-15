const { Resend } = require("resend");

const resend = new Resend(
    process.env.RESEND_API_KEY
);

async function sendStatusChangeEmail(
    email,
    pnr,
    oldStatus,
    newStatus
){

    await resend.emails.send({

        from: 'Rail Mentor <alerts@yourdomain.com>',

        to: email,

        subject: `PNR Status Changed - ${pnr}`,

        html: `
        <h2>Rail Mentor Alert</h2>

        <p>Your PNR status has changed.</p>

        <p>
        <strong>PNR:</strong>
        ${pnr}
        </p>

        <p>
        <strong>Previous:</strong>
        ${oldStatus}
        </p>

        <p>
        <strong>Current:</strong>
        ${newStatus}
        </p>
        `
    });

}

module.exports = {
    sendStatusChangeEmail
};
