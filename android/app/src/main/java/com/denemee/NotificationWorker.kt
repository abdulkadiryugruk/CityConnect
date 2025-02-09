package com.denemee

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.work.Worker
import androidx.work.WorkerParameters
import android.util.Log



class NotificationWorker(context: Context, workerParams: WorkerParameters) : Worker(context, workerParams) {

    companion object {
        const val CHANNEL_ID = "my_channel_id"
        const val CHANNEL_NAME = "Bildirim Kanalı"
        const val WORK_NAME = "notification_worker"
        const val TAG = "NotificationWorker"
    }

    override fun doWork(): Result {
        try {
            val title = inputData.getStringArray("title")?.firstOrNull()
            val message = inputData.getStringArray("message")?.firstOrNull()
            val latitude = inputData.getDoubleArray("latitude")?.firstOrNull() ?: 0.0
            val personCount = inputData.getIntArray("personCount")?.firstOrNull() ?: 0
            val longitude = inputData.getDoubleArray("longitude")?.firstOrNull() ?: 0.0

            Log.d(TAG, "Input data: $inputData")

            if (title == null || message == null) {
                Log.e(TAG, "Missing title or message")
                return Result.failure()
            }

            // Final mesajı oluştur
            var finalMessage = message
            if (latitude != 0.0 && longitude != 0.0) {
                finalMessage += " ve koordinatlar: $latitude - $longitude"
            }

            Log.d(TAG, "Showing notification with message: $finalMessage")
            showNotification(title, finalMessage)
            return Result.success()
        } catch (e: Exception) {
            Log.e(TAG, "Error in NotificationWorker: ${e.message}")
            return Result.failure()
        }
    }

    private fun showNotification(title: String, message: String) {
        val notificationManager = applicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(CHANNEL_ID, CHANNEL_NAME, NotificationManager.IMPORTANCE_DEFAULT)
            notificationManager.createNotificationChannel(channel)
        }

        val notificationBuilder = NotificationCompat.Builder(applicationContext, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)

        notificationManager.notify(1, notificationBuilder.build())
    }
}