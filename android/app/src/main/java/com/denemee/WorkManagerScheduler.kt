package com.denemee

import android.content.Context
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit

class WorkManagerScheduler {

    fun scheduleBackgroundWork(context: Context) {
        // Yarım saatte bir çalışacak bir iş isteği oluşturun
        val workRequest = PeriodicWorkRequestBuilder<BackgroundWorker>(
            15, TimeUnit.MINUTES // Yarım saatte bir
        ).build()

        // WorkManager'a işi planlamasını söyleyin
        WorkManager.getInstance(context).enqueue(workRequest)
    }
}