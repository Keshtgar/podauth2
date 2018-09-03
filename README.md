# Podchatweb
> Podchatweb is a web app built by react for handling POD chating use cases

[![Preview of Podchat web][preview_image]][preview_image_url]

## Development

```bash
npm run start
```

## Installation

```
npm install podchatweb --save
```

## Usage

React component:

```jsx
import {PodchatReact} from "podchatweb"

class MyApp extends Component {
    render() {
        const {token} = this.props;
        return 
        <div>
            <PodchatReact token={token} onTokenExpire={callBack => {callBack(token)}}/>
        </div>
    }
}
```

Programmatic calling:

```jsx
import {Podchat} from "podchatweb"

class MyApp extends Component {

    componentDidMount() {
        const {token} = this.props;
        Podchat({token, onTokenExpire: callBack=> callBack(token)}, "myChat")
    }
    
    render() {
        return <div id="myChat"/>
    }
}
```

## License

This project is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT).


[//]: # (LINKS)
[preview_image]: https://raw.githubusercontent.com/ACT1GMR/podchatweb/master/docs/preview.png "Preview of podchat web"
[preview_image_url]: https://raw.githubusercontent.com/ACT1GMR/podchatweb/master/docs/preview.png