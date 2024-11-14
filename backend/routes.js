const express = require('express');
const { job } = require('./service');
const router = express.Router();

router.post('/submit', async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'query string is required' });
        }
        const id = await job.create(query)
        res.status(200).send({ message: 'success', id });
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: err.message });
    }
})

router.post('/result', async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'job id is required' });
        }
        const response = await job.getJobStatus(id)
        res.status(200).send(response);
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: err.message });
    }
})

router.get('/previous', async (req, res) => {
    try {
        const data = await job.getCompletedJobs();
        res.status(200).send(data);
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: err.message });
    }
})

module.exports = router;