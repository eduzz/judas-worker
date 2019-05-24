
import { listen } from './queue';
import * as differenceInMilliseconds from 'date-fns/difference_in_milliseconds';
import { storeEvent } from './service';

(async () => {
    listen(async (msg: any) => {

        const now = new Date();
        const msgDate = new Date(msg.event.date);

        const diff = differenceInMilliseconds(new Date(), msgDate);

        msg.event.processed_at = now.toISOString();
        msg.event.delay = diff;

        await storeEvent(msg);
    });

    console.log('listening');
})();