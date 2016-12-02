// Variable to store your files
var resumeBase64String;

const SERVICES_URL = "http://localhost:8000";

// Add events
$('#resume').on('change', readResumeAsString);

function readResumeAsString() {
    var reader = new FileReader();
    reader.onloadend = function() {
        resumeBase64String = this.result;
    };
    reader.readAsDataURL(event.target.files[0]);
}

function send_resume(e) {
    var form_metadata = $('#uploadForm').serializeArray();

    var serialized_data = {}
    form_metadata.forEach(function(form_input) {
        serialized_data[form_input["name"]] = form_input["value"];
    });

    serialized_data["resume"] = resumeBase64String;

    $.ajax({
        url: `${SERVICES_URL}/resumes`, // TODO change to Groot API GATEWAY
        type: "POST",
        dataType: "json",
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        data: serialized_data,
        success: function(data) {
            console.log(data);
            // TODO show something after successful upload
        },
        error: function(res, err) {
            console.log(res);
        }
    });
}