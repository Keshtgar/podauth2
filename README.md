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
    clientId: "aja73hq234hsflksfgsiuaevjtl",
    redirectUri: "https://example.com",//Default {protocol}://{domain} of current url
    timeRemainingTimeout: 90,//Remaining time before expiration to refresh token, Default 90 seconds before expiration
    onNewToken: (token) => {
        //Do your stuff
    }
})
```

## License

This project is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT).
