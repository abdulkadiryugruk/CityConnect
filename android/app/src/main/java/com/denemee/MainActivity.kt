package com.denemee

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.provider.Settings
import android.util.Log
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.ReactInstanceManager
import com.facebook.react.ReactNativeHost
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.ReactApplication

class MainActivity : ReactActivity() {

    private val locationCheckReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            Log.d("MainActivity", "Broadcast alındı: ${intent?.action}")
            
            if (intent?.action == "com.denemee.LOCATION_CHECK") {
                Log.d("MainActivity", "ACTION: LOCATION_CHECK alınmış")
                
                // ReactContext ve ReactInstanceManager için loglar ekleyelim
                val reactApplication = context?.applicationContext as? ReactApplication
                Log.d("MainActivity", "ReactApplication elde edildi: $reactApplication")
                
                val reactInstanceManager = reactApplication?.reactNativeHost?.reactInstanceManager
                Log.d("MainActivity", "ReactInstanceManager elde edildi: $reactInstanceManager")
                
                if (reactInstanceManager == null) {
                    Log.e("MainActivity", "ReactInstanceManager null!")
                    return
                }

                val reactContext = reactInstanceManager.currentReactContext
                Log.d("MainActivity", "ReactContext elde edildi: $reactContext")

                if (reactContext != null && reactContext.hasActiveCatalystInstance()) {
    Log.d("MainActivity", "ReactContext aktif.")
    val params: WritableMap = Arguments.createMap()
    params.putString("type", "LOCATION_CHECK")
    reactContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit("locationCheck", params)
    Log.d("MainActivity", "Broadcast React Native'e gönderildi")
} else {
    Log.e("MainActivity", "ReactContext aktif değil veya yok")
}
            } else {
                Log.d("MainActivity", "Beklenmeyen ACTION: ${intent?.action}")
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        Log.d("MainActivity", "onCreate çağrıldı")

        // Pil optimizasyonu için izin iste
        requestBatteryOptimizationPermission()

        val filter = IntentFilter("com.denemee.LOCATION_CHECK")
        registerReceiver(locationCheckReceiver, filter)
        Log.d("MainActivity", "BroadcastReceiver kaydedildi")
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d("MainActivity", "onDestroy çağrıldı")
        unregisterReceiver(locationCheckReceiver)
        Log.d("MainActivity", "BroadcastReceiver iptal edildi")
    }

    /**
     * Pil optimizasyonundan muaf tutmak için izin isteyen fonksiyon
     */
    private fun requestBatteryOptimizationPermission() {
        Log.d("MainActivity", "Pil optimizasyonu izni kontrol ediliyor")
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (!powerManager.isIgnoringBatteryOptimizations(packageName)) {
                Log.d("MainActivity", "Pil optimizasyonu aktif, izin isteniyor")
                val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
                intent.data = Uri.parse("package:$packageName")
                startActivity(intent)
            } else {
                Log.d("MainActivity", "Pil optimizasyonu zaten kapalı")
            }
        }
    }

    override fun getMainComponentName(): String = "denemee"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
