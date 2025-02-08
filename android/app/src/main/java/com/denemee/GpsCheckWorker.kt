package com.denemee

import android.content.Context
import android.location.LocationManager
import androidx.work.*
import java.util.concurrent.TimeUnit

class GpsCheckWorker(context: Context, workerParams: WorkerParameters) : Worker(context, workerParams) {
    
    companion object {
        const val WORK_NAME = "gps_check_worker"
    }

    private fun isGpsEnabled(context: Context): Boolean {
        val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
        return locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)
    }

    override fun doWork(): Result {
        val isGpsEnabled = isGpsEnabled(applicationContext)
        
        if (isGpsEnabled) {
            // GPS açıksa, bildirim worker'ını başlat
            startNotificationWorker()
        } else {
            // GPS kapalıysa, bildirim worker'ını durdur
            WorkManager.getInstance(applicationContext)
                .cancelUniqueWork(NotificationWorker.WORK_NAME)
        }

        return Result.success()
    }

    private fun startNotificationWorker() {
        val constraints = Constraints.Builder()
            .setRequiresDeviceIdle(false)
            .setRequiresCharging(false)
            .build()

        val notificationWorkRequest = PeriodicWorkRequestBuilder<NotificationWorker>(15, TimeUnit.MINUTES)
            .setConstraints(constraints)
            .build()

        WorkManager.getInstance(applicationContext).enqueueUniquePeriodicWork(
            NotificationWorker.WORK_NAME,
            ExistingPeriodicWorkPolicy.KEEP,  // Eğer çalışıyorsa devam etsin
            notificationWorkRequest
        )
    }
}