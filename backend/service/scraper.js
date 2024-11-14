const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

let driver;
const dummyTweets = [{
    "tweetText": "Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. It's great for backend development!",
    "username": "user1",
    "likes": "120",
    "retweets": "30",
    "timestamp": "2024-11-12T23:45:10.000Z"
},
{
    "tweetText": "Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. It's great for backend development!",
    "username": "user1",
    "likes": "120",
    "retweets": "30",
    "timestamp": "2024-11-12T23:45:10.000Z"
},
{
    "tweetText": "Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. It's great for backend development!",
    "username": "user1",
    "likes": "120",
    "retweets": "30",
    "timestamp": "2024-11-12T23:45:10.000Z"
},
{
    "tweetText": "Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. It's great for backend development!",
    "username": "user1",
    "likes": "120",
    "retweets": "30",
    "timestamp": "2024-11-12T23:45:10.000Z"
}]

async function runActualScrape(searchString) {
    // Configure Chrome options (optional, for running without a visible browser window)
    const options = new chrome.Options();
    options.addArguments('--headless');  // Run in headless mode (no browser UI)
    options.addArguments('--disable-gpu'); // Disable GPU acceleration (for headless mode)
    options.addArguments('--no-sandbox');  // For some environments (like Docker)

    // Twitter URL search format
    const TWITTER_URL = 'https://twitter.com/search?q=';

    // Create a Selenium WebDriver instance for Chrome
    if (!driver) {
        driver = new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
    }
    // Open Twitter Search URL
    const searchUrl = `${TWITTER_URL}${encodeURIComponent(searchString)}`;
    console.log('searchurl===>', searchUrl)
    await driver.get(searchUrl);

    // Wait until tweets are loaded
    await driver.wait(until.elementLocated(By.css('article')), 10000); // Wait for at least one tweet to be present

    let tweets = [];

    // Grab tweets after loading
    let tweetElements = await driver.findElements(By.css('article'));

    for (let tweetElement of tweetElements) {
        // Get tweet text
        const tweetText = await tweetElement.findElement(By.css('div[lang]')).getText();

        // Get username
        const username = await tweetElement.findElement(By.css('div[dir="ltr"] > span')).getText();

        // Get number of likes and retweets (may need to adjust selectors if Twitter updates)
        let likes = 0;
        let retweets = 0;
        try {
            likes = await tweetElement.findElement(By.xpath('.//div[@data-testid="like"]//span')).getText();
            retweets = await tweetElement.findElement(By.xpath('.//div[@data-testid="retweet"]//span')).getText();
        } catch (err) {
            console.log('Error fetching likes/retweets');
        }

        // Get tweet timestamp (time ago)
        const timestamp = await tweetElement.findElement(By.css('time')).getAttribute('datetime');

        // Collect the tweet data
        tweets.push({
            tweetText,
            username,
            likes,
            retweets,
            timestamp
        });
    }
    return tweets;
}

async function scrapeTweets(searchString, prod) {
    try {
        if (prod) runActualScrape(searchString);
        else return { tweets: dummyTweets, success: true };
    } catch (err) {
        console.error('Error during scraping:', err);
    } finally {
        if (driver) {
            await driver.quit();
            driver = null;
        }
    }
}
module.exports = { scrapeTweets }