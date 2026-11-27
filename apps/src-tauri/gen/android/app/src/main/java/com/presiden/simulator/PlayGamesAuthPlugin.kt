package com.presiden.simulator

import android.app.Activity
import app.tauri.annotation.Command
import app.tauri.annotation.InvokeArg
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.JSObject
import app.tauri.plugin.Plugin
import com.google.android.gms.games.PlayGames
import com.google.android.gms.games.PlayGamesSdk
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.auth.PlayGamesAuthProvider

@InvokeArg
internal class PlayGamesAuthArgs {
    lateinit var firebaseApiKey: String
    lateinit var firebaseAndroidAppId: String
    lateinit var firebaseProjectId: String
    lateinit var firebaseMessagingSenderId: String
    lateinit var serverClientId: String
    lateinit var playGamesProjectId: String
}

@TauriPlugin
class PlayGamesAuthPlugin(private val activity: Activity) : Plugin(activity) {
    @Command
    fun signIn(invoke: Invoke) {
        val args = parseArgs(invoke) ?: return
        val auth = firebaseAuth(args, invoke) ?: return
        val manifestProjectId = activity.getString(R.string.game_services_project_id)

        if (
            manifestProjectId == "REPLACE_WITH_PLAY_GAMES_PROJECT_ID" ||
            args.playGamesProjectId != manifestProjectId
        ) {
            invoke.reject("Play Games Project ID must match the value in Android strings.xml.")
            return
        }

        PlayGamesSdk.initialize(activity.applicationContext)
        val gamesSignInClient = PlayGames.getGamesSignInClient(activity)
        gamesSignInClient.isAuthenticated.addOnCompleteListener(activity) { authTask ->
            if (authTask.isSuccessful && authTask.result.isAuthenticated) {
                requestFirebaseAuthCode(gamesSignInClient, auth, args.serverClientId, invoke)
            } else {
                gamesSignInClient.signIn().addOnCompleteListener(activity) { signInTask ->
                    if (signInTask.isSuccessful && signInTask.result.isAuthenticated) {
                        requestFirebaseAuthCode(gamesSignInClient, auth, args.serverClientId, invoke)
                    } else {
                        invoke.reject(signInTask.exception?.message ?: "Play Games sign-in failed.")
                    }
                }
            }
        }
    }

    @Command
    fun currentUser(invoke: Invoke) {
        val args = parseArgs(invoke) ?: return
        val auth = firebaseAuth(args, invoke) ?: return
        invoke.resolve(authState(auth.currentUser))
    }

    @Command
    fun idToken(invoke: Invoke) {
        val args = parseArgs(invoke) ?: return
        val auth = firebaseAuth(args, invoke) ?: return
        val user = auth.currentUser
        if (user == null) {
            invoke.reject("Sign in with Google before accessing game saves.")
            return
        }

        user.getIdToken(false).addOnCompleteListener(activity) { task ->
            if (task.isSuccessful) {
                val token = task.result?.token
                if (token.isNullOrBlank()) {
                    invoke.reject("Firebase did not return an ID token.")
                } else {
                    invoke.resolve(JSObject().apply {
                        put("uid", user.uid)
                        put("idToken", token)
                    })
                }
            } else {
                invoke.reject(task.exception?.message ?: "Could not retrieve Firebase ID token.")
            }
        }
    }

    @Command
    fun signOut(invoke: Invoke) {
        val args = parseArgs(invoke) ?: return
        val auth = firebaseAuth(args, invoke) ?: return
        auth.signOut()
        invoke.resolve(authState(null))
    }

    private fun parseArgs(invoke: Invoke): PlayGamesAuthArgs? {
        return try {
            invoke.parseArgs(PlayGamesAuthArgs::class.java)
        } catch (error: Exception) {
            invoke.reject(error.message ?: "Invalid Play Games authentication configuration.")
            null
        }
    }

    private fun firebaseAuth(args: PlayGamesAuthArgs, invoke: Invoke): FirebaseAuth? {
        if (
            args.firebaseApiKey.isBlank() ||
            args.firebaseAndroidAppId.isBlank() ||
            args.firebaseProjectId.isBlank() ||
            args.firebaseMessagingSenderId.isBlank() ||
            args.serverClientId.isBlank() ||
            args.playGamesProjectId.isBlank()
        ) {
            invoke.reject("Firebase Android and Play Games configuration is incomplete.")
            return null
        }

        return try {
            val app = FirebaseApp.getApps(activity)
                .firstOrNull { it.name == FirebaseApp.DEFAULT_APP_NAME }
                ?: FirebaseApp.initializeApp(
                    activity,
                    FirebaseOptions.Builder()
                        .setApiKey(args.firebaseApiKey)
                        .setApplicationId(args.firebaseAndroidAppId)
                        .setProjectId(args.firebaseProjectId)
                        .setGcmSenderId(args.firebaseMessagingSenderId)
                        .build(),
                )

            if (
                app.options.projectId != args.firebaseProjectId ||
                app.options.applicationId != args.firebaseAndroidAppId
            ) {
                throw IllegalStateException("Firebase Android app configuration does not match this project.")
            }

            FirebaseAuth.getInstance(app)
        } catch (error: Exception) {
            invoke.reject(error.message ?: "Firebase Authentication could not initialize.")
            null
        }
    }

    private fun requestFirebaseAuthCode(
        gamesSignInClient: com.google.android.gms.games.GamesSignInClient,
        auth: FirebaseAuth,
        serverClientId: String,
        invoke: Invoke,
    ) {
        gamesSignInClient.requestServerSideAccess(serverClientId, false)
            .addOnCompleteListener(activity) { codeTask ->
                val serverAuthCode = if (codeTask.isSuccessful) codeTask.result else null
                if (serverAuthCode.isNullOrBlank()) {
                    invoke.reject(codeTask.exception?.message ?: "Play Games did not return an auth code.")
                    return@addOnCompleteListener
                }

                auth.signInWithCredential(PlayGamesAuthProvider.getCredential(serverAuthCode))
                    .addOnCompleteListener(activity) { authTask ->
                        if (authTask.isSuccessful) {
                            invoke.resolve(authState(auth.currentUser))
                        } else {
                            invoke.reject(authTask.exception?.message ?: "Firebase Play Games sign-in failed.")
                        }
                    }
            }
    }

    private fun authState(user: FirebaseUser?): JSObject {
        return JSObject().apply {
            put("isSignedIn", user != null)
            user?.let {
                put("uid", it.uid)
                it.displayName?.let { displayName -> put("displayName", displayName) }
                it.email?.let { email -> put("email", email) }
            }
        }
    }
}
