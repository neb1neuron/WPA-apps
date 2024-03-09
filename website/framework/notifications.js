import ApplicationService from '../services/applicationService.js';

export class NotificationHelper {
    static isStopped = true;

    static notificationPermissions() {
        Notification.requestPermission().then(async (result) => {
            if (result === "granted") {
                await this.priceNotification();
            }
        });
    }

    static priceNotification() {
        this.isStopped = !this.isStopped;
        if (!this.isStopped) {
            this.priceNotificationStart();
        }
        // setInterval(this.priceNotificationStart, 30000);
    }

    static async priceNotificationStart() {
        if (this.isStopped) {
            return;
        }
        console.log('price notification');
        let sPrice = await ApplicationService.getPrice(generalSetup.coinPair);
        const notifBody = `${generalSetup.coin} : ${sPrice} ${generalSetup.currency} \r\n${new Date().toLocaleDateString("en-GB") || '#'} - ${new Date().toLocaleTimeString("en-GB") || '#'}`;

        const notifTitle = `🤖 Botu\' : Price for ${generalSetup.coin} is:`;
        const options = {
            body: notifBody,
            icon: './images/icons/icon-144x144.png',
            badge: './images/icons/icon-96x96.png',
            vibrate: [200, 100, 200, 100, 200, 100, 200]
        };

        swReg.showNotification(notifTitle, options);
        // new Notification(notifTitle, options);

        setTimeout(() => this.priceNotificationStart(), 30000);
    }
}