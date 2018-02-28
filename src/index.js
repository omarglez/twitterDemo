import React from 'react';
import ReactDOM from 'react-dom';
import { ToastContainer, toast, style } from 'react-toastify';
import { arrayEquals, formatUTCTime, getSettings, getTweetLinkText, getTweetsPromise, getUsersPromise, setSettings } from './util.js';
import './styles/index.css';


style({
    colorWarning: "#111",
});

/*
    tweet: The tweet object as specified in the tweet api:
    https://developer.twitter.com/en/docs/tweets/data-dictionary/overview/tweet-object
*/
function TweetDisplay(props) {
    return (
        <li className="tweet"
            onClick={() => window.open(
                getTweetLinkText(props.tweet.user.screen_name, props.tweet.id_str),
                '_blank')}>
            <span className="name">{props.tweet.user.name}</span>
            <span className="muted">{`@${props.tweet.user.screen_name}`}</span>
            <span className="muted time">
                {formatUTCTime(props.tweet.created_at)}
            </span>
            <p>{props.tweet.text}</p>
        </li>
    );
}

/*
    tweets: the tweet objects returned by the twitter api
*/
function TweetFeed(props) {
    return (
        <ul className="feed">
            {props.tweets.map(t =>
                <TweetDisplay key={t.id_str} tweet={t}/>
            )}
        </ul>
    );
}

/*
    screenNames: The twitter accounts to display the tweets from.
        Creates one feed per name.
    count: The amount of tweets to display per feed.
*/
class FeedManager extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tweetContainers: []
        };
    }

    setTweetContainers(screenNames, count) {
        let tweetPromises = screenNames.map(name =>
            getTweetsPromise(name, count)
        );

        Promise.all(tweetPromises).then(results =>
            this.setState({
                tweetContainers: results
            })
        );
    }

    componentDidMount() {
        this.setTweetContainers(this.props.screenNames, this.props.count);
    }

    componentWillReceiveProps(nextProps) {
        if(!arrayEquals(this.props.screenNames, nextProps.screenNames)){
            this.setTweetContainers(nextProps.screenNames, nextProps.count);

        } else if(this.props.count !== nextProps.count) {
            if(nextProps.count < this.props.count) {
                this.setState({
                    tweetContainers: this.state.tweetContainers.map(a => a.slice(0, nextProps.count))
                });
            } else {
                this.setTweetContainers(nextProps.screenNames, nextProps.count);
            }
        }
    }

    render() {
        return (
            <div className="feedManager">
                {this.state.tweetContainers.map((ts, i) =>
                    <div key={this.props.screenNames[i]} className={`column${i}`} >
                        <TweetFeed tweets={ts} />
                    </div>
                )}
            </div>
        );
    }
}

/*
    openSettingsPanel: The handler for the oppen settings button.
*/
class TopBar extends React.Component {
    render() {
        return (
            <div id="topBar">
                <button
                    className="topBarElement"
                    onClick={this.props.openSettingsPanel}
                    >&#9776;
                </button>
                <div className="center">
                    <h1 className="topBarElement">My Tweet Feed</h1>
                </div>
            </div>
        );
    }
}

/*
    applySettings: Handler for the apply settings button.
    closeSelf: Handler for this panel to hide on close.
    settings: The current settings.
*/
class SettingsPanel extends React.Component {
    constructor(props) {
        super(props);

        this.state = this.props.settings;
    }

    componentDidMount() {
        let that = this;

        // Initialize tweetCount slider
        let tweetCountRange = document.getElementById('tweetCountRange');

        tweetCountRange.value = this.state.tweetCount;

        tweetCountRange.oninput = function() {
            that.setState({
                tweetCount: Number(tweetCountRange.value)
            });
        };

        // Initialize screenName inputs
        let screenNameInputs = document.getElementsByClassName("screenNameInput");

        this.state.screenNames.forEach((name, i) => {
            screenNameInputs[i].value = name;
        });

        for(let i = 0; i < screenNameInputs.length; i++) {
            screenNameInputs[i].oninput = function() {
                let value = screenNameInputs[i].value;
                let alphanumeric = RegExp("^[A-Za-z0-9_]*$");
                let warning = document.getElementById("screenNameInputWarning" + i);

                if(alphanumeric.test(value)) {
                    if(warning) {
                        warning.style.visibility = "hidden";
                    }

                    let screenNamesCopy = that.state.screenNames.slice();
                    screenNamesCopy[i] = value;

                    that.setState({
                        screenNames: screenNamesCopy
                    });
                } else {
                    if(warning) {
                        warning.style.visibility = "visible";
                    }
                }
            };
        }
    }

    areSettingsValid() {
        let warnings = document.getElementsByClassName("textInputWarning");
        let inputs = document.getElementsByClassName("screenNameInput");
        let result = true;

        for(let i = 0; i < warnings.length; i++) {
            if(warnings[i].style.visibility === "visible") {
                toast.warn(`The following screen name is invalid: ${inputs[i].value}`);
                result = false;
            }
        }

        return result;
    }

    render() {
        let that = this;
        let applyFunction = function() {
            if(that.areSettingsValid()) {
                that.props.applySettings(that.state);
            }
        };

        return (
            <div id="settingsPanel">
                <button className="closeButton" onClick={this.props.closeSelf}>
                    &times;
                </button>
                <div className="settingsSection">
                    <span className="settingsTittle">Settings</span>
                    <div className="settingsItem">
                        <span>Show tweets from these users</span>
                        <input type="text" className="screenNameInput" maxLength="15"></input>
                        <span className="textInputWarning" id="screenNameInputWarning0">&#9888;</span>
                        <input type="text" className="screenNameInput" maxLength="15"></input>
                        <span className="textInputWarning" id="screenNameInputWarning1">&#9888;</span>
                        <input type="text" className="screenNameInput" maxLength="15"></input>
                        <span className="textInputWarning" id="screenNameInputWarning2">&#9888;</span>
                    </div>
                    <div className="settingsItem">
                        <span>Display {this.state.tweetCount} tweets per column</span>
                        <input type="range" min="1" max="30"
                            className="slider" id="tweetCountRange" />
                    </div>
                </div>
                <div className="settingsSection">
                    <button onClick={applyFunction}
                        className="button applyButton">Apply</button>
                </div>
            </div>
        );
    }
}

class Main extends React.Component {
    constructor(props) {
        super(props);

        // Default values
        let state = {
            screenNames: ["appdirect", "laughingsquid", "techcrunch"],
            tweetCount: 30
        };

        this.state = getSettings(state);
    }

    handleApplySettings(batchedSettings) {
        let sNames = batchedSettings.screenNames.slice();

        if(!arrayEquals(this.state.screenNames, sNames)) {
            this.getValidScreenNames(sNames).then(validScreenNames => {
                let valid = validScreenNames.length === sNames.length;

                if(valid) {
                    setSettings(batchedSettings);
                    this.setState(batchedSettings);
                } else {
                    sNames = sNames.map(sN => sN.toLowerCase());

                    validScreenNames.forEach(sN => {
                        // remove the valid names
                        let index = sNames.indexOf(sN.toLowerCase());
                        if(index > -1) {
                            sNames.splice(index, 1);
                        }
                    });

                    // all remaining names were not found
                    sNames.forEach(sN => {
                        toast.warn(`Username ${sN} could not be found. Make sure it is not misspelled.`);
                    });
                }
            });
        } else {
            setSettings(batchedSettings);
            this.setState(batchedSettings);
        }
    }

    getValidScreenNames(namesToValidate) {
        return getUsersPromise(namesToValidate).then(results => {
            let validScreenNames = [];

            if(!results.errors) {
                validScreenNames = results.map(user => user.screen_name);
            }

            return validScreenNames;
        });
    }

    openSettingsPanel() {
        let offset = "300px";
        document.getElementById("settingsPanel").style.width = offset;
        document.getElementById("mainContent").style.marginLeft = offset;
    }

    closeSettingsPanel() {
        document.getElementById("settingsPanel").style.width = "0";
        document.getElementById("mainContent").style.marginLeft = "0";
    }

    render() {
        return (
            <div>
                <ToastContainer autoClose={10000} className="toast"/>
                <SettingsPanel
                    applySettings={s => this.handleApplySettings(s)}
                    closeSelf={this.closeSettingsPanel}
                    settings={this.state}
                />
                <TopBar openSettingsPanel={this.openSettingsPanel} />
                <div id="mainContent">
                    <FeedManager
                        screenNames={this.state.screenNames}
                        count={this.state.tweetCount}
                    />
                </div>
            </div>
        );
    }
}


ReactDOM.render(
    <Main />,
    document.getElementById('root')
);
