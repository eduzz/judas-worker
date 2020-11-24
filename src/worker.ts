
import { listen } from './queue';
import * as differenceInMilliseconds from 'date-fns/difference_in_milliseconds';
import { storeEvent } from './service';
import * as amqp from 'amqplib'

(async () => {
    listen(async (msg: any, full: amqp.ConsumeMessage) => {

        const now = new Date();
        const msgDate = new Date(msg.event.date);

        const diff = differenceInMilliseconds(new Date(), msgDate);

        msg.event.processed_at = now.toISOString();
        msg.event.delay = diff;

        if (msg.event.delay > 2147483647) {
            msg.event.delay = 2147483647;
        }

        try {
            await storeEvent(msg);
        } catch (err) {
            if (err.status && err.status === 400) {
                console.log('nack invalid body', JSON.stringify({ 
                    agent: msg.agent, 
                    app: msg.app, 
                    env: msg.environement, 
                    action: msg.action, 
                    module: msg.module, 
                    err: err.body 
                }));
                return true;
            }

            const headers = full.properties.headers;

            if (headers['x-death'] && headers['x-death'][0].count > 100) {
                console.log('nack many nacks', err);
                return true;
            }

            console.log('unknown error', JSON.stringify({ 
                agent: msg.agent, 
                app: msg.app, 
                env: msg.environement, 
                action: msg.action, 
                module: msg.module, 
                err: err.body || err
            }));

            throw err;
        }

    });

    console.log('listening');
})();