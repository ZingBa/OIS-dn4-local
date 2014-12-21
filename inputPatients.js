
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

function createPatientEHR()
{
    sessionId = getSessionId();

    var name = $("#createName").val();
    var surname = $("#createSurname").val();
    var dateOfBirth = $("#createDateOfBirth").val();

    /**
     *  make sure data boxes exist and aren't empty
     **/

    if(!name || !surname || !dateOfBirth || name.trim().length == 0 || surname.trim().length == 0 || dateOfBirth.trim().length == 0)
    {
        $("#patientCreatedEHR").html("<div class='alert alert-danger' role='alert'><a href='#' class='alert-link'><center>Oops, some data seems to be missing!</center></a></div>");
        $("#patientCreatedEHR").show();
    }else
    {

        $.ajaxSetup(
        {
            headers:
            {
                "Ehr-Session": sessionId
            }
        });
        $.ajax(
        {
            url: baseUrl + "/ehr",
            type: 'POST',
            success: function (data)
            {
                var ehrId = data.ehrId;
                $("#header").html("EHR: " + ehrId);

                // build party data
                var partyData =
                {
                    firstNames: name,
                    lastNames: surname,
                    dateOfBirth: dateOfBirth,
                    partyAdditionalInfo:
                    [
                        {
                            key: "ehrId",
                            value: ehrId
                        }
                    ]
                };
                $.ajax({
                    url: baseUrl + "/demographics/party",
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(partyData),
                    success: function (party)
                    {
                        if (party.action == 'CREATE') {

                            $("#patientCreatedEHR").html("<div class='alert alert-success' role='alert'><a href='#' class='alert-link'><center>Successfully created EHR '" + ehrId + "' !</center></a></div>");
                            $("#patientCreatedEHR").show();
                            $("#idWindowsDisplay").val(ehrId);
                            $("#idDisplay").show();
                            console.log("Uspešno kreiran EHR '" + ehrId + "'.");
                        }
                    },
                    error: function(err)
                    {
                        $("#patientCreatedEHR").html("<div class='alert alert-danger' role='alert'><a href='#' class='alert-link'><center>Error '" + JSON.parse(err.responseText).userMessage + "'!" +"</center></a></div>");
                        $("#patientCreatedEHR").show();
                        console.log(JSON.parse(err.responseText).userMessage);
                    }
                });
            }
        });
    }
}


$(document).ready(function() {

    $('#readSelectedPatient').change(function() {
        $("#createPatient").html("");
        var data = $(this).val().split(",");
        $("#createName").val(data[0]);
        $("#createSurname").val(data[1]);
        $("#createDateOfBirth").val(data[2]);
    });
    $("#patientCreatedEHR").click(function () {
        $("div").show;
    });

});