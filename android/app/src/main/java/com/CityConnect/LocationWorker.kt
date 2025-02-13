package com.CityConnect

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
        private const val PREFS_NAME = "LocationPrefs"
        private const val LAST_LATITUDE = "last_latitude"
        private const val LAST_LONGITUDE = "last_longitude"
        private const val DISTANCE_THRESHOLD = 15000 // 15 km 
    }

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            val locationManager = applicationContext.getSystemService(Context.LOCATION_SERVICE) as LocationManager

            if (ActivityCompat.checkSelfPermission(applicationContext, Manifest.permission.ACCESS_FINE_LOCATION)
                != PackageManager.PERMISSION_GRANTED) {
                Log.e(TAG, "Konum izni verilmemiş")
                return@withContext Result.failure()
            }

            if (!locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                Log.e(TAG, "GPS kapalı")
                return@withContext Result.failure()
            }

            val location = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER)
                ?: locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)

            return@withContext if (location != null) {
                processLocation(location)
            } else {
                getFusedLocation()
            }
        } catch (e: Exception) {
            Log.e(TAG, "LocationWorker'da hata oluştu: ${e.message}")
            Result.failure()
        }
    }

    private suspend fun processLocation(location: Location): Result {
        val sharedPrefs = applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        
        // Son kaydedilen konumu al
        val lastLat = sharedPrefs.getFloat(LAST_LATITUDE, 0.0f).toDouble()
        val lastLng = sharedPrefs.getFloat(LAST_LONGITUDE, 0.0f).toDouble()

        // Eğer ilk kez konum alınıyorsa (0,0)
        if (lastLat == 0.0 && lastLng == 0.0) {
            updateLocationAndCallApi(location, sharedPrefs)
            return Result.success(createOutputData(location))
        }

        // Son konum ile yeni konum arasındaki mesafeyi hesapla
        val lastLocation = Location("last").apply {
            latitude = lastLat
            longitude = lastLng
        }

        val distance = location.distanceTo(lastLocation)
        Log.d(TAG, "Son konuma olan uzaklık: $distance metre")

        return if (distance >= DISTANCE_THRESHOLD) {
            updateLocationAndCallApi(location, sharedPrefs)
            Result.success(createOutputData(location))
        } else {
            Log.d(TAG, "API çağrısı atlandı - mesafe eşik(15KM) değerinden küçük")
            Result.success()
        }
    }

    private suspend fun updateLocationAndCallApi(location: Location, sharedPrefs: android.content.SharedPreferences) {
        // Yeni konumu kaydet
        sharedPrefs.edit().apply {
            putFloat(LAST_LATITUDE, location.latitude.toFloat())
            putFloat(LAST_LONGITUDE, location.longitude.toFloat())
            apply()
        }

        // Şehir adını al ve CityCheckWorker'ı başlat
        val cityName = getCityName(location.latitude, location.longitude) ?: "Bilinmeyen Şehir"
        startCityCheckWorker(cityName)
    }

    private fun createOutputData(location: Location): Data {
        return workDataOf(
            "latitude" to location.latitude,
            "longitude" to location.longitude
        )
    }

    private suspend fun getFusedLocation(): Result = withContext(Dispatchers.IO) {
        return@withContext try {
            val locationManager = applicationContext.getSystemService(Context.LOCATION_SERVICE) as LocationManager
            val networkLocation = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)

            if (networkLocation != null) {
                val cityName = getCityName(networkLocation.latitude, networkLocation.longitude)
                Log.d(TAG, "Ağ konumu: ${networkLocation.latitude}, ${networkLocation.longitude}, şehir: $cityName")
                Result.success(
                    workDataOf(
                        "latitude" to networkLocation.latitude,
                        "longitude" to networkLocation.longitude,
                        "state" to cityName
                    )
                )
            } else {
                Log.e(TAG, "Ağ konumu bulunamadı")
                Result.failure()
            }
        } catch (e: Exception) {
             Log.e(TAG, "Fused konum alınırken hata oluştu: ${e.message}")
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
                properties.optString("state", "Bilinmeyen Şehir")
            } else {
                "Bilinmeyen Şehir"
            }
        } catch (e: Exception) {
            Log.e(TAG, "Şehir adı alınırken hata oluştu: ${e.message}")
            "Bilinmeyen Şehir"
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
                ExistingWorkPolicy.REPLACE,
                cityCheckWorkRequest
            )
    }
}
