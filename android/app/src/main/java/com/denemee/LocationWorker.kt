package com.denemee

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationManager
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.work.*
import kotlinx.coroutines.*
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL

class LocationWorker(context: Context, workerParams: WorkerParameters) : CoroutineWorker(context, workerParams) {

    companion object {
        const val WORK_NAME = "location_worker"
        const val TAG = "LocationWorker"
    }

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            val locationManager = applicationContext.getSystemService(Context.LOCATION_SERVICE) as LocationManager

            if (ActivityCompat.checkSelfPermission(applicationContext, Manifest.permission.ACCESS_FINE_LOCATION)
                != PackageManager.PERMISSION_GRANTED) {
                Log.e(TAG, "Location permission not granted")
                return@withContext Result.failure()
            }

            if (!locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                Log.e(TAG, "GPS is disabled")
                return@withContext Result.failure()
            }

            val location = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER)
                ?: locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)

            return@withContext if (location != null) {
                val cityName = getCityName(location.latitude, location.longitude) ?: "Unknown City"
                val outputData = workDataOf(
                    "latitude" to location.latitude,
                    "longitude" to location.longitude,
                    "state" to cityName
                )
                Log.d(TAG, "Location: ${location.latitude}, ${location.longitude}, state: $cityName")

                // CityCheckWorker'ı başlat
                startCityCheckWorker(cityName)
                Result.success(outputData)
            } else {
                getFusedLocation()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error in LocationWorker: ${e.message}")
            Result.failure()
        }
    }

    private suspend fun getFusedLocation(): Result = withContext(Dispatchers.IO) {
        return@withContext try {
            val locationManager = applicationContext.getSystemService(Context.LOCATION_SERVICE) as LocationManager
            val networkLocation = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)

            if (networkLocation != null) {
                val cityName = getCityName(networkLocation.latitude, networkLocation.longitude)
                Log.d(TAG, "Network location: ${networkLocation.latitude}, ${networkLocation.longitude}, state: $cityName")
                Result.success(
                    workDataOf(
                        "latitude" to networkLocation.latitude,
                        "longitude" to networkLocation.longitude,
                        "state" to cityName
                    )
                )
            } else {
                Log.e(TAG, "No network location available")
                Result.failure()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error getting fused location: ${e.message}")
            Result.failure()
        }
    }

    private suspend fun getCityName(latitude: Double, longitude: Double): String? = withContext(Dispatchers.IO) {
        return@withContext try {
            val urlString = "https://photon.komoot.io/reverse?lat=$latitude&lon=$longitude"
            val url = URL(urlString)
            val connection = url.openConnection() as HttpURLConnection
            connection.requestMethod = "GET"
            connection.connectTimeout = 10000
            connection.readTimeout = 10000

            val inputStream = connection.inputStream
            val reader = BufferedReader(InputStreamReader(inputStream))
            val response = reader.use { it.readText() }

            // JSON yanıtını parse etme
            val jsonObject = JSONObject(response)
            val features = jsonObject.getJSONArray("features")

            if (features.length() > 0) {
                val properties = features.getJSONObject(0).getJSONObject("properties")
                properties.optString("state", "Unknown City")
            } else {
                "Unknown City"
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error getting city name: ${e.message}")
            "Unknown City"
        }
    }

    // CityCheckWorker'ı başlatan metot
    private fun startCityCheckWorker(cityName: String) {
        val inputData = workDataOf("state" to cityName)

        val constraints = Constraints.Builder()
            .setRequiresDeviceIdle(false)
            .setRequiresCharging(false)
            .build()

        val cityCheckWorkRequest = OneTimeWorkRequestBuilder<CityCheckWorker>()
            .setInputData(inputData)
            .setConstraints(constraints)
            .build()

        WorkManager.getInstance(applicationContext)
            .enqueueUniqueWork(
                CityCheckWorker.WORK_NAME,
                ExistingWorkPolicy.REPLACE,  // Eğer çalışıyorsa yenisiyle değiştir
                cityCheckWorkRequest
            )
    }
}
