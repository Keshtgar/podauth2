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

```
import podauth from "podauth"

podauth.start({
    clientId: "aja73hq234hsflksfgsiuaevjtl",
    onNewToken: (token) => {
        //Do your stuff
    }
})
```

## License

This project is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT).
