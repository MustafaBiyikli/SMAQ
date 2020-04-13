package com.samadevelopment.mustafa.smaq;

import android.app.Application;
import android.app.NotificationManager;
import android.os.Build;

public class NotificationChannel extends Application {

    public static final String CHANNEL_1_ID = "AlertsChannel";

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel("SMAQ Alerts", "This channel is responsible for smaq alerts above and below safe thresholds");
    }

    private void createNotificationChannel(String chName, String chDescription) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = chName;
            String description = chDescription;
            int importance = NotificationManager.IMPORTANCE_DEFAULT;
            android.app.NotificationChannel channel = new android.app.NotificationChannel(CHANNEL_1_ID, name, importance);
            channel.setDescription(description);

            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }
}
