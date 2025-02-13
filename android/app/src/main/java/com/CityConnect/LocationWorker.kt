package com.CityConnect

import android.Manifest
import android.content.Context
import android.content.SharedPreferences
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
        private const val MAX_RETRIES = 3 // Maksimum yeniden deneme sayısı
        private const val RETRY_DELAY = 10000L // Her deneme arasında 10 saniye bekle
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
                val cityName = getCityNameWithRetry(networkLocation.latitude, networkLocation.longitude)
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

    private suspend fun getCityNameWithRetry(latitude: Double, longitude: Double): String = withContext(Dispatchers.IO) {
        var lastException: Exception? = null
        
        for (attempt in 1..MAX_RETRIES) {
            try {
                Log.d(TAG, "Şehir adı alma denemesi: $attempt")
                
                val urlString = "https://photon.komoot.io/reverse?lat=$latitude&lon=$longitude"
                val url = URL(urlString)
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "GET"
                connection.connectTimeout = 10000
                connection.readTimeout = 10000

                val inputStream = connection.inputStream
                val reader = BufferedReader(InputStreamReader(inputStream))
                val response = reader.use { it.readText() }

                val jsonObject = JSONObject(response)
                val features = jsonObject.getJSONArray("features")

                if (features.length() > 0) {
                    val properties = features.getJSONObject(0).getJSONObject("properties")
                    return@withContext properties.optString("state", "Bilinmeyen Şehir")
                }
                
                return@withContext "Bilinmeyen Şehir"
                
            } catch (e: Exception) {
                lastException = e
                Log.e(TAG, "Şehir adı alınırken hata oluştu (Deneme $attempt): ${e.message}")
                
                if (attempt < MAX_RETRIES) {
                    delay(RETRY_DELAY)
                    continue
                }
            }
        }

        Log.e(TAG, "Tüm denemeler başarısız oldu. Son hata: ${lastException?.message}")
        throw lastException ?: Exception("Şehir adı alınamadı")
    }

    private suspend fun updateLocationAndCallApi(location: Location, sharedPrefs: SharedPreferences) {
        sharedPrefs.edit().apply {
            putFloat(LAST_LATITUDE, location.latitude.toFloat())
            putFloat(LAST_LONGITUDE, location.longitude.toFloat())
            apply()
        }

        try {
            val cityName = getCityNameWithRetry(location.latitude, location.longitude)
            startCityCheckWorker(cityName)
        } catch (e: Exception) {
            Log.e(TAG, "Konum güncellemesi başarısız oldu: ${e.message}")
        }
    }

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