const { Resend } = require("resend");

const resend = new Resend(
    process.env.RESEND_API_KEY
);

async function sendWelcomeEmail(
    email,
    pnr
) {

    await resend.emails.send({

        from: "Rail Mentor <onboarding@resend.dev>",

        to: email,

        subject: "Rail Mentor Tracking Activated",

        html: `
        <div style="font-family:Arial,sans-serif;padding:20px;">

            <h2 style="color:#005baa;">
                Welcome to Rail Mentor
            </h2>

            <p>
                Thank you for subscribing to PNR tracking.
            </p>

            <p>
                Your PNR is now being monitored.
            </p>

            <p>
                <strong>PNR Number:</strong>
                ${pnr}
            </p>

            <p>
                Any future changes in ticket status
                will be sent automatically via email.
            </p>

            <hr>

            <p style="font-size:12px;color:#777;">
                Sanket Phadtare © 2026 Rail Mentor
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

    console.log("EMAIL DATA");
    console.log("OLD STATUS:", oldStatus);
    console.log("NEW STATUS:", newStatus);

    await resend.emails.send({

        from: "Rail Mentor <onboarding@resend.dev>",

        to: email,

        subject: `PNR Status Updated - ${pnr}`,

        html: `
        <div style="font-family:Arial,sans-serif;padding:20px;">

            <h2 style="color:#005baa;">
                Rail Mentor Alert
            </h2>

            <p>
                Your PNR status has changed.
            </p>

            <table
                style="
                    width:100%;
                    border-collapse:collapse;
                "
            >

                <tr>
                    <td>
                        <strong>Train</strong>
                    </td>

                    <td>
                        ${trainName}
                    </td>
                </tr>

                <tr>
                    <td>
                        <strong>PNR</strong>
                    </td>

                    <td>
                        ${pnr}
                    </td>
                </tr>

                <tr>
                    <td>
                        <strong>Previous Status</strong>
                    </td>

                    <td>
                        ${oldStatus}
                    </td>
                </tr>

                <tr>
                    <td>
                        <strong>Current Status</strong>
                    </td>

                    <td>
                        ${newStatus}
                    </td>
                </tr>

            </table>

            <br>

            <p>
                Thank you for using Rail Mentor.
            </p>

            <hr>

            <p style="font-size:12px;color:#777;">
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