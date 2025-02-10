package com.denemee

import android.content.Context
import androidx.work.*
import org.json.JSONObject
import java.io.File
import android.util.Log

class CityCheckWorker(context: Context, workerParams: WorkerParameters) : Worker(context, workerParams) {

    companion object {
        const val WORK_NAME = "city_check_worker"
        const val TAG = "CityCheckWorker"
        private const val PREFS_NAME = "CityPrefs"
        private const val LAST_KNOWN_CITY = "last_known_city"
    }

    override fun doWork(): Result {
        return try {
            val cityName = inputData.getString("state") ?: "Unknown City"
            Log.d(TAG, "Konumdan alınan şehir: $cityName")

            // SharedPreferences'dan son bilinen şehri al
            val sharedPrefs = applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val lastKnownCity = sharedPrefs.getString(LAST_KNOWN_CITY, "")

            // Eğer şehir değiştiyse veya ilk kez kaydediliyorsa
            if (lastKnownCity != cityName) {
                Log.d(TAG, "Şehir değişikliği tespit edildi: $cityName")
                
                val filesDir = applicationContext.filesDir
                val jsonFile = File(filesDir, "UserCities.json")

                if (jsonFile.exists()) {
                    val jsonContent = jsonFile.readText()
                    val jsonObject = JSONObject(jsonContent)
                    val citiesArray = jsonObject.getJSONArray("cities")

                    for (i in 0 until citiesArray.length()) {
                        val city = citiesArray.getJSONObject(i)
                        if (city.getString("name").trim() == cityName) {
                            val people = city.getJSONArray("people")
                            val personCount = people.length()

                            val notificationWork = OneTimeWorkRequestBuilder<NotificationWorker>()
                                .setInputData(
                                    Data.Builder()
                                        .putString("title", "Yeni şehir algılandı!")
                                        .putString("message", "$cityName şehrinde şu anda $personCount kişi bulunuyor")
                                        .putInt("personCount", personCount)
                                        .build()
                                )
                                .build()

                            WorkManager.getInstance(applicationContext).enqueue(notificationWork)
                            Log.d(TAG, "Bildirim gönderildi: $cityName - $personCount kişi")
                            break
                        }
                    }
                }

                // Yeni şehri SharedPreferences'a kaydet
                sharedPrefs.edit().putString(LAST_KNOWN_CITY, cityName).apply()
            } else {
                Log.d(TAG, "Aynı şehirdesiniz: $cityName - Bildirim gönderilmedi")
            }

            Result.success()
        } catch (e: Exception) {
            Log.e(TAG, "Error in CityCheckWorker: ${e.message}")
            Result.failure()
        }
    }
}