import ApplicationService from '../services/applicationService.js';


export class NotificationHelper {
    static notificationPermissions() {
        Notification.requestPermission().then(async (result) => {
            if (result === "granted") {
                await this.priceNotification();
            }
        });
    }

    static async priceNotification() {
        console.log('price notification');
        let sPrice = await ApplicationService.getPrice(generalSetup.coinPair);
        const notifBody = `${generalSetup.coin} : ${sPrice} ${generalSetup.currency} \r\n${new Date().toLocaleDateString("en-GB") || '#'} - ${new Date().toLocaleTimeString("en-GB") || '#'}`;

        const notifTitle = `🤖 Botu\' : Price for ${generalSetup.coin} is:`;
        const options = {
            body: notifBody,
            icon: './images/icons/icon-144x144.png',
        };
        new Notification(notifTitle, options);
        setTimeout(this.priceNotification, 30000);
    }
}