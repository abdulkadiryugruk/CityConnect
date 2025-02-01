package com.denemee

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class WorkManagerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "WorkManagerModule"
    }

    @ReactMethod
    fun scheduleWork() {
        val scheduler = WorkManagerScheduler()
        scheduler.scheduleBackgroundWork(reactApplicationContext)
    }
}