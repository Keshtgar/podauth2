import {auth, signOut} from "./auth";

auth({
  clientId: "2051121e4348af52664cf7de0bda",
  timeRemainingTimeout: 890,
  scope: "social:write",
  onNewToken:function (token) {
    document.getElementById("app").innerHTML = token
  }
});

document.getElementById("sign-out").onclick=function () {
  signOut();
};