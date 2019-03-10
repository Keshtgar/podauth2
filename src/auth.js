import Hashes from "jshashes";
import randomString from "random-string";
import queryString from "query-string";
import cookie from "js-cookie";


const defaultConfig = {
  onError: e => {
    return true
  },
  onNewToken: e => {
  },
  onRetry: e => {
  },
  codeVerifierStr: cookie.get("codeVerifier"),
  codeChallengeStr: null,
  retryTimeout: 3000,
  refreshTokenStr: cookie.get("refreshToken"),
  clientId: null,
  redirectUri: `${window.location.protocol}//${window.location.hostname}`,
  timeRemainingTimeout: 90,
  ssoBaseUrl: "https://accounts.pod.land/oauth2",
  scope: "profile",
  redirectTrigger: null,
};
let authConfig = {};

function urlGenerator() {
  const {ssoBaseUrl, clientId, redirectUri, codeChallengeStr, scope} = authConfig;
  return `${ssoBaseUrl}/authorize/index.html?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&code_challenge_method=S256&code_challenge=${codeChallengeStr}&scope=${scope}`;
}

function codeVerifier() {
  const codeVerifierStr = authConfig.codeVerifierStr;
  if (codeVerifierStr) {
    return codeVerifierStr;
  }
  const codeVerifierStrRand = randomString({length: 10});
  cookie.set("codeVerifier", authConfig.codeVerifierStr = codeVerifierStrRand);
}

function codeChallenge() {
  const {codeChallengeStr, codeVerifierStr} = authConfig;
  if (codeChallengeStr) {
    return codeChallengeStr;
  }
  return authConfig.codeChallengeStr = new Hashes.SHA256().b64(codeVerifierStr).replace(/\+/g, "-").replace(/\//g, "_").replace(/\=+$/, "");
}

function generateToken(forceLoginPage) {
  const {timeRemainingTimeout, onError, redirectTrigger} = authConfig;
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
    makeRequest().then(response => {
      cookie.set("refreshToken", authConfig.refreshTokenStr = response.refresh_token);
      onTokenExpire((response.expires_in - timeRemainingTimeout) * 1000);
      resolve(response.access_token);
    }, error => {
      if (onError(error)) {
        reset();
        generateToken(true);
      }
    });
  });
}

function refreshToken() {
  const {timeRemainingTimeout, onError} = authConfig;
  return new Promise((resolve, reject) => {
    makeRequest(true).then(response => {
      cookie.set("refreshToken", authConfig.refreshTokenStr = response.refresh_token);
      onTokenExpire((response.expires_in - timeRemainingTimeout) * 1000);
      resolve(response.access_token);
    }, error => {
      if (onError(error)) {
        reset();
        generateToken(true);
      }
    });
  });
}

function onTokenExpire(timout) {
  const {onError, onNewToken} = authConfig;
  setTimeout(e => {
    refreshToken().then(onNewToken, error => {
      if (onError(error)) {
        reset();
        generateToken(true);
      }
    });
  }, timout);
}

function reset() {
  cookie.remove("codeVerifier");
  cookie.remove("refreshToken");
}

function signOut(config) {
  authConfig = {...defaultConfig, ...window._podAuthConfig};
  const {redirectTrigger} = authConfig;
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
}

function makeRequest(isRefresh) {
  const {codeVerifierStr, clientId, refreshTokenStr, redirectUri, ssoBaseUrl} = authConfig;
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", `${ssoBaseUrl}/token`, true);
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
      if (this.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 0) {
          return retry();
        }
        if (xhr.readyState === 4) {
          if (this.status === 200) {
            return resolve(JSON.parse(xhr.response));
          }
          reject(JSON.parse(xhr.response));
        }
      }
    };
    xhr.send(queryString.stringify(baseObject));
  });
}

function retry(isRefresh, force) {
  authConfig = {...defaultConfig, ...window._podAuthConfig};
  const {retryTimeout, onRetry} = authConfig;
  if (force) {
    return makeRequest(isRefresh);
  }
  setTimeout(e => makeRequest(isRefresh), retryTimeout);
  if (onRetry) {
    onRetry(retry.bind(null, isRefresh, true));
  }
}


function auth(config) {
  if(config){
    window._podAuthConfig = config;
  }
  authConfig = {...defaultConfig, ...config};
  const {refreshTokenStr, onNewToken, codeVerifierStr} = authConfig;
  if (refreshTokenStr && codeVerifierStr) {
    return refreshToken().then(onNewToken);
  }
  return generateToken().then(onNewToken);
}

export {auth, signOut, retry};
