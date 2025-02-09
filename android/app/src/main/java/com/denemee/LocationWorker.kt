package com.denemee

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationManager
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.work.Worker
import androidx.work.WorkerParameters
import androidx.work.workDataOf
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

class LocationWorker(context: Context, workerParams: WorkerParameters) : Worker(context, workerParams) {

    companion object {
        const val WORK_NAME = "location_worker"
        const val TAG = "LocationWorker"
        private const val LOCATION_TIMEOUT = 30L // saniye
        private const val PHOTON_API_URL = "https://photon.komoot.io/reverse?lat=%f&lon=%f"
    }

    override fun doWork(): Result {
    try {
        val locationManager = applicationContext.getSystemService(Context.LOCATION_SERVICE) as LocationManager

        if (ActivityCompat.checkSelfPermission(applicationContext, Manifest.permission.ACCESS_FINE_LOCATION)
            != PackageManager.PERMISSION_GRANTED) {
            Log.e(TAG, "Location permission not granted")
            return Result.failure()
        }

        if (!locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
            Log.e(TAG, "GPS is disabled")
            return Result.failure()
        }

        val location = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER)

        return if (location != null) {
            val cityName = getCityName(location.latitude, location.longitude) ?: "Unknown City"
            val outputData = workDataOf(
                "latitude" to location.latitude,
                "longitude" to location.longitude,
                "city" to cityName
            )
            Log.d(TAG, "Location: ${location.latitude}, ${location.longitude}, City: $cityName")
            Result.success(outputData)
        } else {
            getFusedLocation()
        }
    } catch (e: Exception) {
        Log.e(TAG, "Error in LocationWorker: ${e.message}")
        return Result.failure()
    }
}


    private fun getFusedLocation(): Result {
        val latch = CountDownLatch(1)
        var result: Result = Result.failure()

        Handler(Looper.getMainLooper()).post {
            try {
                val locationManager = applicationContext.getSystemService(Context.LOCATION_SERVICE) as LocationManager
                val networkLocation = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)

                if (networkLocation != null) {
                    val cityName = getCityName(networkLocation.latitude, networkLocation.longitude)
                    result = Result.success(
                        workDataOf(
                            "latitude" to networkLocation.latitude,
                            "longitude" to networkLocation.longitude,
                            "city" to cityName
                        )
                    )
                    Log.d(TAG, "Network location: ${networkLocation.latitude}, ${networkLocation.longitude}, City: $cityName")
                } else {
                    Log.e(TAG, "No network location available")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error getting fused location: ${e.message}")
            } finally {
                latch.countDown()
            }
        }

        latch.await(5, TimeUnit.SECONDS)
        return result
    }

private fun getCityName(latitude: Double, longitude: Double): String? {
    return try {
        val urlString = "https://photon.komoot.io/reverse?lat=$latitude&lon=$longitude"
        val url = URL(urlString)
        val connection = url.openConnection() as HttpURLConnection
        connection.requestMethod = "GET"
        connection.connectTimeout = 5000
        connection.readTimeout = 5000

        val inputStream = connection.inputStream
        val reader = BufferedReader(InputStreamReader(inputStream))
        val response = reader.use { it.readText() }

        // JSON yanıtını parse etme
        val jsonObject = JSONObject(response)
        val features = jsonObject.getJSONArray("features")

        if (features.length() > 0) {
            val properties = features.getJSONObject(0).getJSONObject("properties")
            properties.optString("city", "Unknown City")
        } else {
            "Unknown City"
        }
    } catch (e: Exception) {
        Log.e(TAG, "Error getting city name: ${e.message}")
        "Unknown City"
    }
}

}
