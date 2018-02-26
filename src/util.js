/*
    Returns a promise to an array of tweets
*/
function getTweetsPromise(screenName, count = 30) {
    let apiStr = 'http://localhost:7890/1.1/statuses/user_timeline.json';
    let promise = fetch(`${apiStr}?count=${count}&screen_name=${screenName}`);

    return promise.then(data => data.json());
}

/*
    Takes a UTC time string and returns a prettyfied time format:
    Less than an hour ago: XXm
    Less than a day ago: Yh
    Other: Month Day
*/
function formatUTCTime(time) {
    let then = new Date(time);
    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    let now = new Date();
    let diff = new Date(now.getTime() - then.getTime());
    let timeString = "0h"; // default value

    if(diff.getUTCDate() === 1) {
        if(diff.getUTCHours() === 0) {
            timeString = `${diff.getUTCMinutes()}m`;
        } else {
            timeString = `${diff.getUTCHours()}h`;
        }
    } else {
        timeString = `${months[then.getMonth()]} ${then.getDate()}`;
    }

    return timeString;
}

function getTweetLinkText(screenName, id) {
    let baseURL = "https://twitter.com/";

    return `${baseURL}${screenName}/status/${id}`;
}

export {
    formatUTCTime,
    getTweetLinkText,
    getTweetsPromise
};
