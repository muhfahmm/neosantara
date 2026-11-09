PS D:\project-sendiri\neosantara1> npm run tauri:android:dev -- --host 192.168.137.1

> presiden-simulator@1.0.0 tauri:android:dev
> npm run tauri:android:dev -w frontend -- --host 192.168.137.1


> frontend@0.1.0 tauri:android:dev
> node scripts/tauri-android-dev.mjs --host 192.168.137.1

Tauri Android akan menggunakan port Next.js 3000.
        Info ANDROID_HOME not set, trying to locate Android SDK...
        Info Using installed Android SDK: C:\Users\LOQ\AppData\Local\Android/Sdk
        Info Using installed NDK: C:\Users\LOQ\AppData\Local\Android/Sdk\ndk\29.0.13846066
        Info Starting emulator Medium_Phone_API_37.0
        Info Waiting for emulator to start...
        Info Replacing devUrl host with 192.168.137.1. If your frontend is not listening on that address, try configuring your development server to use the `TAURI_DEV_HOST` environment variable or 0.0.0.0 as host.
     Running BeforeDevCommand (`node scripts/dev-server.mjs --port 3000`)
Next.js: http://localhost:3000
Dialog API: http://localhost:8000
INFO:     Started server process [24020]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
▲ Next.js 16.2.4 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://0.0.0.0:3000
- Environments: .env.local
✓ Ready in 986ms
- Experiments (use with caution):
  · optimizePackageImports
  ⨯ reactDebugChannel

 GET / 200 in 910ms (next.js: 570ms, application-code: 340ms)
[Warmup] Menghangatkan Next.js dev server pada port 3000...
   Compiling app v0.1.0 (D:\project-sendiri\neosantara1\apps\src-tauri)
Connected to PostgreSQL database 'db_presiden_simulator' successfully!
[Warmup] / -> HTTP 200
 GET / 200 in 865ms (next.js: 13ms, application-code: 852ms)
 GET /page 200 in 869ms (next.js: 67ms, application-code: 801ms)  
[Warmup] /page -> HTTP 200
 GET /page/map_system/pilih-negara 200 in 894ms (next.js: 260ms, application-code: 634ms)
[Warmup] /page/map_system/pilih-negara -> HTTP 200
[Warmup] /page/map_system -> HTTP 200
 GET /page/map_system 200 in 896ms (next.js: 493ms, application-code: 403ms)
[Warmup] /map_engine_rs_bg.wasm -> HTTP 200
[Warmup] /world_mobile.geojson -> HTTP 200
[PERF-TEMP:DB] 470.3ms | SELECT source_file, file_order, entry_key, entry_order, metadata FROM database_building_me
[PERF-TEMP:DB] 509.7ms | SELECT country_slug, target_country, relation FROM database_hubungan_antar_negara ORDER BY
[PERF-TEMP:DB] 508.7ms | SELECT country_slug, mitra_country, embassy_type, status FROM database_kedutaan_besar ORDE
[PERF-TEMP:DB] 510.2ms | SELECT country_slug, mitra_no, mitra_country, trade_type, status FROM database_mitra_perda
 GET /api/game-bootstrap 200 in 1035ms (next.js: 421ms, application-code: 614ms)
[Warmup] /api/game-bootstrap -> HTTP 200
[Warmup] Selesai dalam 1066 ms. Halaman telah terkompilasi!       
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 8.80s
        Info symlinking lib "D:\\project-sendiri\\neosantara1\\apps\\src-tauri\\target\\x86_64-linux-android\\debug\\libapp_lib.so" in jniLibs dir "D:\\project-sendiri\\neosantara1\\apps\\src-tauri\\gen/android\\app/src/main/jniLibs/x86_64"
        Info "D:\\project-sendiri\\neosantara1\\apps\\src-tauri\\target\\x86_64-linux-android\\debug\\libapp_lib.so" requires shared lib "liblog.so"
        Info "D:\\project-sendiri\\neosantara1\\apps\\src-tauri\\target\\x86_64-linux-android\\debug\\libapp_lib.so" requires shared lib "libandroid.so"
        Info "D:\\project-sendiri\\neosantara1\\apps\\src-tauri\\target\\x86_64-linux-android\\debug\\libapp_lib.so" requires shared lib "libdl.so"
        Info "D:\\project-sendiri\\neosantara1\\apps\\src-tauri\\target\\x86_64-linux-android\\debug\\libapp_lib.so" requires shared lib "libm.so"
        Info "D:\\project-sendiri\\neosantara1\\apps\\src-tauri\\target\\x86_64-linux-android\\debug\\libapp_lib.so" requires shared lib "libc.so"
        Info symlink at "D:\\project-sendiri\\neosantara1\\apps\\src-tauri\\gen/android\\app/src/main/jniLibs/arm64-v8a\\libapp_lib.so" points to "D:\\project-sendiri\\neosantara1\\apps\\src-tauri\\target\\aarch64-linux-android\\debug\\libapp_lib.so"
        Info symlink at "D:\\project-sendiri\\neosantara1\\apps\\src-tauri\\gen/android\\app/src/main/jniLibs/armeabi-v7a\\libapp_lib.so" points to "D:\\project-sendiri\\neosantara1\\apps\\src-tauri\\target\\armv7-linux-androideabi\\debug\\libapp_lib.so"
        Info symlink at "D:\\project-sendiri\\neosantara1\\apps\\src-tauri\\gen/android\\app/src/main/jniLibs/x86\\libapp_lib.so" points to "D:\\project-sendiri\\neosantara1\\apps\\src-tauri\\target\\i686-linux-android\\debug\\libapp_lib.so"
        Info symlink at "D:\\project-sendiri\\neosantara1\\apps\\src-tauri\\gen/android\\app/src/main/jniLibs/x86_64\\libapp_lib.so" points to "D:\\project-sendiri\\neosantara1\\apps\\src-tauri\\target\\x86_64-linux-android\\debug\\libapp_lib.so"

> frontend@0.1.0 tauri
> tauri android android-studio-script --target x86_64

<===========--> 90% EXECUTING [2s]
> :app:rustBuildX86_64Debug                                           Info Using installed NDK: C:\Users\LOQ\AppData\Local\Android/S   Compiling app v0.1.0 (D:\project-sendiri\neosantara1\apps\src-tauri)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 5.45sp:rustBuildX86_64Debug
        Info symlinking lib "D:\\project-sendiri\\neosantara1\\apps\\src-tauri\\target\\x86_64-linux-android\\debug\\libapp_lib.so" in jniLibs dir "D:\\project-sendiri\\neosantara1\\apps\\src-tauri\\gen/android\\app/src/main/jniLibs/x86_64"
        Info "D:\\project-sendiri\\neosantara1\\apps\\src-tauri\\target\\x86_64-linux-android\\debug\\libapp_lib.so" requires shared lib "liblog.so"
        Info "D:\\project-sendiri\\neosantara1\\apps\\src-tauri\\target\\x86_64-linux-android\\debug\\libapp_lib.so" requires shared lib "libandroid.so"
        Info "D:\\project-sendiri\\neosantara1\\apps\\src-tauri\\target\\x86_64-linux-android\\debug\\libapp_lib.so" requires shared lib "libdl.so"
        Info "D:\\project-sendiri\\neosantara1\\apps\\src-tauri\\target\\x86_64-linux-android\\debug\\libapp_lib.so" requires shared lib "libm.so"
        Info "D:\\project-sendiri\\neosantara1\\apps\\src-tauri\\target\\x86_64-linux-android\\debug\\libapp_lib.so" requires shared lib "libc.so"
Configuration cache entry reused.
Performing Streamed Install
Success
Starting: Intent { cmp=com.presiden.simulator.debug/com.presiden.simulator.MainActivity }
 GET / 200 in 124ms (next.js: 7ms, application-code: 117ms)
 GET /api/game-bootstrap 200 in 30ms (next.js: 9ms, application-code: 22ms)
        Info Watching D:\project-sendiri\neosantara1\apps\src-tauri for changes...
--------- beginning of main
11-09 20:21:39.585  5169  5169 I libprocessgroup: Created cgroup /sys/fs/cgroup/apps/uid_10235/pid_5169
11-09 20:21:39.905  5169  5169 I Zygote  : Process 5169 created for com.presiden.simulator.debug
11-09 20:21:39.906  5169  5169 I simulator.debug: Late-enabling -Xcheck:jni
11-09 20:21:40.239  5169  5169 W simulator.debug: Suspending all threads took: 11.474ms
11-09 20:21:40.241  5169  5169 I simulator.debug: Using generational CollectorTypeCMC GC.
11-09 20:21:40.247  5169  5169 W simulator.debug: Unexpected CPU variant for x86: x86_64.
11-09 20:21:40.247  5169  5169 W simulator.debug: Known variants: atom, sandybridge, silvermont, goldmont, goldmont-plus, goldmont-without-sha-xsaves, tremont, kabylake, alderlake, pantherlake, default
--------- beginning of system
11-09 20:21:41.726  5169  5215 I DisplayManager: Choreographer implicitly registered for the refresh rate.
11-09 20:21:41.885  5169  5215 I GFXSTREAM: [eglDisplay.cpp(297)] Opening libGLESv1_CM_emulation.so
11-09 20:21:41.885  5169  5215 I GFXSTREAM: [eglDisplay.cpp(297)] Opening libGLESv2_emulation.so
11-09 20:21:41.886  5169  5215 W libc    : Access denied finding property "vendor.mesa.virtgpu.kumquat"
11-09 20:21:41.922  5169  5215 W HWUI    : Failed to choose config with EGL_SWAP_BEHAVIOR_PRESERVED, retrying without...
11-09 20:21:41.922  5169  5215 W HWUI    : Failed to initialize 101010-2 format, error = EGL_SUCCESS
11-09 20:21:42.490  5169  5169 I simulator.debug: hiddenapi: Accessing hidden method Landroid/view/ViewGroup;->makeOptionalFitsSystemWindows()V (runtime_flags=0, domain=platform, api=unsupported) from Landroidx/appcompat/widget/ViewUtils; (domain=app, TargetSdkVersion=36) using reflection: allowed
11-09 20:21:42.531  5169  5169 W HWUI    : Unknown dataspace 0    
11-09 20:21:42.567  5169  5236 W libc    : Access denied finding property "vendor.mesa.virtgpu.kumquat"
11-09 20:21:42.605  5169  5169 I Surface : Creating surface for consumer unnamed-5169-0 with slotExpansion=1 for 64 slots
11-09 20:21:42.606  5169  5169 I Surface : Creating surface for consumer VRI[MainActivity]#0(BLAST Consumer)0 with slotExpansion=1 for 64 slots
11-09 20:21:42.745  5169  5169 I WebViewFactory: Loading com.google.android.webview version 145.0.7632.218 (code 763221809)
11-09 20:21:43.156  5169  5169 I cr_WVCFactoryProvider: version=145.0.7632.218 (763221809) minSdkVersion=29 multiprocess=true packageId=2 splits=<none>
11-09 20:21:43.201  5169  5244 E chromium: [1109/202143.199981:ERROR:android_webview/browser/variations/variations_seed_loader.cc:39] Seed missing signature.
11-09 20:21:43.202  5169  5224 I RustStdoutStderr: [1109/202143.199981:ERROR:android_webview/browser/variations/variations_seed_loader.cc:39] Seed missing signature.
11-09 20:21:43.203  5169  5244 I chromium: [1109/202143.202021:INFO:android_webview/browser/variations/variations_seed_loader.cc:67] Failed to open file for reading.: No such file or directory (2)  
11-09 20:21:43.203  5169  5224 I RustStdoutStderr: [1109/202143.202021:INFO:android_webview/browser/variations/variations_seed_loader.cc:67] Failed to open file for reading.: No such file or directory (2)
11-09 20:21:43.231  5169  5169 I cr_LibraryLoader: Successfully loaded native library
11-09 20:21:43.235  5169  5169 I cr_CachingUmaRecorder: Flushed 18 samples from 18 histograms, 0 samples were dropped.
11-09 20:21:43.247  5169  5169 I cr_ChildProcLH: ScopedServiceBindingBatch.tryActivate: false
11-09 20:21:43.253  5169  5169 I cr_CombinedPProvider: #registerProvider() provider:WV.qk@1d1af28 isPolicyCacheEnabled:false policyProvidersSize:0
11-09 20:21:43.255  5169  5169 I cr_PolicyProvider: #setManagerAndSource() 0
11-09 20:21:43.260  5169  5169 I cr_DisplayManager: Is Display Topology available: false
11-09 20:21:43.329  5169  5169 I cr_CombinedPProvider: #linkNativeInternal() 1
11-09 20:21:43.331  5169  5169 I cr_AppResProvider: #getApplicationRestrictionsFromUserManager() Bundle[EMPTY_PARCEL]
11-09 20:21:43.331  5169  5169 I cr_PolicyProvider: #notifySettingsAvailable() 0
11-09 20:21:43.331  5169  5169 I cr_CombinedPProvider: #onSettingsAvailable() 0
11-09 20:21:43.331  5169  5169 I cr_CombinedPProvider: #flushPolicies()
11-09 20:21:43.418  5169  5261 W chromium: [WARNING:net/dns/dns_config_service_android.cc:69] Failed to read DnsConfig.
11-09 20:21:43.418  5169  5224 I RustStdoutStderr: [WARNING:net/dns/dns_config_service_android.cc:69] Failed to read DnsConfig.     
11-09 20:21:43.457  5169  5169 W chromium: [WARNING:android_webview/browser/network_service/net_helpers.cc:137] HTTP Cache size is: 20971520
11-09 20:21:43.458  5169  5224 I RustStdoutStderr: [WARNING:android_webview/browser/network_service/net_helpers.cc:137] HTTP Cache size is: 20971520
11-09 20:21:43.707  5169  5169 I Choreographer: Skipped 66 frames!  The application may be doing too much work on its main thread.  
11-09 20:21:43.715  5169  5279 I CameraManagerGlobal: Connecting to camera service
11-09 20:21:43.775  5169  5169 W libc    : Access denied finding property "vendor.mesa.virtgpu.kumquat"
11-09 20:21:43.778  5169  5169 W libc    : Access denied finding property "vendor.mesa.log"
11-09 20:21:43.778  5169  5169 W libc    : Access denied finding property "vendor.mesa.log.level"
11-09 20:21:43.778  5169  5169 W libc    : Access denied finding property "vendor.mesa.log.prefix"
11-09 20:21:43.779  5169  5169 W libc    : Access denied finding property "vendor.mesa.gallium.print.options"
11-09 20:21:43.779  5169  5169 W libc    : Access denied finding property "vendor.mesa.log.file.auto"
11-09 20:21:43.779  5169  5169 W libc    : Access denied finding property "vendor.mesa.log.file"
11-09 20:21:43.779  5169  5169 E MESA    : Failed to open rendernode: No such file or directory
11-09 20:21:43.779  5169  5169 W libc    : Access denied finding property "vendor.mesa.virtgpu.kumquat"
11-09 20:21:43.780  5169  5169 E MESA    : Failed to open rendernode: No such file or directory
11-09 20:21:43.780  5169  5169 W libc    : Access denied finding property "vendor.mesa.virtgpu.kumquat"
11-09 20:21:43.799  5169  5169 W libc    : Access denied finding property "vendor.mesa.virtgpu.kumquat"
11-09 20:21:43.799  5169  5169 E MESA    : Failed to open rendernode: No such file or directory
11-09 20:21:43.816  5169  5169 W libc    : Access denied finding property "vendor.mesa.virtgpu.kumquat"
11-09 20:21:43.816  5169  5169 E MESA    : Failed to open rendernode: No such file or directory
11-09 20:21:43.816  5169  5169 W libc    : Access denied finding property "vendor.mesa.virtgpu.kumquat"
11-09 20:21:43.816  5169  5169 E MESA    : Failed to open rendernode: No such file or directory
11-09 20:21:43.818  5169  5169 W libc    : Access denied finding property "vendor.mesa.virtgpu.kumquat"
11-09 20:21:43.818  5169  5169 E MESA    : Failed to open rendernode: No such file or directory
11-09 20:21:43.818  5169  5169 W libc    : Access denied finding property "vendor.mesa.virtgpu.kumquat"
11-09 20:21:43.818  5169  5169 E MESA    : Failed to open rendernode: No such file or directory
11-09 20:21:43.820  5169  5169 W libc    : Access denied finding property "vendor.mesa.virtgpu.kumquat"
11-09 20:21:43.820  5169  5169 E MESA    : Failed to open rendernode: No such file or directory
11-09 20:21:43.820  5169  5169 W libc    : Access denied finding property "vendor.mesa.virtgpu.kumquat"
11-09 20:21:43.820  5169  5169 E MESA    : Failed to open rendernode: No such file or directory
11-09 20:21:43.821  5169  5169 W libc    : Access denied finding property "vendor.mesa.vk.trace"
11-09 20:21:43.822  5169  5169 W libc    : Access denied finding property "vendor.mesa.vk.trace.per.submit"
11-09 20:21:43.822  5169  5169 W libc    : Access denied finding property "vendor.mesa.vk.trace.frame"
11-09 20:21:43.822  5169  5169 W libc    : Access denied finding property "vendor.mesa.vk.trace.trigger"
11-09 20:21:43.841  5169  5169 W libc    : Access denied finding property "vendor.mesa.vk.wsi.debug"
11-09 20:21:43.842  5169  5169 W libc    : Access denied finding property "vendor.mesa.virtgpu.kumquat"
11-09 20:21:43.842  5169  5169 E MESA    : Failed to open rendernode: No such file or directory
11-09 20:21:43.845  5169  5169 W libc    : Access denied finding property "vendor.mesa.virtgpu.kumquat"
11-09 20:21:43.845  5169  5169 E MESA    : Failed to open rendernode: No such file or directory
11-09 20:21:43.851  5169  5169 W libc    : Access denied finding property "vendor.mesa.vk.wsi.present.mode"
11-09 20:21:43.851  5169  5169 W libc    : Access denied finding property "vendor.mesa.vk.wsi.headless.swapchain"
11-09 20:21:43.851  5169  5169 W libc    : Access denied finding property "vendor.mesa.virtgpu.kumquat"
11-09 20:21:43.851  5169  5169 E MESA    : Failed to open rendernode: No such file or directory
11-09 20:21:43.852  5169  5169 W libc    : Access denied finding property "vendor.mesa.virtgpu.kumquat"
11-09 20:21:43.852  5169  5169 E MESA    : Failed to open rendernode: No such file or directory
11-09 20:21:43.857  5169  5169 W libc    : Access denied finding property "vendor.mesa.virtgpu.kumquat"
11-09 20:21:43.959  5169  5192 I HWUI    : Davey! duration=1350ms; Flags=0, FrameTimelineVsyncId=27012, IntendedVsync=603050451228, Vsync=604150451184, InputEventId=0, HandleInputStart=604155194700, AnimationStart=604155285400, PerformTraversalsStart=604155368700, DrawStart=604165545100, FrameDeadline=603183784556, FrameStartTime=604154910500, FrameInterval=16666666, WorkloadTarget=16666666, AnimationTime=604150451184, SyncQueued=604388208400, SyncStart=604388854200, IssueDrawCommandsStart=604388949200, SwapBuffers=604389182200, FrameCompleted=604401910600, DequeueBufferDuration=25800, QueueBufferDuration=375300, GpuCompleted=604401910600, SwapBuffersCompleted=604390282700, DisplayPresentTime=0, CommandSubmissionCompleted=604389182200,
11-09 20:21:43.977  5169  5284 W libc    : Access denied finding property "vendor.mesa.virtgpu.kumquat"
11-09 20:21:44.003  5169  5268 W cr_media: BLUETOOTH_CONNECT permission is missing.
11-09 20:21:44.006  5169  5268 W cr_media: getBluetoothAdapter() requires BLUETOOTH permission
11-09 20:21:44.007  5169  5268 W cr_media: registerBluetoothIntentsIfNeeded: Requires BLUETOOTH permission
11-09 20:21:44.012  5169  5282 I HWUI    : Using FreeType backend (prop=Auto)
11-09 20:21:44.049  5169  5169 W ThreadPoolForeg: type=1400 audit(0.0:55): avc:  denied  { search } for  name="/" dev="cgroup2" ino=1 scontext=u:r:untrusted_app_34:s0:c235,c256,c512,c768 tcontext=u:object_r:cgroup_v2:s0 tclass=dir permissive=0 app=com.presiden.simulator.debug
11-09 20:21:44.053  5169  5169 W ThreadPoolForeg: type=1400 audit(0.0:56): avc:  denied  { search } for  name="/" dev="cgroup2" ino=1 scontext=u:r:untrusted_app_34:s0:c235,c256,c512,c768 tcontext=u:object_r:cgroup_v2:s0 tclass=dir permissive=0 app=com.presiden.simulator.debug
11-09 20:21:44.061  5169  5169 W ThreadPoolForeg: type=1400 audit(0.0:57): avc:  denied  { search } for  name="/" dev="cgroup" ino=1 scontext=u:r:untrusted_app_34:s0:c235,c256,c512,c768 tcontext=u:object_r:cgroup:s0 tclass=dir permissive=0 app=com.presiden.simulator.debug
11-09 20:21:44.145  5169  5169 I ImeTracker: com.presiden.simulator.debug:5959a93e: onCancelled at PHASE_CLIENT_ALREADY_HIDDEN      
 GET / 200 in 145ms (next.js: 7ms, application-code: 138ms)
11-09 20:21:44.306  5169  5281 W InteractionJankMonitor: Initializing without READ_DEVICE_CONFIG permission. enabled=false, interval=1, missedFrameThreshold=3, frameTimeThreshold=64, package=com.presiden.simulator.debug
11-09 20:21:44.388  5169  5185 I simulator.debug: Compiler allocated 5239KB to compile void android.view.ViewRootImpl.performTraversals(long)
11-09 20:21:48.728  5169  5169 I Tauri/Console: File: http://tauri.localhost/_next/static/chunks/node_modules_next_dist_115brz8._.js - Line 2432 - Msg: %cDownload the React DevTools for a better development experience: https://react.dev/link/react-devtools font-weight:bold
 GET /page/map_system/pilih-negara 200 in 55ms (next.js: 9ms, application-code: 46ms)
11-09 20:21:50.576  5169  5186 I simulator.debug: Background concurrent mark compact GC freed 4687KB AllocSpace bytes, 33(9116KB) LOS objects, 49% free, 4355KB/8710KB, paused 1.329ms,1.820ms total 136.346ms
 GET /api/game-bootstrap 200 in 21ms (next.js: 5ms, application-code: 16ms)
11-09 20:21:50.812  5169  5284 E GFXSTREAM: [GLClientState.cpp(298)] set vao to self, no-op (1)
11-09 20:21:50.904  5169  5169 W Tauri/Console: File: http://tauri.localhost/_next/static/chunks/node_modules_next_dist_115brz8._.js - Line 2432 - Msg: using deprecated parameters for the initialization function; pass a single object instead
11-09 20:21:51.095  5169  5268 I AAudio  : AAudioStreamBuilder_openStream() called ----------------------------------------
11-09 20:21:51.096  5169  5268 I AudioStreamBuilder: rate   =  44100, channels  = 2, channelMask = 0x3, format   = 0x5, sharing = SH, dir = OUTPUT
11-09 20:21:51.099  5169  5268 I AudioStreamBuilder: devices = AUDIO_PORT_HANDLE_NONE, sessionId = -1, perfMode = 11, callback: ON with frames = 4360
11-09 20:21:51.099  5169  5268 I AudioStreamBuilder: usage  =      1, contentType = 0, inputPreset = 0, allowedCapturePolicy = 0    
11-09 20:21:51.099  5169  5268 I AudioStreamBuilder: privacy sensitive = false, opPackageName = (null), attributionTag = (null)     
11-09 20:21:51.229  5169  5268 I AAudio  : AAudioStreamBuilder_openStream() got Legacy, devIds = [2], perf = NO, burst = 2006       
11-09 20:21:51.229  5169  5268 I AAudio  : AAudioStreamBuilder_openStream() returns 0 = AAUDIO_OK for s#1 ----------------
11-09 20:21:52.365  5169  5186 I simulator.debug: Background young concurrent mark compact GC freed 596KB AllocSpace bytes, 8(3524KB) LOS objects, 5% free, 8223KB/8710KB, paused 2.054ms,2.870ms total 128.551ms
11-09 20:21:52.419  5169  5186 I simulator.debug: Background concurrent mark compact GC freed 372KB AllocSpace bytes, 0(0B) LOS objects, 49% free, 7979KB/15MB, paused 1.194ms,17.152ms total 52.090ms
[PERF-TEMP:DB] 224.7ms | SELECT country, country_slug, harga_beras, harga_daging_sapi, harga_ayam, ha
 GET /api/price-data?country=Afganistan 200 in 356ms (next.js: 110ms, application-code: 246ms)
[PERF-TEMP:DB] 52.4ms | SELECT * FROM database_sistem_ekonomi     
[PERF-TEMP:DB] 58.8ms | SELECT * FROM database_kepemilikian_produksi
[PERF-TEMP:DB] 69.5ms | SELECT * FROM database_tempat_wisata
[PERF-TEMP:DB] 93.3ms | SELECT * FROM database_sektor_listrik_nasional
[PERF-TEMP:DB] 104.9ms | SELECT * FROM database_profiles_negara
[PERF-TEMP:DB] 110.2ms | SELECT * FROM database_level_kabinet     
[PERF-TEMP:DB] 114.6ms | SELECT * FROM database_pajak_negara
[PERF-TEMP:DB] 123.5ms | SELECT * FROM database_sektor_mineral_kritis
[PERF-TEMP:DB] 125.6ms | SELECT * FROM database_manufaktur        
[PERF-TEMP:DB] 129.8ms | SELECT * FROM database_sektor_peternakan
[PERF-TEMP:DB] 133.0ms | SELECT * FROM database_sektor_agrikultur 
[PERF-TEMP:DB] 138.2ms | SELECT * FROM database_level_antikorupsi 
[PERF-TEMP:DB] 232.6ms | SELECT country, country_slug, emas, uranium, batu_bara, minyak_bumi, gas_ala
 GET /api/sda-data?country=Afganistan 200 in 453ms (next.js: 200ms, application-code: 252ms)
[PERF-TEMP:DB] 143.4ms | SELECT * FROM database_hukum
[PERF-TEMP:DB] 145.7ms | SELECT * FROM database_sektor_perikanan  
[PERF-TEMP:DB] 147.8ms | SELECT * FROM database_sektor_olahan_pangan
[PERF-TEMP:DB] 151.5ms | SELECT * FROM database_infrastruktur     
[PERF-TEMP:DB] 154.1ms | SELECT * FROM database_pendidikan        
[PERF-TEMP:DB] 155.8ms | SELECT * FROM database_kesehatan
[PERF-TEMP:DB] 157.5ms | SELECT * FROM database_olahraga
[PERF-TEMP:DB] 159.1ms | SELECT * FROM database_komersial
[PERF-TEMP:DB] 161.3ms | SELECT * FROM database_hiburan
[PERF-TEMP:DB] 162.6ms | SELECT * FROM database_hunian_permukiman 
[PERF-TEMP:DB] 164.7ms | SELECT * FROM database_armada_militer    
[PERF-TEMP:DB] 166.4ms | SELECT * FROM database_manajemen_pertahanan
[PERF-TEMP:DB] 183.4ms | SELECT * FROM database_harga_barang
[PERF-TEMP:DB] 186.3ms | SELECT * FROM database_sda
[PERF-TEMP:DB] 187.4ms | SELECT * FROM database_doktrin_keterbukaan
[PERF-TEMP:DB] 189.4ms | SELECT * FROM database_alokasi_subsidi   
 GET /api/country-data?path=asia/54_afganistan.ts 200 in 546ms (next.js: 296ms, application-code: 250ms)
 GET /page/map_system?country=Afganistan 200 in 62ms (next.js: 18ms, application-code: 44ms)
11-09 20:21:58.206  5169  5186 I simulator.debug: Background young concurrent mark compact GC freed 512KB AllocSpace bytes, 21(6728KB) LOS objects, 44% free, 8811KB/15MB, paused 9.670ms,7.146ms total 57.394ms
 GET /api/country-data?summary=true 200 in 24ms (next.js: 5ms, application-code: 19ms)
 GET /api/country-data?all=true 200 in 65ms (next.js: 5ms, application-code: 60ms)
 GET /api/country-data?summary=true 200 in 17ms (next.js: 5ms, application-code: 12ms)
 GET /api/country-data?path=asia/54_afganistan.ts 200 in 22ms (next.js: 6ms, application-code: 16ms)
 GET /api/country-data?path=asia/54_afganistan.ts 200 in 22ms (next.js: 6ms, application-code: 15ms)
 GET /api/price-data?country=Afganistan 200 in 39ms (next.js: 8ms, application-code: 31ms)
 GET /api/price-data?country=Afganistan 200 in 41ms (next.js: 23ms, application-code: 19ms)
11-09 20:22:01.245  5169  5169 I Tauri/Console: File: http://tauri.localhost/_next/static/chunks/node_modules_next_dist_115brz8._.js - Line 2432 - Msg: [2026-11-09T13:22:01.080Z] [PopulationInit] Initial population metrics calculated [object Object]
 GET /api/country-data?all=true 200 in 18ms (next.js: 5ms, application-code: 13ms)
 GET /api/country-data?all=true 200 in 17ms (next.js: 5ms, application-code: 12ms)
11-09 20:22:05.087  5169  5186 I simulator.debug: Background concurrent mark compact GC freed 288KB AllocSpace bytes, 49(16MB) LOS objects, 49% free, 4923KB/9846KB, paused 1.663ms,10.585ms total 75.772ms
 GET / 200 in 97ms (next.js: 4ms, application-code: 93ms)
 GET /api/game-bootstrap 200 in 33ms (next.js: 13ms, application-code: 20ms)
11-09 20:22:32.478  5169  5169 W Tauri/Console: File: http://tauri.localhost/_next/static/chunks/node_modules_next_dist_115brz8._.js - Line 2432 - Msg: Audio playback issue: [object Event]
 GET /page/map_system?country=Afganistan 200 in 495ms (next.js: 7ms, application-code: 488ms)
11-09 20:22:34.192  5169  5186 I simulator.debug: Background young concurrent mark compact GC freed 644KB AllocSpace bytes, 2(756KB) LOS objects, 15% free, 8307KB/9846KB, paused 9.997ms,3.683ms total 37.254ms
11-09 20:22:36.924  5169  5169 I Tauri/Console: File: http://tauri.localhost/_next/static/chunks/node_modules_next_dist_115brz8._.js - Line 2432 - Msg: %cDownload the React DevTools for a better development experience: https://react.dev/link/react-devtools font-weight:bold
 GET /api/country-data?all=true 200 in 20ms (next.js: 8ms, application-code: 12ms)
 GET /api/country-data?summary=true 200 in 13ms (next.js: 4ms, application-code: 9ms)
[building-metadata] using base path: D:\project-sendiri\neosantara1\json\semua_fitur_negara
 GET /api/country-data?path=asia/54_afganistan.ts 200 in 15ms (next.js: 4ms, application-code: 11ms)
[building-metadata] loaded category metadata: 121 items
 GET /api/building-metadata 200 in 138ms (next.js: 73ms, application-code: 65ms)
11-09 20:22:37.620  5169  5268 I AAudio  : AAudioStreamBuilder_openStream() called ----------------------------------------
11-09 20:22:37.620  5169  5268 I AudioStreamBuilder: rate   =  44100, channels  = 2, channelMask = 0x3, format   = 0x5, sharing = SH, dir = OUTPUT
11-09 20:22:37.620  5169  5268 I AudioStreamBuilder: devices = AUDIO_PORT_HANDLE_NONE, sessionId = -1, perfMode = 11, callback: ON with frames = 4360
11-09 20:22:37.620  5169  5268 I AudioStreamBuilder: usage  =      1, contentType = 0, inputPreset = 0, allowedCapturePolicy = 0    
11-09 20:22:37.620  5169  5268 I AudioStreamBuilder: privacy sensitive = false, opPackageName = (null), attributionTag = (null)     
11-09 20:22:37.645  5169  5268 I AAudio  : AAudioStreamBuilder_openStream() got Legacy, devIds = [2], perf = NO, burst = 2006       
11-09 20:22:37.646  5169  5268 I AAudio  : AAudioStreamBuilder_openStream() returns 0 = AAUDIO_OK for s#2 ----------------
 GET /api/game-bootstrap 200 in 23ms (next.js: 5ms, application-code: 19ms)
11-09 20:22:39.148  5169  5169 W Tauri/Console: File: http://tauri.localhost/_next/static/chunks/node_modules_next_dist_115brz8._.js - Line 2432 - Msg: using deprecated parameters for the initialization function; pass a single object instead
 GET /api/price-data?country=Afganistan 200 in 21ms (next.js: 5ms, application-code: 16ms)
11-09 20:22:39.455  5169  5169 I Tauri/Console: File: http://tauri.localhost/_next/static/chunks/node_modules_next_dist_115brz8._.js - Line 2432 - Msg: [2026-11-09T13:22:39.450Z] [PopulationInit] Initial population metrics calculated [object Object]
 GET /api/country-data?all=true 200 in 19ms (next.js: 6ms, application-code: 13ms)
11-09 20:22:39.912  5169  5186 I simulator.debug: Background concurrent mark compact GC freed 756KB AllocSpace bytes, 58(13MB) LOS objects, 49% free, 9343KB/18MB, paused 5.824ms,8.036ms total 132.982ms
11-09 20:22:40.463  5169  5169 I Tauri/Console: File: http://tauri.localhost/_next/static/chunks/node_modules_next_dist_115brz8._.js - Line 2432 - Msg: [2026-11-09T13:22:40.455Z] [PopulationInit] Initial population metrics calculated [object Object]
