/**
* Copyright © 2016, ACM@UIUC
*
* This file is part of the Groot Project.  
* 
* The Groot Project is open source software, released under the University of
* Illinois/NCSA Open Source License. You should have received a copy of
* this license in a file with the distribution.
**/

// General post request that serves to `server.js`
function post(serialized_data) {
    var xhr = new XMLHttpRequest();
    var url = window.location.pathname;
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    xhr.send(JSON.stringify(serialized_data));
}

// Variable to store your files
var resumeBase64String;

function readResumeAsString() {
    var reader = new FileReader();
    var file = document.querySelector('input[type=file]').files[0];
    reader.addEventListener("load", function () {
        resumeBase64String = reader.result;
    });
    if (file) {
        reader.readAsDataURL(file);
    }
}

function send_resume(e) {
    var form_metadata = $('#uploadResume').serializeArray();

    var serialized_data = {};
    form_metadata.forEach(function (form_input) {
        serialized_data[form_input.name] = form_input.value;
    });
    serialized_data["resume"] = resumeBase64String;
    post(serialized_data);
}

function send_job(e) {
    var form_metadata = $('#uploadJob').serializeArray();

    var serialized_data = {};
    form_metadata.forEach(function (form_input) {
        serialized_data[form_input.name] = form_input.value;
    });
    post(serialized_data);
}

// Add events
$('#resume').on('change', readResumeAsString);