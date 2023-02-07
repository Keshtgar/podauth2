# Podauth
> Podauth handle async pod auth actions

## Build

```bash
npm run build
```

## Installation

```
npm install podauth --save
```

## Usage

React component:

```jsx harmony
import {auth} from "podauth"

auth({
    clientId: "aja73hq234hsflksfgsiuaevjtl",//Business client id
    ssoBaseUrl: "https://accounts.pod.land/oauth2",//sso Base Url
    redirectUri: "https://example.com",//Default {protocol}://{domain} of current url
    timeRemainingTimeout: 90,//Remaining time before expiration to refresh token, Default 90 seconds before expiration
    retryTimeout: 3000,//Retry timeout after a fail catch
    cookieTimeout: 365,//Cookie timeout for refresh token
    scope: "profile",//Login scope: profile|email|address|activity|legal،|phone
    onRetry(retry){
      //Will fire when getting toke failed or canceled {retry} is custom retry function
    },
    onError(){
      //Will fire when an error happened
      return true;//will go to login page if you return true except will do nothing
    },
    onNewToken(token){
      //Do your stuff
    },
    redirectTrigger(){
      //Will fire when auth will be in sign out or token generation faze 
      //When you define this function needs to return true for default redirection to login page
      //If you dont need to default redirection you can return false or nothing
      return true;
    }
})
```

## License

This project is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT).
