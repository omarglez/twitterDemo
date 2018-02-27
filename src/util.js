function arrayEquals(a, b) {
    if(!a || !b){
        return false;
    }

    if(a.length !== b.length) {
        return false;
    }

    for(let i = 0; i < a.length; i++) {
        if (a[i] instanceof Array && b[i] instanceof Array) {
            if(!arrayEquals(a[i], b[i])) {
                return false;
            }
        } else if(a[i] !== b[i]) {
            return false;
        }
    }

    return true;
}

/*
    Returns a promise to an array of tweets in json format
*/
function getTweetsPromise(screenName, count = 30) {
    if(count === 0) {
        return Promise.resolve([]);
    }

    let apiStr = 'http://localhost:7890/1.1/statuses/user_timeline.json';
    let promise = fetch(`${apiStr}?count=${count}&screen_name=${screenName}`);

    return promise.then(data => data.json());
}

/*
    Takes a UTC time string and returns a prettyfied time format:
    Less than an hour ago: XXm
    Less than a day ago: Yh
    This year: Month Day
    Other: Month Day Year
*/
function formatUTCTime(time) {
    let then = new Date(time);
    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    let now = new Date();
    let diff = new Date(now.getTime() - then.getTime());
    let timeString = "0h"; // default value

    // if less than a day has passed (using Unix epoch)
    if(diff.getUTCDate() === 1 && diff.getUTCFullYear() === 1970) {
        // less than an hour
        if(diff.getUTCHours() === 0) {
            timeString = `${diff.getUTCMinutes()}m`;
        } else {
            timeString = `${diff.getUTCHours()}h`;
        }
    } else {
        // same year
        if(then.getFullYear() === now.getFullYear()) {
            timeString = `${months[then.getMonth()]} ${then.getDate()}`;
        } else {
            timeString = `${months[then.getMonth()]} ${then.getDate()} ${then.getFullYear()}`;
        }
    }

    return timeString;
}

/*
    Get the full unique link to a tweet
*/
function getTweetLinkText(screenName, id) {
    let baseURL = "https://twitter.com/";

    return `${baseURL}${screenName}/status/${id}`;
}

export {
    arrayEquals,
    formatUTCTime,
    getTweetLinkText,
    getTweetsPromise
};
