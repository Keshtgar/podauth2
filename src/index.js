import {auth} from "./auth";

auth({
  clientId: "2051121e4348af52664cf7de0bda",
  timeRemainingTimeout: 890,
  onNewToken:function (token) {
    document.getElementById("app").innerHTML = token
  }
});
console.log("test")