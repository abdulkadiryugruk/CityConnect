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

import android.location.LocationManager
import android.content.Context

import androidx.work.*
import java.util.concurrent.TimeUnit

class MainApplication : Application(), ReactApplication {

    override val reactNativeHost: ReactNativeHost =
        object : DefaultReactNativeHost(this) {
            override fun getPackages(): List<ReactPackage> =
                PackageList(this).packages.apply {
                    // Burada özel paketlerinizi ekleyebilirsiniz
                }

            override fun getJSMainModuleName(): String = "index"

            override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

            override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
            override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
        }

    override val reactHost: ReactHost
        get() = getDefaultReactHost(applicationContext, reactNativeHost)

    private fun setupWorkers() {
        val constraints = Constraints.Builder()
            .setRequiresDeviceIdle(false)
            .setRequiresCharging(false)
            .build()

        // GPS kontrol worker'ı
        val gpsCheckWorkRequest = PeriodicWorkRequestBuilder<GpsCheckWorker>(15, TimeUnit.MINUTES)
            .setConstraints(constraints)
            .setInitialDelay(1, TimeUnit.MINUTES)  // 1 dakika gecikmeyle başla
            .build()

        // Kişi sayısı kontrol worker'ı
        val cityCheckWorkRequest = PeriodicWorkRequestBuilder<CityCheckWorker>(15, TimeUnit.MINUTES)
            .setConstraints(constraints)
            .setInitialDelay(2, TimeUnit.MINUTES)  // 2 dakika gecikmeyle başla
            .build()

        val workManager = WorkManager.getInstance(applicationContext)

        // Worker'ları başlat
        workManager.enqueueUniquePeriodicWork(
            GpsCheckWorker.WORK_NAME,
            ExistingPeriodicWorkPolicy.REPLACE,
            gpsCheckWorkRequest
        )

        workManager.enqueueUniquePeriodicWork(
            CityCheckWorker.WORK_NAME,
            ExistingPeriodicWorkPolicy.REPLACE,
            cityCheckWorkRequest
        )
    }

    override fun onCreate() {
        super.onCreate()
        SoLoader.init(this, OpenSourceMergedSoMapping)
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            load()
        }

        // Tüm worker'ları tek bir fonksiyonda başlat
        setupWorkers()
    }
}