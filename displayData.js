

var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";

function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
        "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}

function readPatientEHRId()
{
    sessionId = getSessionId();

    var ehrId = $("#nameToEHR").val();

    /**
     *  make sure data boxes exist and aren't empty
     **/

    if (!ehrId || ehrId.trim().length == 0) {
        $("#ehrIDReceived").html("<div class='alert alert-danger' role='alert'><a href='#' class='alert-link'><center>Oops, data box seems to be empty!</center></a></div>");
        $("#ehrIDReceived").show();
    } else {
        $.ajax({
            url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
            type: 'GET',
            headers: {"Ehr-Session": sessionId},
            success: function (data) {
                var party = data.party;
                $("#ehrMessage").html("<div class='alert alert-success' role='alert'><a href='#' class='alert-link'><center>Received patient data.</center></a></div>");
                $("#nameRec").val(party.firstNames);
                $("#surnameRec").val(party.lastNames);
                $("#birthDateRec").val(party.dateOfBirth);

                $("#ehrIDReceived").show();
                $("#recordHideButton").show();

                console.log("Patient '" + party.firstNames + " " + party.lastNames + "', born on '" + party.dateOfBirth + "'.");
            },
            error: function(err) {
                $("#ehrMessage").html("<div class='alert alert-danger' role='alert'><a href='#' class='alert-link'><center>Error '" + JSON.parse(err.responseText).userMessage + "'!" +"</center></a></div>");
                $("#ehrMessage").show();
                console.log(JSON.parse(err.responseText).userMessage);
            }
        });
    }
}

function revealPatientRecords()
{

    var eid = $("#nameToEHR").val();
    $("#ehrDataIn").val(eid);
    $("#dataForm").show();

}

function vitalSignsHistory()
{
    sessionId = getSessionId();

    var ehrId = $("#nameToEHR").val();

    if (!ehrId || ehrId.trim().length == 0 ) {
        $("#ehrIDReceived").html("<div class='alert alert-danger' role='alert'><a href='#' class='alert-link'><center>Oops, data box seems to be empty!</center></a></div>");
        $("#ehrIDReceived").show();
    } else {
        $.ajax(
        {
            url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
            type: 'GET',
            headers: {"Ehr-Session": sessionId},
            success: function (data)
            {
                var party=data.party;

                    var AQL =
                        "select "+
                        "t/data[at0002]/events[at0003]/time/value as date, "+
                        "t/data[at0002]/events[at0003]/data[at0001]/items[at0004, 'Body weight']/value as weight, "+
                        "t/data[at0001]/events[at0002]/data[at0003]/items[at0004, 'Body Height/Length']/value as height, "+
                        "t/data[at0001]/events[at0002]/data[at0003]/items[at0004]/value as bmi, "+
                        "t/data[at0001]/events[at0006]/data[at0003]/items[at0004]/value as systolic, "+
                        "t/data[at0001]/events[at0006]/data[at0003]/items[at0005]/value as diastolic, "+
                        "t/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value as rate, "+
                        "from EHR e[e/ehr_id/value='" + ehrId + "'] " +
                        "contains ( "+
                        "OBSERVATION t[openEHR-EHR-OBSERVATION.body_weight.v1] and "+
                        "OBSERVATION t[openEHR-EHR-OBSERVATION.height.v1] and "+
                        "OBSERVATION t[openEHR-EHR-OBSERVATION.body_mass_index.v1] and "+
                        "OBSERVATION t[openEHR-EHR-OBSERVATION.blood_pressure.v1] and "+
                        "OBSERVATION t[openEHR-EHR-OBSERVATION.heart_rate-pulse.v1]) "+
                        "order by t/data[at0002]/events[at0003]/time/value desc " +
                        "limit 10";

                    $.ajax({
                        url: baseUrl + "/query?" + $.param({"aql": AQL}),
                        type: 'GET',
                        headers: {"Ehr-Session": sessionId},
                        success: function (res) {

                            var results = "<table class='table table-striped table-hover'><tr><th>Date time</th><th class='text-right'>Weight </th><th class='text-right'>Height </th><th class='text-right'>BMI </th><th class='text-right'>Systolic </th><th class='text-right'>Diastolic </th><th class='text-right'>Pulse </th></tr>";
                            if (res) {
                                var rows = res.resultSet;
                                for (var i in rows) {
                                    results += "<tr><td>" + rows[i].date + "</td><td class='text-right'>" + rows[i].weight + rows[i].height + rows[i].bmi + rows[i].systolic + rows[i].diastolic + rows[i].rate +"</td>";
                                }
                                results += "</table>";
                                $("#dataRecordsDisplay").append(results);
                            } else {
                                $("#patientMessage").html("<div class='alert alert-danger' role='alert'><a href='#' class='alert-link'><center>Error: No data aquirred!</center></a></div>");
                                $("#patientMessage").show();
                            }

                        },
                        error: function() {
                            $("#patientMessage").html("<div class='alert alert-danger' role='alert'><a href='#' class='alert-link'><center>Error '" + JSON.parse(err.responseText).userMessage + "'!" +"</center></a></div>");
                            $("#patientMessage").show();
                        }
                    });
            },
            error: function(err) {
                $("#patientMessage").html("<div class='alert alert-danger' role='alert'><a href='#' class='alert-link'><center>Error '" + JSON.parse(err.responseText).userMessage + "'!" +"</center></a></div>");
                $("#patientMessage").show();
            }
        });
    }

}


$(document).ready(function() {
    $('#readSelectedPatient').change(function() {
        $("#nameToEHR").val($(this).val());
    });

});