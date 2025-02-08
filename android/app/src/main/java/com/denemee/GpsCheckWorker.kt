package com.denemee

import android.content.Context
import android.location.LocationManager
import androidx.work.*
import java.util.concurrent.TimeUnit
import android.util.Log


class GpsCheckWorker(context: Context, workerParams: WorkerParameters) : Worker(context, workerParams) {
    
    companion object {
        const val WORK_NAME = "gps_check_worker"
        const val TAG = "GpsCheckWorker"
    }

    private fun isGpsEnabled(context: Context): Boolean {
        val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
        return locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)
    }

override fun doWork(): Result {
    val isGpsEnabled = isGpsEnabled(applicationContext)
    
    if (isGpsEnabled) {
        // GPS açıksa, CityCheckWorker'ı başlat
        startCityCheckWorker()
        Log.d(TAG, "GPS ACIK oldugu icin GpsCheckWorker icerisinde CityCheckWorker calisti")
    } else {
        // GPS kapalıysa, bildirim worker'ını durdur
        WorkManager.getInstance(applicationContext)
            .cancelUniqueWork(CityCheckWorker.WORK_NAME)
        Log.d(TAG, "GPS KAPALI oldugu icin GpsCheckWorker icerisinde CityCheckWorker calismadi")

    }

    return Result.success()
}

private fun startCityCheckWorker() {
    val constraints = Constraints.Builder()
        .setRequiresDeviceIdle(false)
        .setRequiresCharging(false)
        .build()

    val cityCheckWorkRequest = OneTimeWorkRequestBuilder<CityCheckWorker>()
        .setConstraints(constraints)
        .build()

    WorkManager.getInstance(applicationContext)
        .enqueueUniqueWork(
            CityCheckWorker.WORK_NAME,
            ExistingWorkPolicy.KEEP,  // Eğer çalışıyorsa yenisiyle değiştir
            cityCheckWorkRequest
        )
}
}