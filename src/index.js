import React from 'react';
import ReactDOM from 'react-dom';
import {arrayEquals, formatUTCTime, getSettings, getTweetLinkText, getTweetsPromise} from './util.js';
import './styles/index.css';

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

        Promise.all(tweetPromises)
        .then(results =>
            this.setState({
                tweetContainers: results
            })
        )
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
        let tweetCountRange = document.getElementById('tweetCountRange');
        let that = this;

        tweetCountRange.value = this.state.tweetCount;

        tweetCountRange.oninput = function() {
            that.setState({
                tweetCount: Number(tweetCountRange.value)
            });
        };
    }

    render() {
        return (
            <div id="settingsPanel">
                <button className="closeButton" onClick={this.props.closeSelf}>
                    &times;
                </button>
                <div className="settingsSection">
                    <span className="settingsTittle">Display</span>
                    <div className="settingsItem">
                        <span>Display {this.state.tweetCount} tweets per column</span>
                        <input type="range" min="1" max="30"
                            className="slider" id="tweetCountRange" />
                    </div>
                </div>
                <div className="settingsSection">
                    <button onClick={() => this.props.applySettings(this.state)}
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
        if(typeof(Storage) !== "undefined") {
            var stringSettings = JSON.stringify(batchedSettings);
            localStorage.setItem("settings", stringSettings);
        }

        this.setState(batchedSettings);
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
