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
        return try {
            if (isGpsEnabled(applicationContext)) {
                val locationWork = OneTimeWorkRequestBuilder<LocationWorker>().build()
                WorkManager.getInstance(applicationContext).enqueue(locationWork)
                Result.success()
            } else {
                Log.d(TAG, "GPS KAPALI olduğu için LocationWorker başlatılmıyor. 15 dk sonra tekrar denenecek!")
                Result.failure()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error in GpsCheckWorker: ${e.message}")
            Result.failure()
        }
    }
}
