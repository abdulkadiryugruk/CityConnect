package com.denemee

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.work.Worker
import androidx.work.WorkerParameters

class NotificationWorker(context: Context, workerParams: WorkerParameters) : Worker(context, workerParams) {

    companion object {
        const val CHANNEL_ID = "my_channel_id"
        const val CHANNEL_NAME = "Bildirim Kanalı"
        const val WORK_NAME = "15 dklik kontrol" // benzersiz bir isim verin
    }
// isler burada yazilacak
override fun doWork(): Result {
        showNotification("WorkManager Çalışıyor", "15 dakikada bir bildirim!")
        return Result.success() // İş başarıyla tamamlandı
    }


private fun showNotification(title: String, message: String) {
        val notificationManager = applicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Bildirim kanalı oluştur (Android Oreo ve üzeri için zorunlu)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(CHANNEL_ID, CHANNEL_NAME, NotificationManager.IMPORTANCE_DEFAULT)
            notificationManager.createNotificationChannel(channel)
        }

        val notificationBuilder = NotificationCompat.Builder(applicationContext, CHANNEL_ID)
        .setSmallIcon(android.R.drawable.ic_dialog_info) // Varsayılan sistem ikonu kullan
        .setContentTitle(title) // Bu satırda hata yoksa, sorun çözülmüştür
        .setContentText(message)
        .setPriority(NotificationCompat.PRIORITY_DEFAULT)
        .setAutoCancel(true)

    notificationManager.notify(1, notificationBuilder.build())
    }
}