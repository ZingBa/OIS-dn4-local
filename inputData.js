
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

    /*
    *   code addition

     option value="8660098f-f5fc-4501-870e-249ace450794">Stric Matic</option>
     <option value="f9f3913e-60aa-4474-a4aa-110e7b36d938">Teta Peta</option>
     <option value="edb61f13-d9e7-4ccf-ab6c-4733ab31e40f">Sin Pobalin</option>

    * */

    if(ehrId == "8660098f-f5fc-4501-870e-249ace450794")
    {
        $('#dateIn').val("1998-12-20T14:55");
        $('#doctorIn').val("Pevec Malina");
        $("#problemsIn").val("Pneumonia");
        $("#weightIn").val("70");
        $("#heightIn").val("180");
        $("#BMIin").val("21.60");
        $("#systolicIn").val("131");
        $("#diastolicIn").val("88");
        $("#pulseIn").val("78");
        $("#tempIn").val("37.5");
        $("#oxygenIn").val("95");
    }
    else if(ehrId == "f9f3913e-60aa-4474-a4aa-110e7b36d938")
    {
        $('#dateIn').val("2002-08-12T12:15");
        $('#doctorIn').val("Marija Novak");
        $("#problemsIn").val("High blood sugar");
        $("#weightIn").val("80");
        $("#heightIn").val("165");
        $("#BMIin").val("29.38");
        $("#systolicIn").val("145");
        $("#diastolicIn").val("92");
        $("#pulseIn").val("88");
        $("#tempIn").val("35.9");
        $("#oxygenIn").val("96");
    }
    else if(ehrId == "edb61f13-d9e7-4ccf-ab6c-4733ab31e40f")
    {
        $('#dateIn').val("2012-03-25T21:59");
        $('#doctorIn').val("Miha Pomagac");
        $("#problemsIn").val("Broken Leg");
        $("#weightIn").val("82");
        $("#heightIn").val("191");
        $("#BMIin").val("22.48");
        $("#systolicIn").val("125");
        $("#diastolicIn").val("82");
        $("#pulseIn").val("74");
        $("#tempIn").val("36.2");
        $("#oxygenIn").val("99");
    }


}




function revealDataForm()
{

    var eid = $("#nameToEHR").val();
    $("#ehrDataIn").val(eid);
    $("#dataForm").show();

}


function newDataEntry()
{
    //console.log("enter data function");
    sessionId = getSessionId();

    var ehrId = $("#ehrDataIn").val();
    var date = $("#dateIn").val();
    var doc = $("#doctorIn").val();
    var problems = $("#problemsIn").val();
    var weight = $("#weightIn").val();
    var height = $("#heightIn").val();
    var bmi = $("#bmiIn").val();
    var systolic = $("#systolicIn").val();
    var diastolic = $("#diastolicIn").val();
    var pulse = $("#pulseIn").val();
    var temp = $("#tempIn").val();
    var oxygen = $("oxygenIn").val();


    if (!ehrId || ehrId.trim().length == 0)
    {
        $("#recordEntryMessage").html("<div class='alert alert-danger' role='alert'><a href='#' class='alert-link'><center>Oops, some data seems to be missing!</center></a></div>");
        $("#recordEntryMessage").show();
        console.log("ehrid");
    }
    /*else if(!bmi || bmi.trim().length == 0)
    {
        $("#recordEntrymessage").html("<div class='alert alert-danger' role='alert'><a href='#' class='alert-link'><center>You forgot to use BMI calculation button!</center></a></div>");
        $("#recordEntryMessage").show();
        console.log("bmi");
    }*/
    else
    {
        console.log("ajax");
        $.ajaxSetup(
        {
            headers:
            {
                "Ehr-Session": sessionId
            }
        });
        var data =
        {
            "ctx/language": "en",
            "ctx/territory": "SI",
            "ctx/time": date,
            "vital_signs/height_length/any_event/body_height_length": height,
            "vital_signs/body_weight/any_event/body_weight": weight,
            "vital_signs/body_mass_index/any_event/body_mass_index": bmi,
            "vital_signs/body_temperature/any_event/temperature|magnitude": temp,
            "vital_signs/body_temperature/any_event/temperature|unit": "°C",
            "vital_signs/blood_pressure/any_event/systolic": systolic,
            "vital_signs/blood_pressure/any_event/diastolic": diastolic,
            "vital_signs/pulse/any_event/rate": pulse,
            "vital_signs/indirect_oximetry:0/spo2|numerator": oxygen
        };
        var queryParams =
        {
            "ehrId": ehrId,
            templateId: 'Vital Signs',
            format: 'FLAT',
            committer: doc
        };
        $.ajax(
        {
            url: baseUrl + "/composition?" + $.param(queryParams),
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (res) {
                $("#recordEntryMessage").html("<div class='alert alert-success' role='alert'><a href='#' class='alert-link'><center>Success: " + res.meta.href + " .</center></a></div>");
                $("#recordEntryMessage").show();
                //console.log("data was succes");
                console.log(res.meta.href);

            },
            error: function(err) {
                $("#recordEntryMessage").html("<div class='alert alert-danger' role='alert'><a href='#' class='alert-link'><center>Error '" + JSON.parse(err.responseText).userMessage + "' !" +"</center></a></div>");
                $("#recordEntryMessage").show();
                console.log(JSON.parse(err.responseText).userMessage);
            }
        });
    }


}

function calculateBMI()
{
    var BMI =0;
    var weight = $('#weightIn').val();
    var height = $('#heightIn').val()/100;
    BMI = (weight / (height * height)).toFixed(2);
    console.log(BMI);

    $("#BMIin").val(BMI);

}



$(document).ready(function() {
   $('#readSelectedPatient').change(function() {
        $("#nameToEHR").val($(this).val());
    });

});