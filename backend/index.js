const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { connectKafka } = require('./service/kafka')
const router = require('./routes');
const sequelize = require('./model/sequelize');

const PORT = process.env.PORT || 9000;

sequelize.sync().then(() => {
    connectKafka().then(({ consumer, producer }) => {
        const app = express();

        // Middleware for parsing JSON body
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(cors());

        app.use('/api', router);

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
        process.once('SIGINT', function (code) {
            console.log('SIGINT received...');
            consumer.disconnect();
            producer.disconnect();
            process.exit();
        });
        process.once('SIGTERM', function (code) {
            console.log('SIGINT received...');
            consumer.disconnect();
            producer.disconnect();
            process.exit();
        });
    }).catch()
}).catch((err) => {
    console.log('error', err)
});
