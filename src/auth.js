import Hashes from "jshashes";
import randomString from "random-string";
import queryString from "query-string";
import cookie from "js-cookie";


const defaultConfig = () => {
  return {
    onError: e => {
      return false;
    },
    onNewToken: e => {
    },
    onRetrying: e => {
    },
    codeVerifierStr: cookie.get("codeVerifier"),
    codeChallengeStr: null,
    retryTimeout: 3000,
    cookieTimeout: 365,
    refreshTokenStr: cookie.get("refreshToken"),
    clientId: null,
    redirectUri: `${window.location.protocol}//${window.location.hostname}`,
    timeRemainingTimeout: 90,
    ssoBaseUrl: "https://accounts.pod.ir/oauth2",
    scope: "profile",
    redirectTrigger: null,
    secure: false
  }
};
let authConfig = {};
let retryTimeoutCode;
let requestXHR;
let tokenExpireTimeoutCode;

function urlGenerator() {
  const {ssoBaseUrl, clientId, redirectUri, codeChallengeStr, scope} = authConfig;
  return `${ssoBaseUrl}/authorize/index.html?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&code_challenge_method=S256&code_challenge=${codeChallengeStr}&scope=${scope}`;
}

function codeVerifier() {
  const codeVerifierStrRand = authConfig.codeVerifierStr || randomString({length: 10});
  cookie.set("codeVerifier", authConfig.codeVerifierStr = codeVerifierStrRand, {expires: authConfig.cookieTimeout, secure: authConfig.secure});
}

function codeChallenge() {
  const {codeVerifierStr} = authConfig;
  return authConfig.codeChallengeStr = new Hashes.SHA256().b64(codeVerifierStr).replace(/\+/g, "-").replace(/\//g, "_").replace(/\=+$/, "");
}

function checkForLoginPageScenario(error) {
  if (error.error === "invalid_client" || error.error === "invalid_grant") {
    return true;
  }
}

function _refreshAndGenerateTokenErrorHandling(error) {
  const {onError, retryTimeout, onRetrying} = authConfig;
  if (onError(error) || checkForLoginPageScenario(error)) {
    reset();
    generateToken(true);
  }
  if (retryTimeout === 0) {
    return;
  }
  if (requestXHR) {
    requestXHR.abort();
    requestXHR = null;
  }
  if (onRetrying) {
    onRetrying();
  }
  clearTimeout(retryTimeoutCode);
  retryTimeoutCode = setTimeout(() => auth(window._podAuthConfig), retryTimeout);
}

function _refreshAndGenerateTokenSuccessHandling(resolve, response) {
  const {timeRemainingTimeout} = authConfig;
  cookie.remove("refreshToken");
  cookie.set("refreshToken", authConfig.refreshTokenStr = response.refresh_token, {expires: authConfig.cookieTimeout, secure: authConfig.secure});
  onTokenExpire((response.expires_in - timeRemainingTimeout) * 1000);
  resolve(response.access_token);
}

function generateToken(forceLoginPage) {
  const {redirectTrigger, onError} = authConfig;
  return new Promise((resolve, reject) => {
    const parsedQueryParam = queryString.parse(location.search);
    const code = parsedQueryParam.code;
    if (!code || forceLoginPage) {
      reset();
      codeVerifier();
      codeChallenge();
      if (redirectTrigger) {
        if (redirectTrigger()) {
          location.href = urlGenerator();
        }
      } else {
        location.href = urlGenerator();
      }
      return;
    }
    makeRequest().then(_refreshAndGenerateTokenSuccessHandling.bind(null, resolve), e => {
      reset();
      generateToken(true);
    });
  });
}

function refreshToken() {
  return new Promise((resolve, reject) => {
    makeRequest(true).then(_refreshAndGenerateTokenSuccessHandling.bind(null, resolve), _refreshAndGenerateTokenErrorHandling);
  });
}

function onTokenExpire(timout) {
  const {onError, onNewToken} = authConfig;
  clearTimeout(tokenExpireTimeoutCode);
  tokenExpireTimeoutCode = setTimeout(e => {
    refreshToken().then(onNewToken, _refreshAndGenerateTokenErrorHandling);
  }, timout);
}

function reset() {
  cookie.remove("refreshToken");
  cookie.remove("codeVerifier");
}

function signOut() {
  authConfig = {...defaultConfig(), ...window._podAuthConfig};
  reset();
  generateToken(true);
}

function makeRequest(isRefresh) {
  const {codeVerifierStr, clientId, refreshTokenStr, redirectUri, ssoBaseUrl} = authConfig;
  return new Promise((resolve, reject) => {
    requestXHR = new XMLHttpRequest();
    requestXHR.open("POST", `${ssoBaseUrl}/token`, true);
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

    requestXHR.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    requestXHR.onreadystatechange = function (e) {
      if (this.readyState === XMLHttpRequest.DONE) {
        if (requestXHR.readyState === 4) {
          if (this.status === 200) {
            return resolve(JSON.parse(requestXHR.response));
          }
          reject(JSON.parse(requestXHR.response));
        }
      }
    };
    requestXHR.send(queryString.stringify(baseObject));
  });
}

function retry() {
  const {onRetrying} = authConfig;
  if (requestXHR) {
    requestXHR.abort();
    requestXHR = null;
  }
  if (onRetrying) {
    onRetrying();
  }
  return auth(window._podAuthConfig);
}


function auth(config) {
  if (config) {
    window._podAuthConfig = config;
  }
  authConfig = {...defaultConfig(), ...config};
  const {refreshTokenStr, onNewToken} = authConfig;
  if (refreshTokenStr) {
    const then = refreshToken();
    then.then(onNewToken);
    return then;
  }
  const then = generateToken();
  then.then(onNewToken);
  return then;
}

export {auth, signOut, retry};