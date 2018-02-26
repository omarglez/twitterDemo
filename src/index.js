import React from 'react';
import ReactDOM from 'react-dom';
import {formatUTCTime, getTweetLinkText, getTweetsPromise} from './util.js';
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

    componentDidMount() {
        let tweetPromises = this.props.screenNames.map(name =>
            getTweetsPromise(name, this.props.count)
        );

        Promise.all(tweetPromises)
        .then(results =>
            this.setState({
                tweetContainers: results
            })
        )
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

class TopBar extends React.Component {
    render() {
        return (
            <div id="topBar">
                <span className="topBarElement">&#9776;</span>
                <div className="center">
                    <h1 className="topBarElement">My Tweet Feed</h1>
                </div>
            </div>
        );
    }
}

class Main extends React.Component {
    render() {
        return (
            <div>
                <TopBar />
                <FeedManager
                    screenNames={["appdirect", "laughingsquid", "techcrunch"]}
                    count={30}
                />
            </div>
        );
    }
}


ReactDOM.render(
    <Main />,
    document.getElementById('root')
);
