const { Kafka, logLevel, Partitioners } = require('kafkajs');
const scraper = require('./scraper');
const Scrape = require('../model/scrape');
const Query = require('../model/query');

const MAX_RETRIES = 3;

const kafka = new Kafka({
    clientId: 'scraping-job-queue',
    brokers: ['localhost:29092'], // Adjust as per your Kafka setup
    logLevel: logLevel.INFO
});

const admin = kafka.admin();
const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });
const consumer = kafka.consumer({ groupId: 'scraping-job-group' });

async function connectKafka() {
    await admin.connect();
    const existingTopics = await admin.listTopics()
    if (existingTopics.length > 0) {
        await admin.deleteTopics({
            topics: existingTopics,
        });
    }
    await admin.createTopics({
        waitForLeaders: true,
        topics: [
            { topic: 'scraping-job-queue' },
        ],
    });
    await producer.connect();
    await consumer.connect();
    await consumer.subscribe({ topic: 'scraping-job-queue', fromBeginning: true });
    await consumer.run({
        eachMessage: async ({ message }) => {
            const job = JSON.parse(message.value.toString());
            const { id, string, retries } = job;

            const { success, tweets } = await scraper.scrapeTweets(string, false);
            if (success) {
                // Save scraped data and mark job as completed
                await Scrape.create({ queryId: id, data: tweets });
                await Query.update({ status: 'completed', retries }, { where: { id } });
            } else {
                if (retries < MAX_RETRIES) {
                    // Retry job
                    job.retries++;
                    await producer.send({
                        topic: 'scraping-job-queue',
                        messages: [
                            {
                                value: JSON.stringify(job),
                            },
                        ],
                    });
                } else {
                    // Mark job as failed
                    await Query.update({ status: 'failed', retries }, { where: { id } });
                }
            }
        }
    });
    return { producer, consumer }
}

module.exports = { producer, consumer, connectKafka };