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
            // GPS açık olduğunda LocationWorker başlatılır
            val locationWork = OneTimeWorkRequestBuilder<LocationWorker>().build()
            val workManager = WorkManager.getInstance(applicationContext)

            // LocationWorker'ı başlat
            workManager.enqueue(locationWork)

            // Eğer LocationWorker başarılı olursa, işlemi başarılı olarak işaretle
            return Result.success()
        } else {
            // GPS kapalıysa, herhangi bir işlem yapma
            Log.d(TAG, "GPS kapalı olduğu için LocationWorker başlatılmıyor.")
            return Result.failure()  // GPS kapalıysa işlem başarısız olmalı
        }
    }

}
