/**
* Copyright © 2016, ACM@UIUC
*
* This file is part of the Groot Project.  
* 
* The Groot Project is open source software, released under the University of
* Illinois/NCSA Open Source License. You should have received a copy of
* this license in a file with the distribution.
**/

// Variable to store your files
var resumeBase64String;


// Add events
$('#resume').on('change', readResumeAsString);

function readResumeAsString() {
    var reader = new FileReader();
    var file = document.querySelector('input[type=file]').files[0];
    console.log(file);
    reader.addEventListener("load", function() {
        resumeBase64String = reader.result;
    });
    if (file) {
        reader.readAsDataURL(file);
    }
  
}

function send_resume(e) {
    var form_metadata = $('#uploadResume').serializeArray();

    var serialized_data = {}
    form_metadata.forEach(function(form_input) {
        serialized_data[form_input["name"]] = form_input["value"];
    });

    serialized_data["resume"] = resumeBase64String;
    //console.log(serialized_data);
    
    xhr = new XMLHttpRequest();
    var url = window.location.pathname;
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            console.log(serialized_data);
        }
    }
    xhr.send(JSON.stringify(serialized_data));

    // $.ajax({
    //     url: window.location.pathname,
    //     type: "POST",
    //     dataType: "json",
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     data: serialized_data,
    //     success: function(data) {
    //         console.log(data);
    //         // TODO show something after successful upload
    //     },
    //     error: function(res, err) {
    //         console.log(res);
    //     }
    // });
}