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
    redirectUri: "https://example.com",//Default {protocol}://{domain} of current url
    timeRemainingTimeout: 90,//Remaining time before expiration to refresh token, Default 90 seconds before expiration
    retryTimeout: 3000,//retry timeout after a fail catch
    onRetry(retry){
      //will fire when getting toke failed or canceled {retry} is custom retry function
    },
    onError(){
      //will fire when an error happened
      return true;//will go to login page if you return true except will do nothing
    },
    onNewToken(token){
      //Do your stuff
    }
})
```

## License

This project is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT).
