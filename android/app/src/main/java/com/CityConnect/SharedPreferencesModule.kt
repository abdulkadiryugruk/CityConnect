package com.CityConnect

import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class SharedPreferencesModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "SharedPreferencesModule"

    @ReactMethod
    fun getString(prefsName: String, key: String, promise: Promise) {
        try {
            val sharedPrefs = reactApplicationContext.getSharedPreferences(prefsName, Context.MODE_PRIVATE)
            val value = sharedPrefs.getString(key, "") ?: ""
            promise.resolve(value)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
}