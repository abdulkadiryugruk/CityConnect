package com.denemee

import android.content.Context
import androidx.work.*
import org.json.JSONObject
import java.io.File
import java.util.concurrent.TimeUnit
import android.util.Log


class CityCheckWorker(context: Context, workerParams: WorkerParameters) : Worker(context, workerParams) {
    
    companion object {
        const val WORK_NAME = "city_check_worker"
        const val TAG = "CityCheckWorker"
    }

    override fun doWork(): Result {
        try {
            val filesDir = applicationContext.filesDir
            val jsonFile = File(filesDir, "UserCities.json")

            if (jsonFile.exists()) {
                val jsonContent = jsonFile.readText()
                val jsonObject = JSONObject(jsonContent)
                val citiesArray = jsonObject.getJSONArray("cities")

                for (i in 0 until citiesArray.length()) {
                    val city = citiesArray.getJSONObject(i)
                    if (city.getString("name").trim() == "Denizli") {
                        val people = city.getJSONArray("people")
                        val personCount = people.length()

                        // LocationWorker çalıştır
                        val locationWork = OneTimeWorkRequestBuilder<LocationWorker>()
                            .build()

                        // NotificationWorker'ı hazırla
                        val notificationWork = OneTimeWorkRequestBuilder<NotificationWorker>()
                            .setInputMerger(ArrayCreatingInputMerger::class.java)
                            .setInputData(
                                Data.Builder()
                                    .putString("title", "Denizli Şehir Bilgisi")
                                    .putString("message", "Denizli şehrinde şu anda $personCount kişi bulunuyor")
                                    .putInt("personCount", personCount)  // Kişi sayısını da ekleyelim
                                    .build()
                            )
                            .build()

                        // Work chain'i çalıştır
                        WorkManager.getInstance(applicationContext)
                            .beginWith(locationWork)
                            .then(notificationWork)
                            .enqueue()

                        Log.d(TAG, "Work chain started with personCount: $personCount")
                        break
                    }
                }
            }

            return Result.success()
        } catch (e: Exception) {
            Log.e(TAG, "Error in CityCheckWorker: ${e.message}")
            return Result.failure()
        }
    }
}