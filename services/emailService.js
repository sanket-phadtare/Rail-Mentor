const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({

    host: "smtp.gmail.com",

    port: 465,

    secure: true,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }

});

transporter.verify((error, success) => {

    if (error) {

        console.error(
            "SMTP Error:",
            error
        );

    } else {

        console.log(
            "✅ SMTP Server Ready"
        );

    }

});

async function sendWelcomeEmail(
    email,
    pnr
) {

    console.log(
        `Attempting to send welcome email to ${email}`
    );

    const info = await transporter.sendMail({

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
                Thank you for subscribing to PNR Tracking.
            </p>

            <p>
                We are now monitoring your ticket.
            </p>

            <div style="
                padding:15px;
                background:#f5f7fb;
                border-radius:8px;
                margin:15px 0;
            ">

                <strong>PNR Number:</strong>
                ${pnr}

            </div>

            <p>
                Any future changes in status
                will automatically be sent
                to this email address.
            </p>

            <hr>

            <p style="font-size:12px;color:#777;">

                Rail Mentor

            </p>

        </div>
        `
    });

    console.log(
        "✅ Welcome Email Sent:",
        info.messageId
    );
}

async function sendStatusChangeEmail(
    email,
    pnr,
    previousStatus,
    currentStatus,
    trainName
) {

    console.log("========== EMAIL DATA ==========");

    console.log(
        "PREVIOUS:",
        previousStatus
    );

    console.log(
        "CURRENT:",
        currentStatus
    );

    console.log("===============================");

    const info = await transporter.sendMail({

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
                Your ticket status has changed.
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

                    <td
                        style="
                            padding:8px;
                            color:#dc2626;
                            font-weight:bold;
                        "
                    >
                        ${previousStatus}
                    </td>

                </tr>

                <tr>

                    <td style="padding:8px;">
                        <strong>Current Status</strong>
                    </td>

                    <td
                        style="
                            padding:8px;
                            color:#16a34a;
                            font-weight:bold;
                        "
                    >
                        ${currentStatus}
                    </td>

                </tr>

            </table>

            <br>

            <p>
                Thank you for using Rail Mentor.
            </p>

            <hr>

            <p style="font-size:12px;color:#777;">
                Rail Mentor
            </p>

        </div>
        `
    });

    console.log(
        "✅ Status Update Email Sent:",
        info.messageId
    );
}

module.exports = {
    sendWelcomeEmail,
    sendStatusChangeEmail
};