import React, { useState } from 'react';
import {
  Code,
  FileCode,
  Download,
  Copy,
  Check,
  Smartphone,
  ShieldAlert,
  Terminal,
  Cpu,
  Layers,
  ExternalLink,
} from 'lucide-react';

interface AndroidFile {
  name: string;
  path: string;
  description: string;
  language: string;
  content: string;
}

export const ANDROID_FILES: AndroidFile[] = [
  {
    name: 'AndroidManifest.xml',
    path: 'app/src/main/AndroidManifest.xml',
    description: 'Manifest declaring SYSTEM_ALERT_WINDOW, FOREGROUND_SERVICE, and overlay services.',
    language: 'xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.nova.signalpanel">

    <!-- Permissions for floating window overlay and networking -->
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="NOVA Signal AI"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.NovaSignalPanel"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.NovaSignalPanel">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Floating Window Overlay Background Service -->
        <service
            android:name=".service.OverlayService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="specialUse">
            <property
                android:name="android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE"
                android:value="Floating real-time trading statistics overlay over authorized browser window." />
        </service>

        <!-- Optional Accessibility Service to automatically open overlay when game launches -->
        <service
            android:name=".service.GameDetectorAccessibilityService"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
            android:exported="true">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
            <meta-data
                android:name="android.accessibilityservice"
                android:resource="@xml/accessibility_service_config" />
        </service>

    </application>

</manifest>`,
  },
  {
    name: 'OverlayService.kt',
    path: 'app/src/main/java/com/nova/signalpanel/service/OverlayService.kt',
    description: 'Core WindowManager overlay service with drag-and-drop, minimize, resize, and live polling.',
    language: 'kotlin',
    content: `package com.nova.signalpanel.service

import android.app.*
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.*
import android.widget.*
import androidx.core.app.NotificationCompat
import com.nova.signalpanel.R
import com.nova.signalpanel.api.WingoRepository
import com.nova.signalpanel.model.ParsedIssue
import kotlinx.coroutines.*
import kotlin.math.abs

/**
 * Native Android Floating Window Service using WindowManager.
 * Runs TYPE_APPLICATION_OVERLAY to float cleanly over any colour trading game.
 */
class OverlayService : Service() {

    private lateinit var windowManager: WindowManager
    private lateinit var overlayView: View
    private lateinit var params: WindowManager.LayoutParams

    private var initialX = 0
    private var initialY = 0
    private var initialTouchX = 0f
    private var initialTouchY = 0f
    private var isMinimized = false

    private val serviceScope = CoroutineScope(Dispatchers.Main + Job())
    private val repository = WingoRepository()

    // Views
    private lateinit var txtPeriodId: TextView
    private lateinit var txtNumber: TextView
    private lateinit var txtBigSmall: TextView
    private lateinit var txtBigRate: TextView
    private lateinit var txtSmallRate: TextView
    private lateinit var cardBig: View
    private lateinit var cardSmall: View
    private lateinit var layoutExpanded: View
    private lateinit var btnMinimize: ImageView
    private lateinit var btnClose: ImageView
    private lateinit var miniBubble: View
    private lateinit var txtMiniNumber: TextView

    companion object {
        const val CHANNEL_ID = "nova_overlay_channel"
        const val NOTIFICATION_ID = 1001
        const val ACTION_STOP = "com.nova.signalpanel.ACTION_STOP"
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        startForegroundServiceNotification()
        inflateOverlay()
        startLivePolling()
    }

    private fun startForegroundServiceNotification() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "NOVA Signal Panel Overlay",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Running real-time WinGo signal overlay"
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }

        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("NOVA SIGNAL PANEL AI Active")
            .setContentText("Overlay floating over active application")
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setOngoing(true)
            .build()

        startForeground(NOTIFICATION_ID, notification)
    }

    private fun inflateOverlay() {
        val inflater = LayoutInflater.from(this)
        overlayView = inflater.inflate(R.layout.layout_floating_panel, null)

        // Android Overlay Layout Params
        val layoutType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                    WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 50
            y = 150
        }

        initViews()
        setupTouchListener()

        windowManager.addView(overlayView, params)
    }

    private fun initViews() {
        txtPeriodId = overlayView.findViewById(R.id.txtPeriodId)
        txtNumber = overlayView.findViewById(R.id.txtNumber)
        txtBigSmall = overlayView.findViewById(R.id.txtBigSmall)
        txtBigRate = overlayView.findViewById(R.id.txtBigRate)
        txtSmallRate = overlayView.findViewById(R.id.txtSmallRate)
        cardBig = overlayView.findViewById(R.id.cardBig)
        cardSmall = overlayView.findViewById(R.id.cardSmall)
        layoutExpanded = overlayView.findViewById(R.id.layoutExpanded)
        btnMinimize = overlayView.findViewById(R.id.btnMinimize)
        btnClose = overlayView.findViewById(R.id.btnClose)
        miniBubble = overlayView.findViewById(R.id.miniBubble)
        txtMiniNumber = overlayView.findViewById(R.id.txtMiniNumber)

        btnMinimize.setOnClickListener { toggleMinimize() }
        miniBubble.setOnClickListener { toggleMinimize() }
        btnClose.setOnClickListener { stopSelf() }
    }

    private fun toggleMinimize() {
        isMinimized = !isMinimized
        if (isMinimized) {
            layoutExpanded.visibility = View.GONE
            miniBubble.visibility = View.VISIBLE
        } else {
            layoutExpanded.visibility = View.VISIBLE
            miniBubble.visibility = View.GONE
        }
        windowManager.updateViewLayout(overlayView, params)
    }

    private fun setupTouchListener() {
        val dragHandle = overlayView.findViewById<View>(R.id.dragHandle)
        val onTouch = View.OnTouchListener { _, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    initialX = params.x
                    initialY = params.y
                    initialTouchX = event.rawX
                    initialTouchY = event.rawY
                    true
                }
                MotionEvent.ACTION_MOVE -> {
                    params.x = initialX + (event.rawX - initialTouchX).toInt()
                    params.y = initialY + (event.rawY - initialTouchY).toInt()
                    windowManager.updateViewLayout(overlayView, params)
                    true
                }
                else -> false
            }
        }
        dragHandle.setOnTouchListener(onTouch)
        miniBubble.setOnTouchListener(onTouch)
    }

    private fun startLivePolling() {
        serviceScope.launch {
            while (isActive) {
                try {
                    val result = repository.getLatestWinGoHistory()
                    if (result.isNotEmpty()) {
                        updateUi(result.first(), result)
                    }
                } catch (e: Exception) {
                    txtPeriodId.text = "API Syncing..."
                }
                delay(3000) // Poll every 3 seconds
            }
        }
    }

    private fun updateUi(latest: ParsedIssue, history: List<ParsedIssue>) {
        txtPeriodId.text = latest.issueNumber
        txtNumber.text = String.format("%02d", latest.number)
        txtMiniNumber.text = "\${latest.number}"

        val isBig = latest.number >= 5
        txtBigSmall.text = if (isBig) "BIG (5-9)" else "SMALL (0-4)"
        cardBig.alpha = if (isBig) 1.0f else 0.4f
        cardSmall.alpha = if (!isBig) 1.0f else 0.4f

        val bigWins = history.count { it.number >= 5 }
        val bigPct = if (history.isNotEmpty()) (bigWins * 100) / history.size else 50
        txtBigRate.text = "\$bigPct%"
        txtSmallRate.text = "\${100 - bigPct}%"
    }

    override fun onDestroy() {
        super.onDestroy()
        serviceScope.cancel()
        if (::overlayView.isInitialized) {
            windowManager.removeView(overlayView)
        }
    }
}`,
  },
  {
    name: 'MainActivity.kt',
    path: 'app/src/main/java/com/nova/signalpanel/MainActivity.kt',
    description: 'Activity handling overlay permissions and launching the service.',
    language: 'kotlin',
    content: `package com.nova.signalpanel

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.nova.signalpanel.service.OverlayService

class MainActivity : AppCompatActivity() {

    private val OVERLAY_PERMISSION_REQ_CODE = 2026
    private lateinit var btnToggleOverlay: Button
    private lateinit var txtStatus: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        btnToggleOverlay = findViewById(R.id.btnToggleOverlay)
        txtStatus = findViewById(R.id.txtStatus)

        btnToggleOverlay.setOnClickListener {
            if (checkOverlayPermission()) {
                startOverlayService()
            } else {
                requestOverlayPermission()
            }
        }
    }

    private fun checkOverlayPermission(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Settings.canDrawOverlays(this)
        } else {
            true
        }
    }

    private fun requestOverlayPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Toast.makeText(this, "Please grant 'Display over other apps' permission", Toast.LENGTH_LONG).show()
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:$packageName")
            )
            startActivityForResult(intent, OVERLAY_PERMISSION_REQ_CODE)
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == OVERLAY_PERMISSION_REQ_CODE) {
            if (checkOverlayPermission()) {
                startOverlayService()
            } else {
                Toast.makeText(this, "Permission denied. Overlay cannot be shown.", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun startOverlayService() {
        val intent = Intent(this, OverlayService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent)
        } else {
            startService(intent)
        }
        txtStatus.text = "Overlay Active. Launch your colour trading game now!"
        moveTaskToBack(true) // Send app to background so user sees target game
    }
}`,
  },
  {
    name: 'WingoApiService.kt',
    path: 'app/src/main/java/com/nova/signalpanel/api/WingoApiService.kt',
    description: 'Retrofit2 API client fetching official JSON issue results.',
    language: 'kotlin',
    content: `package com.nova.signalpanel.api

import com.nova.signalpanel.model.WingoApiResponse
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET
import retrofit2.http.Query
import java.util.concurrent.TimeUnit

interface WingoApiService {

    @GET("WinGo/WinGo_1M/GetHistoryIssuePage.json")
    suspend fun getWinGo1MHistory(
        @Query("pageNo") pageNo: Int = 1,
        @Query("pageSize") pageSize: Int = 100,
        @Query("ts") timestamp: Long = System.currentTimeMillis()
    ): WingoApiResponse

    companion object {
        private const val BASE_URL = "https://draw.ar-lottery01.com/"

        fun create(): WingoApiService {
            val client = OkHttpClient.Builder()
                .connectTimeout(5, TimeUnit.SECONDS)
                .readTimeout(5, TimeUnit.SECONDS)
                .build()

            return Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
                .create(WingoApiService::class.java)
        }
    }
}`,
  },
  {
    name: 'WingoModels.kt',
    path: 'app/src/main/java/com/nova/signalpanel/model/WingoModels.kt',
    description: 'Gson serializable data classes mapping the exact JSON structure.',
    language: 'kotlin',
    content: `package com.nova.signalpanel.model

import com.google.gson.annotations.SerializedName

data class WingoApiResponse(
    @SerializedName("data") val data: WingoData?,
    @SerializedName("code") val code: Int,
    @SerializedName("msg") val msg: String?,
    @SerializedName("serviceTime") val serviceTime: Long?
)

data class WingoData(
    @SerializedName("list") val list: List<RawIssueItem>?,
    @SerializedName("pageNo") val pageNo: Int,
    @SerializedName("totalPage") val totalPage: Int,
    @SerializedName("totalCount") val totalCount: Int
)

data class RawIssueItem(
    @SerializedName("issueNumber") val issueNumber: String,
    @SerializedName("number") val number: String,
    @SerializedName("color") val color: String,
    @SerializedName("premium") val premium: String?,
    @SerializedName("sum") val sum: Int?
)

data class ParsedIssue(
    val issueNumber: String,
    val number: Int,
    val color: String,
    val isBig: Boolean
)`,
  },
  {
    name: 'build.gradle.kts',
    path: 'app/build.gradle.kts',
    description: 'Gradle build script with AndroidX, Coroutines, Retrofit, and OkHttp dependencies.',
    language: 'kotlin',
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.nova.signalpanel"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.nova.signalpanel"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")

    // Coroutines & Lifecycle
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    implementation("androidx.lifecycle:lifecycle-service:2.7.0")

    // Retrofit & Gson
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
}`,
  },
];

export const AndroidProjectViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<AndroidFile>(ANDROID_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* HEADER EXPLANATION */}
      <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3.5">
        <div className="flex items-center gap-2 text-emerald-400 font-bold font-cyber text-sm mb-1">
          <Smartphone className="w-4 h-4 text-emerald-400" />
          NATIVE ANDROID FLOATING OVERLAY ARCHITECTURE
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          In Android, floating windows over third-party applications (like Chrome or game APKs) require the
          <code className="bg-black/60 px-1.5 py-0.5 rounded text-emerald-300 mx-1 font-mono-terminal">SYSTEM_ALERT_WINDOW</code>
          permission and <code className="bg-black/60 px-1.5 py-0.5 rounded text-emerald-300 mx-1 font-mono-terminal">WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY</code>.
          Below is the complete production Kotlin codebase ready to build in Android Studio.
        </p>

        <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] font-mono-terminal">
          <div className="bg-black/60 rounded p-2 border border-emerald-900/40">
            <span className="text-emerald-400 font-bold block">✓ Supported in Web Preview</span>
            <span className="text-slate-400">Draggable window simulator, live real-time API sync, Big/Small &amp; 2-digit statistics.</span>
          </div>
          <div className="bg-black/60 rounded p-2 border border-emerald-900/40">
            <span className="text-amber-400 font-bold block">⚡ Requires Native Android APK</span>
            <span className="text-slate-400">Floating on top of native external Android game APKs, system-wide touch pass-through.</span>
          </div>
        </div>
      </div>

      {/* FILE EXPLORER & CODE VIEWER */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* File List */}
        <div className="space-y-1.5 bg-black/80 border border-emerald-950 rounded-xl p-2.5">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono-terminal px-1 mb-1">
            Source Files
          </div>
          {ANDROID_FILES.map((file) => (
            <button
              key={file.name}
              onClick={() => setSelectedFile(file)}
              className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-mono-terminal transition-all flex items-center justify-between cursor-pointer ${
                selectedFile.name === file.name
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <FileCode className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
                <span className="truncate">{file.name}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Code Content */}
        <div className="md:col-span-3 bg-black/90 border border-emerald-500/30 rounded-xl overflow-hidden flex flex-col">
          {/* File bar */}
          <div className="flex items-center justify-between bg-emerald-950/60 px-3 py-2 border-b border-emerald-900/40 text-xs font-mono-terminal">
            <div>
              <span className="text-emerald-300 font-bold">{selectedFile.name}</span>
              <span className="text-slate-500 text-[10px] ml-2">({selectedFile.path})</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 px-2 py-1 rounded bg-black/70 hover:bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[11px] transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownloadFile}
                className="flex items-center gap-1 px-2 py-1 rounded bg-black/70 hover:bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[11px] transition-colors cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Download</span>
              </button>
            </div>
          </div>

          <div className="p-2 bg-emerald-950/20 text-[11px] text-slate-400 border-b border-emerald-950 px-3">
            {selectedFile.description}
          </div>

          {/* Pre Code Box */}
          <div className="p-3 overflow-x-auto max-h-[380px] overflow-y-auto">
            <pre className="text-xs text-emerald-200 font-mono-terminal leading-relaxed">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* BUILD & INSTALLATION STEP-BY-STEP */}
      <div className="bg-black/80 border border-emerald-950 rounded-xl p-3.5 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-bold font-cyber text-sm">
          <Terminal className="w-4 h-4 text-emerald-400" />
          HOW TO BUILD &amp; RUN THE ANDROID APP
        </div>

        <ol className="list-decimal list-inside space-y-1.5 text-slate-400 font-mono-terminal text-[11px]">
          <li>
            <strong className="text-emerald-300">Open Android Studio:</strong> File → New → New Project (Empty Activity, Language: Kotlin, Min SDK: 24).
          </li>
          <li>
            <strong className="text-emerald-300">Copy Source Files:</strong> Paste <code className="text-slate-300">OverlayService.kt</code>, <code className="text-slate-300">WingoApiService.kt</code>, and <code className="text-slate-300">MainActivity.kt</code> into your package directory.
          </li>
          <li>
            <strong className="text-emerald-300">Add Dependencies:</strong> Update <code className="text-slate-300">app/build.gradle.kts</code> with the Retrofit, OkHttp, and Coroutines dependencies shown above and Sync Gradle.
          </li>
          <li>
            <strong className="text-emerald-300">Grant Overlay Permission:</strong> Launch the app. It will automatically prompt for &ldquo;Display over other apps&rdquo; (or open Android Settings → Apps → NOVA Signal AI → Allow display over other apps).
          </li>
          <li>
            <strong className="text-emerald-300">Launch Game:</strong> Tap &ldquo;Start Overlay&rdquo;. The floating neon panel appears. Open your browser or game (<code className="text-slate-300">dmfirst.hackdev.club</code>) — the overlay remains active on top!
          </li>
        </ol>
      </div>
    </div>
  );
};
