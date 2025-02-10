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
        return try {
            val title = inputData.getString("title")
            val message = inputData.getString("message")
            val personCount = inputData.getInt("personCount", 0)

            Log.d(TAG, "Input data: $inputData")

            if (title == null || message == null) {
                Log.e(TAG, "Missing title or message")
                return Result.failure()
            }

            val finalMessage = "$message."
            Log.d(TAG, "Bildirim mesaji: $message")
            
            showNotification(title, message)
            Result.success()
        } catch (e: Exception) {
            Log.e(TAG, "Error in NotificationWorker: ${e.message}")
            Result.failure()
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
