package com.denemee

import android.content.Context
import androidx.work.*
import org.json.JSONObject
import java.io.File
import java.util.concurrent.TimeUnit

class CityCheckWorker(context: Context, workerParams: WorkerParameters) : Worker(context, workerParams) {
    
    companion object {
        const val WORK_NAME = "city_check_worker"
    }

    override fun doWork(): Result {
        try {
            val filesDir = applicationContext.filesDir
            val jsonFile = File(filesDir, "UserCities.json")

            if (jsonFile.exists()) {
                val jsonContent = jsonFile.readText()
                val jsonObject = JSONObject(jsonContent)
                val citiesArray = jsonObject.getJSONArray("cities")

                // Denizli şehrini bul
                for (i in 0 until citiesArray.length()) {
                    val city = citiesArray.getJSONObject(i)
                    if (city.getString("name").trim() == "Denizli") {
                        val people = city.getJSONArray("people")
                        val personCount = people.length()

                        // Kişi sayısı bilgisiyle bildirim gönder
                        showCityNotification(personCount)
                        break
                    }
                }
            }

            return Result.success()
        } catch (e: Exception) {
            return Result.failure()
        }
    }

    private fun showCityNotification(personCount: Int) {
        val constraints = Constraints.Builder()
            .setRequiresDeviceIdle(false)
            .setRequiresCharging(false)
            .build()

        // Bildirim worker'ı için veriyi hazırla
        val data = Data.Builder()
            .putString("title", "Denizli Şehir Bilgisi")
            .putString("message", "Denizli şehrinde şu anda $personCount kişi bulunuyor")
            .build()

        val notificationWorkRequest = OneTimeWorkRequestBuilder<NotificationWorker>()
            .setConstraints(constraints)
            .setInputData(data)
            .build()

        WorkManager.getInstance(applicationContext)
            .enqueue(notificationWorkRequest)
    }
}