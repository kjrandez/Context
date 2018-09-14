import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import './index.css'

class Text extends Component
{
    constructor(props) {
        super(props);

        this.state = {
            text: props.fragment.value()
        }
    }

    onChange(event) {
        this.props.fragment.event({
            transaction: "update",
            value: event.target.value
        });
    }

    modelChanged() {
        this.setState({
            text: this.props.fragment.value()
        });
    }

    render() {
        return (
            <div class="element">
                <textarea
                    onChange={(event) => this.onChange(event)}
                    value={this.state.text} />
            </div>
        );
    }

    componentDidMount() {
        this.props.fragment.connect(this);
    }

    componentWillUnmount() {
        this.props.fragment.disconnect();
    }
}

class Fragment
{
    // This class should probably not store the element's value data directly,
    // but should connect the visual to the model where the data actually is.

    constructor(model) {
        this.immKey = model.key;
        this.immType = model.type;
        this.mutValue = model.value;
        this.mutMeta = model.meta;
        this.visual = null;
    }

    key() {
        return this.immKey;
    }

    type() {
        return this.immType;
    }

    value() {
        return this.mutValue;
    }

    meta() {
        return this.mutMeta;
    }

    event(event) {
        // Notify store of transaction.
        // But for now just modify in place
        if(event.transaction == "update") {
            this.mutValue = event.value;
            this.changed();
        }
    }

    changed() {
        if(this.visual != null) {
            this.visual.modelChanged();
        }
    }

    connect(visual) {
        this.visual = visual;
    }

    disconnect() {
        this.visual = null;
    }
}

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            contents: []
        }
    }

    componentDidMount() {
        this.props.startup(this);
    }

    setModel(topModel) {
        // Create fragments for top-level page elements
        var fragments = topModel.value.map(elementModel => getFragment(elementModel));

        // The top-level's state includes the page contents
        this.setState({
            contents: fragments
        });
    }

    render() {
        return (
            <div id="page">
                <div id="top-spacer"></div>
                {elementList(this.state.contents)}
                <div id="bottom-spacer"></div>
            </div>
        );
    }
}  

function startup(topComponent) {
    console.log("In startup");
    var kernel = new WebSocket("ws://localhost:8085/broadcast");
    
    kernel.onopen = function(event) {
        kernel.send(JSON.stringify({
            selector: "requestTopPage",
            arguments: []
        }))
    }

    kernel.onclose = function(event) {
        alert('Connection closed.');
    }

    kernel.onmessage = function(event) {
        var message = JSON.parse(event.data);
        console.log("Received message: ")
        console.log(message)
        
        switch(message.selector) {
            case 'renderPage:':
                topComponent.setModel(message.arguments[0]);
                break;
            default:
                console.log("Unhandled message");
        }
    }
}

var fragmentDict = {}

function getFragment(model) {
    if(!(model.key in fragmentDict))
        fragmentDict[model.key] = new Fragment(model);

    return fragmentDict[model.key];
}

function elementList(fragments) {
    return fragments.map(fragment => {
        switch(fragment.type()) {
            case "page":
                return <p key={fragment.key()} fragment={fragment}>Page</p>;
            case "text":
                return <Text key={fragment.key()} fragment={fragment} />;
            case "columns":
                return <p key={fragment.key()} fragment={fragment}>Columns</p>;
            case "image":
                return <p key={fragment.key()} fragment={fragment}>Image</p>;
            default:
                return <p key={fragment.key()} fragment={fragment}>Undefined element</p>;
        }
    });
}

ReactDOM.render(<App startup={startup}/>, document.getElementById('root'));
registerServiceWorker();
