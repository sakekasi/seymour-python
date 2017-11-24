import $ from "jquery";

import {screenshot_base64} from "./lib";

let userIP = null;
$.getJSON("https://api.ipify.org/?format=json", function(e) {
  userIP = e.ip;
  console.log('IP', userIP);
});

export function uploadScreenshot(ip, image, message, positive) {
  $.ajax({
    type: 'POST',
    url: '/createScreenshot',
    data: JSON.stringify({ip, image, message, positive}),
    success: function() {
      $('#message').val('')
    },
    contentType:"application/json",
  });
}

document.addEventListener('keydown', function (e) {
  const code = e.which || e.keyCode;
  const str = String.fromCharCode(code);
  if (e.altKey && !e.ctrlKey && !e.metaKey && str === 'G') {
    positiveFeedback();
  } else if (e.altKey && !e.ctrlKey && !e.metaKey && str === 'B') {
    negativeFeedback();
  }
});

export function positiveFeedback() {
  console.log('positive feedback!');
  screenshot_base64(function(imageData) {
    let message = $('#message').val();
    uploadScreenshot(userIP, imageData, message, true);
  });
}

export function negativeFeedback() {
  console.log('negative feedback!');
  screenshot_base64(function(imageData) {
    let message = $('#message').val();
    uploadScreenshot(userIP, imageData, message, false);
  });
}

window.uploadScreenshot = uploadScreenshot;
window.positiveFeedback = positiveFeedback;
window.negativeFeedback = negativeFeedback;