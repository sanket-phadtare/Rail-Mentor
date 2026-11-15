const { Resend } = require("resend");

const resend = new Resend(
    process.env.RESEND_API_KEY
);

async function sendWelcomeEmail(email, pnr) {

    await resend.emails.send({

        from: "Rail Mentor <onboarding@resend.dev>",

        to: email,

        subject: "Rail Mentor Tracking Activated",

        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">

                <h2 style="color:#005baa;">
                    Welcome to Rail Mentor
                </h2>

                <p>
                    Thank you for subscribing to PNR tracking.
                </p>

                <p>
                    We are now monitoring the following PNR:
                </p>

                <div style="
                    background:#f5f7fb;
                    padding:15px;
                    border-radius:8px;
                    margin:15px 0;
                ">
                    <strong>PNR:</strong> ${pnr}
                </div>

                <p>
                    Any changes in your PNR status will be notified instantly via email.
                </p>

                <p>
                    Examples:
                </p>

                <ul>
                    <li>WL → RAC</li>
                    <li>RAC → CNF</li>
                    <li>Seat Allocation Changes</li>
                </ul>

                <p>
                    Thank you for using Rail Mentor.
                </p>

                <hr>

                <p style="font-size:12px;color:#666;">
                    © 2026 Rail Mentor
                </p>

            </div>
        `
    });

}

async function sendStatusChangeEmail(
    email,
    pnr,
    oldStatus,
    newStatus,
    trainName
) {

    await resend.emails.send({

        from: "Rail Mentor <onboarding@resend.dev>",

        to: email,

        subject: `PNR Status Updated - ${pnr}`,

        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">

                <h2 style="color:#005baa;">
                    Rail Mentor Alert
                </h2>

                <p>
                    Your PNR status has changed.
                </p>

                <table style="width:100%; border-collapse:collapse;">

                    <tr>
                        <td><strong>Train</strong></td>
                        <td>${trainName}</td>
                    </tr>

                    <tr>
                        <td><strong>PNR</strong></td>
                        <td>${pnr}</td>
                    </tr>

                    <tr>
                        <td><strong>Previous Status</strong></td>
                        <td>${oldStatus}</td>
                    </tr>

                    <tr>
                        <td><strong>Current Status</strong></td>
                        <td>${newStatus}</td>
                    </tr>

                </table>

                <br>

                <p>
                    Thank you for using Rail Mentor.
                </p>

                <hr>

                <p style="font-size:12px;color:#666;">
                    © 2026 Rail Mentor
                </p>

            </div>
        `
    });

}

module.exports = {
    sendWelcomeEmail,
    sendStatusChangeEmail
};