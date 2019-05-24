import * as express from 'express';
import * as bodyParser from 'body-parser';
import router from './router';
import './worker';

const app = express();

app.use(bodyParser.json());
app.use(router);

app.listen(3000, () => {
    console.log('started');
});
