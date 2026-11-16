const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({

    service: "gmail",

    auth: {

        user: process.env.EMAIL_USER,

        pass: process.env.EMAIL_PASS

    }

});

async function sendWelcomeEmail(
    email,
    pnr
) {

    await transporter.sendMail({

        from: `"Rail Mentor" <${process.env.EMAIL_USER}>`,

        to: email,

        subject: "Rail Mentor Tracking Activated",

        html: `
        <div style="
            font-family:Arial,sans-serif;
            max-width:600px;
            margin:auto;
            padding:20px;
        ">

            <h2 style="color:#005baa;">
                Welcome to Rail Mentor
            </h2>

            <p>
                Thank you for subscribing to PNR status tracking.
            </p>

            <p>
                We are now monitoring your booking.
            </p>

            <div style="
                background:#f5f7fb;
                border-radius:8px;
                padding:15px;
                margin:15px 0;
            ">

                <strong>PNR Number:</strong>
                ${pnr}

            </div>

            <p>
                Whenever the ticket status changes,
                Rail Mentor will automatically send
                an update email.
            </p>

            <hr>

            <p style="font-size:12px;color:#666;">

                Sanket Phadtare © 2026 Rail Mentor

            </p>

        </div>
        `

    });

}

async function sendStatusChangeEmail(
    email,
    pnr,
    previousStatus,
    currentStatus,
    trainName
) {

    console.log("EMAIL DATA");
    console.log("Previous:", previousStatus);
    console.log("Current :", currentStatus);

    await transporter.sendMail({

        from: `"Rail Mentor" <${process.env.EMAIL_USER}>`,

        to: email,

        subject: `PNR Status Updated - ${pnr}`,

        html: `
        <div style="
            font-family:Arial,sans-serif;
            max-width:650px;
            margin:auto;
            padding:20px;
        ">

            <h2 style="color:#005baa;">
                Rail Mentor Alert
            </h2>

            <p>
                A status change has been detected.
            </p>

            <table
                style="
                    width:100%;
                    border-collapse:collapse;
                "
            >

                <tr>
                    <td style="padding:8px;">
                        <strong>Train</strong>
                    </td>

                    <td style="padding:8px;">
                        ${trainName}
                    </td>
                </tr>

                <tr>
                    <td style="padding:8px;">
                        <strong>PNR Number</strong>
                    </td>

                    <td style="padding:8px;">
                        ${pnr}
                    </td>
                </tr>

                <tr>
                    <td style="padding:8px;">
                        <strong>Previous Status</strong>
                    </td>

                    <td style="padding:8px;color:#dc2626;">
                        ${previousStatus}
                    </td>
                </tr>

                <tr>
                    <td style="padding:8px;">
                        <strong>Current Status</strong>
                    </td>

                    <td style="padding:8px;color:#16a34a;">
                        ${currentStatus}
                    </td>
                </tr>

            </table>

            <br>

            <p>
                Thank you for using Rail Mentor.
            </p>

            <hr>

            <p style="font-size:12px;color:#666;">
                Sanket Phadtare © 2026 Rail Mentor
            </p>

        </div>
        `

    });

}

module.exports = {
    sendWelcomeEmail,
    sendStatusChangeEmail
};