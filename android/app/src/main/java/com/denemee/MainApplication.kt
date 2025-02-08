package com.denemee

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader

import androidx.work.*
import java.util.concurrent.TimeUnit

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {

            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, OpenSourceMergedSoMapping)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      load()
    }

    val constraints = Constraints.Builder()
            .setRequiresDeviceIdle(false) // Cihaz boşta olmasını gerektirmiyor
            .setRequiresCharging(false) // Şarjda olmasını gerektirmiyor
            .build()

        val workRequest = PeriodicWorkRequestBuilder<NotificationWorker>(20, TimeUnit.MINUTES) // 15 dakikada bir
            .setConstraints(constraints)
            .addTag(NotificationWorker.WORK_NAME) // İsteğe bağlı etiket
            .build()

        WorkManager.getInstance(applicationContext).enqueueUniquePeriodicWork(
            NotificationWorker.WORK_NAME, // Benzersiz bir isim
            ExistingPeriodicWorkPolicy.CANCEL_AND_REENQUEUE, // Daha önce planlanmış bir iş varsa ne yapılacağını belirtir
            workRequest
        )
    }
}