package com.denemee

import android.content.Context
import androidx.work.Worker
import androidx.work.WorkerParameters
import android.util.Log

class BackgroundWorker(context: Context, workerParams: WorkerParameters) : Worker(context, workerParams) {

    override fun doWork(): Result {
        // Burada çalıştırılacak kodlarınızı yazın
        Log.d("BackgroundWorker", "WorkManager çalıştı!")

        // Örnek olarak bir API çağrısı veya veritabanı işlemi yapılabilir

        return Result.success() // İş başarılıysa
    }
}