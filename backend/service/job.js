const { producer, consumer } = require('./kafka');
const Query = require('../model/query');
const Scrape = require('../model/scrape');

const create = async (query) => {
  const job = {
    string: query,
    retries: 0,
    status: 'pending',  // Job starts as 'pending'
  };
  const { id } = await Query.create(job);
  await producer.send({
    topic: 'scraping-job-queue',  // Kafka topic for jobs
    messages: [
      {
        value: JSON.stringify({ ...job, id }),
      },
    ],
  });
  return id;
}

const getJobStatus = async (id) => {
  let job = await Query.findOne({ where: { id } });
  if (job.status == 'completed') job = {...job.dataValues, scrapedData: await Scrape.findAll({ where: { queryId: id } })};
  return { message: 'success', job };
}

const getCompletedJobs = async () => {
  let jobs = await Query.findAll({ where: { status: 'completed' } });
  let updated = [];
  for (const job of jobs) {
    const scrapedData = await Scrape.findAll({ where: { queryId: job.id } })
    updated.push({ ...job.dataValues, scrapedData });
  }
  return { message: 'success', jobs: updated };
}

module.exports = { create, getJobStatus, getCompletedJobs }