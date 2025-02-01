package com.denemee

import android.content.Context
import androidx.work.*
import java.util.concurrent.TimeUnit
import android.util.Log

class WorkManagerScheduler {
    fun scheduleBackgroundWork(context: Context) {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.NOT_REQUIRED)
            .build()

        val workRequest = PeriodicWorkRequestBuilder<BackgroundWorker>(
            15, TimeUnit.MINUTES
        )
        .setConstraints(constraints)
        .setBackoffCriteria(
            BackoffPolicy.LINEAR,
            WorkRequest.MIN_BACKOFF_MILLIS,
            TimeUnit.MILLISECONDS
        )
        .addTag(WORK_TAG)
        .build()

        WorkManager.getInstance(context).also { workManager ->
            workManager.cancelAllWorkByTag(WORK_TAG)
            workManager.enqueueUniquePeriodicWork(
                WORK_NAME,
                ExistingPeriodicWorkPolicy.REPLACE,
                workRequest
            )
        }
        
        Log.d(TAG, "15 dakikalık periyodik iş planlandı")
    }

    fun cancelBackgroundWork(context: Context) {
        WorkManager.getInstance(context).cancelAllWorkByTag(WORK_TAG)
        Log.d(TAG, "Background work iptal edildi")
    }

    companion object {
        private const val TAG = "WorkManagerScheduler"
        private const val WORK_TAG = "background_work_tag"
        private const val WORK_NAME = "background_work"
    }
}