import Hashes from "jshashes";
import randomString from "random-string";
import queryString from "query-string";
import cookie from "js-cookie";

let codeVerifierStr = cookie.get("codeVerifier");
let codeChallengeStr;
let refreshTokenStr;
let clientId;
let redirectUri;
let onNewToken = e => {};
let timeRemainingTimeout = 90;
const baseUrl = "https://accounts.pod.land/oauth2";
const urlGenerator = () => `${baseUrl}/authorize/index.html?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&code_challenge_method=S256&code_
challenge=${codeChallengeStr}`;

function codeVerifier() {
  if (codeVerifierStr) {
    return codeVerifierStr;
  }
  codeVerifierStr = randomString({length: 10});
  cookie.set("codeVerifier", codeVerifierStr);
}

function codeChallenge() {
  if (codeChallengeStr) {
    return codeChallengeStr;
  }
  codeChallengeStr = new Hashes.SHA256().b64(codeVerifierStr).replace(/\+/g, "-").replace(/\//g, "_").replace(/\=+$/, "");
  return codeChallengeStr;
}

function generateToken() {
  return new Promise((resolve, reject) => {
    const parsedQueryParam = queryString.parse(location.search);
    const code = parsedQueryParam.code;
    if (!code) {
      codeVerifier();
      codeChallenge();
      location.href = urlGenerator();
      return;
    }
    makeRequest().then(response => {
      refreshTokenStr = response.refresh_token;
      onTokenExpire((response.expires_in - timeRemainingTimeout) * 1000);
      resolve(response.access_token);
    });
  });
}

function refreshToken() {
  return new Promise((resolve, reject) => {
    makeRequest(true).then(response => {
      refreshTokenStr = response.refresh_token;
      onTokenExpire((response.expires_in - timeRemainingTimeout) * 1000);
      resolve(response.access_token);
    });
  });
}

function onTokenExpire(timout) {
  setTimeout(e => {
    refreshToken().then(onNewToken);
  }, timout);
}

function makeRequest(isRefresh) {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", `${baseUrl}/token`, true);
    let baseObject = {
      grant_type: isRefresh ? "refresh_token" : "authorization_code",
      client_id: clientId,
      code_verifier: codeVerifierStr
    };

    if (isRefresh) {
      baseObject = {...baseObject, ...{refresh_token: refreshTokenStr}};
    } else {
      const parsedQueryParam = queryString.parse(location.search);
      const code = parsedQueryParam.code;
      baseObject = {...baseObject, ...{redirect_uri: redirectUri, code}};
    }

    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = function (e) {
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        if (xhr.readyState === 4) {
          resolve(JSON.parse(xhr.response));
        }
      }
    };
    xhr.send(queryString.stringify(baseObject));
  });
}


function auth(config) {
  clientId = config.clientId;
  redirectUri = config.redirectUri || `${window.location.protocol}//${window.location.hostname}`;
  onNewToken = config.onNewToken;
  timeRemainingTimeout = config.timeRemainingTimeout || 90;
  if (refreshTokenStr) {
    return refreshToken().then(onNewToken);
  }
  return generateToken().then(onNewToken);
}

export {auth};
