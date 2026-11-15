async function checkPNR() {

    const pnr = document.getElementById("pnr").value.trim();
    const result = document.getElementById("result");

    if (!pnr) {
        result.innerHTML = `
            <div class="error">
                Please enter a PNR number.
            </div>
        `;
        return;
    }

    if (pnr.length !== 10) {
        result.innerHTML = `
            <div class="error">
                Please enter a valid 10-digit PNR number.
            </div>
        `;
        return;
    }

    result.innerHTML = `
        <div class="loading">
            Checking PNR Status...
        </div>
    `;

    try {

        const response = await fetch(`/api/pnr/${pnr}`);

        if (!response.ok) {
            throw new Error("Unable to fetch PNR details.");
        }

        const json = await response.json();

        if (!json.success || !json.data) {
            throw new Error("PNR not found.");
        }

        const data = json.data;

        let firstPassengerStatus =
            data.passengers?.length > 0
            ? data.passengers[0].raw
            : "N/A";

        let statusClass = "cnf";

        if (firstPassengerStatus.includes("RAC")) {
            statusClass = "rac";
        }

        if (
            firstPassengerStatus.includes("WL") ||
            firstPassengerStatus.includes("GNWL") ||
            firstPassengerStatus.includes("RLWL") ||
            firstPassengerStatus.includes("PQWL")
        ) {
            statusClass = "wl";
        }

        let passengerHTML = "";

        data.passengers.forEach((passenger) => {

            let pClass = "cnf";

            if (passenger.raw.includes("RAC")) {
                pClass = "rac";
            }

            if (
                passenger.raw.includes("WL") ||
                passenger.raw.includes("GNWL") ||
                passenger.raw.includes("RLWL") ||
                passenger.raw.includes("PQWL")
            ) {
                pClass = "wl";
            }

            passengerHTML += `
                <div class="passenger">

                    <div class="passenger-no">
                        Passenger ${passenger.number}
                    </div>

                    <div class="status ${pClass}">
                        ${passenger.raw}
                    </div>

                </div>
            `;
        });

        result.innerHTML = `

        <div class="card">

            <div class="train-header">

                <h2>${data.trainName}</h2>

                <p>Train No. ${data.trainNumber}</p>

            </div>

            <div class="pnr-status-banner">

                <div class="status-title">
                    Current PNR Status
                </div>

                <div class="status-value ${statusClass}">
                    ${firstPassengerStatus}
                </div>

            </div>

            <div class="route">

                <span>${data.from.code}</span>

                <span class="route-arrow">→</span>

                <span>${data.to.code}</span>

            </div>

            <div class="section-title">
                Passenger Status
            </div>

            ${passengerHTML}

            <div class="details">

                <div class="details-grid">

                    <div class="info-box">
                        <label>PNR Number</label>
                        <span>${data.pnr}</span>
                    </div>

                    <div class="info-box">
                        <label>Train Number</label>
                        <span>${data.trainNumber}</span>
                    </div>

                    <div class="info-box">
                        <label>Class</label>
                        <span>${data.class}</span>
                    </div>

                    <div class="info-box">
                        <label>Quota</label>
                        <span>${data.quota}</span>
                    </div>

                    <div class="info-box">
                        <label>From</label>
                        <span>${data.from.code}</span>
                    </div>

                    <div class="info-box">
                        <label>To</label>
                        <span>${data.to.code}</span>
                    </div>

                    <div class="info-box">
                        <label>Journey Date</label>
                        <span>${data.journeyDate}</span>
                    </div>

                    <div class="info-box">
                        <label>Chart Status</label>
                        <span>${data.chartStatus}</span>
                    </div>

                </div>

            </div>

        </div>

        `;

    } catch (error) {

        console.error(error);

        result.innerHTML = `
            <div class="error">
                ${error.message}
            </div>
        `;
    }
}

async function trackPNR() {

    const pnr =
        document.getElementById("pnr").value.trim();

    const email =
        document.getElementById("email").value.trim();

    if (!pnr || pnr.length !== 10) {

        alert("Please enter a valid PNR number.");

        return;
    }

    if (!email) {

        alert("Please enter an email address.");

        return;
    }

    try {

        const response = await fetch(
            "/api/track",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    pnr,
                    email
                })
            }
        );

        const result = await response.json();

        if (result.success) {

            alert(
                "PNR tracking enabled successfully. Email alerts will be sent whenever status changes."
            );

        } else {

            alert(
                result.message || "Failed to enable tracking."
            );

        }

    } catch (error) {

        console.error(error);

        alert("Unable to start tracking.");
    }
}

document.addEventListener("DOMContentLoaded", () => {

    const pnrInput =
        document.getElementById("pnr");

    if (pnrInput) {

        pnrInput.addEventListener(
            "keypress",
            function (e) {

                if (e.key === "Enter") {
                    checkPNR();
                }

            }
        );
    }

});