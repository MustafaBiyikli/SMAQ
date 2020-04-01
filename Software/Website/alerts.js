$(document).ready(function() {
    var api = "./csv/api.csv";

    function evaluateForAlert([
        tStamp,
        ALS,
        PR,
        T,
        P,
        H,
        A,
        MIC,
        NH3,
        NO2,
        CO
    ]) {
        if (T > 40) sendAlert(0, "Temperature is high", tStamp);
    }

    /**
     *
     * @param {number} status 0:Warning, 1:Error, 2:Info or 3:Success
     * @param {string} message Warning message
     * @param {timeStamp} date Date of the event in time stamp
     */
    function sendAlert(status, message, date) {
        // find class alerts
        // append
        // switch (status) - add correct id
        // change p into message
        // change a into date
    }

    // if empty: "There is no alerts"

    setInterval(function() {
        $.ajax({
            type: "GET",
            url: api,
            dataType: "text",
            success: function(dataRead) {
                var apiData = parseFloat(dataRead.split(","));
                evaluateForAlert(apiData);
            }
        });

        // read all a
        // compare date with now
        // if date is older than week - delete
    }, 1000);
});
