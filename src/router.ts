
import * as express from 'express';
import { sendMessageToQueue } from './service';
import authMiddleware from './auth';

const router = express.Router();

export default router;

router.use(authMiddleware);

router.post('/store', async (req, res, next) => {
    try {
        await sendMessageToQueue(req.body);
        res.status(201).json();
    } catch (err) {
        next(err);
    }
});