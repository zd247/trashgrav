@file:Suppress("DEPRECATION")

package rattclub.gravtrash

import android.app.ProgressDialog
import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import com.facebook.*
import com.facebook.login.LoginResult
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.tasks.Task
import com.google.firebase.auth.FacebookAuthProvider
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.database.*
import kotlinx.android.synthetic.main.activity_welcome.*
import rattclub.gravtrash.customers.CustomerMainActivity


class WelcomeActivity : AppCompatActivity() {
    private val mAuth = FirebaseAuth.getInstance()
    private val rootRef = FirebaseDatabase.getInstance().reference
    private lateinit var mGoogleSignInClient: GoogleSignInClient
    private lateinit var loadingBar: ProgressDialog
    private lateinit var mFacebookCallbackManager: CallbackManager


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_welcome)

        loadingBar = ProgressDialog(this@WelcomeActivity)

        // Configure Phone Sign In
        welcome_cont_phone_btn.setOnClickListener {
            intent = Intent(this, EmailContActivity::class.java)
            startActivity(intent)
        }

        // Configure Google Sign In
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(getString(R.string.default_web_client_id))
            .requestEmail()
            .build()
        mGoogleSignInClient = GoogleSignIn.getClient(this, gso)
        welcome_cont_google_btn.setOnClickListener {
            val signInIntent = mGoogleSignInClient.signInIntent
            startActivityForResult(signInIntent, RC_SIGN_IN)
        }

        // Configure Facebook Sign In TODO: Unable to log in via facebook...
        FacebookSdk.sdkInitialize(applicationContext);
        mFacebookCallbackManager = CallbackManager.Factory.create()
        welcome_cont_fb_btn.setReadPermissions("email", "public profile")
        welcome_cont_fb_btn.registerCallback(mFacebookCallbackManager, object: FacebookCallback<LoginResult> {
            override fun onSuccess(result: LoginResult?) {
                Log.d(FB_TAG, "onSuccess $result")
                loadingBar.setTitle("Re-directing")
                loadingBar.setMessage("Please wait...")
                loadingBar.setCanceledOnTouchOutside(false)
                loadingBar.show()
                handleFacebookAccessToken(result?.accessToken)
            }
            override fun onCancel() {}
            override fun onError(error: FacebookException?) {}
        })
    }

    override fun onStart() {
        super.onStart()
        if (mAuth.currentUser != null) {
            intent = Intent(this@WelcomeActivity, CustomerMainActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
            finish()
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == RC_SIGN_IN && data != null) {
            val task: Task<GoogleSignInAccount> = GoogleSignIn.getSignedInAccountFromIntent(data)
            try {
                loadingBar.setTitle("Re-directing")
                loadingBar.setMessage("Please wait...")
                loadingBar.setCanceledOnTouchOutside(false)
                loadingBar.show()
                // Google Sign In was successful, authenticate with Firebase
                val account = task.getResult(ApiException::class.java)
                firebaseAuthWithGoogle(account!!)
            } catch (e: ApiException) {
                Log.i ("exception", e.message.toString())
                Toast.makeText(this@WelcomeActivity,
                    "Unable to sign in to Google",
                    Toast.LENGTH_LONG).show()
            }
        }
        if (data != null ) mFacebookCallbackManager.onActivityResult(requestCode, resultCode, data)
    }

    private fun handleFacebookAccessToken(accessToken: AccessToken?) {
        Log.d(FB_TAG, "handleFacebookToken $accessToken")
        val credential = FacebookAuthProvider.getCredential(accessToken!!.token)
        mAuth.signInWithCredential(credential).addOnCompleteListener {task ->
            if (task.isSuccessful){
                Log.d(FB_TAG, "Sign in with credential successful")
                if (Profile.getCurrentProfile() != null) {
                    Log.d(FB_TAG,"current profile ----")
                    Log.d(FB_TAG,Profile.getCurrentProfile().firstName)
                    Log.d(FB_TAG,Profile.getCurrentProfile().lastName)
                    Log.d(FB_TAG,Profile.getCurrentProfile().id)
                    Log.d(FB_TAG,Profile.getCurrentProfile()
                        .getProfilePictureUri(300,300).toString())
                    Log.d(FB_TAG,Profile.getCurrentProfile().linkUri.toString())
                }
            }else {
                loadingBar.dismiss()
                Toast.makeText(this@WelcomeActivity,
                    "Sign in to Facebook failed",
                    Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun firebaseAuthWithGoogle (acc: GoogleSignInAccount) {
        val authCredential = GoogleAuthProvider.getCredential(acc.idToken, null)
        mAuth.signInWithCredential(authCredential)
            .addOnCompleteListener{task->
                if (task.isSuccessful) {
                    Toast.makeText(this@WelcomeActivity,
                        "Signed into Google successfully",
                        Toast.LENGTH_SHORT).show()
                    val account = GoogleSignIn.getLastSignedInAccount(applicationContext)
                    storeGoogleUserInfo(account)
                }else {
                    loadingBar.dismiss()
                    Toast.makeText(this@WelcomeActivity,
                        "Sign in to Google failed",
                        Toast.LENGTH_SHORT).show()
                }
            }
    }

    private fun storeGoogleUserInfo(account: GoogleSignInAccount?) {
        var userInfoMap : HashMap<String, Any> = HashMap()
        userInfoMap["email"] = account?.email.toString()
        userInfoMap["image"] = account?.photoUrl.toString()
        userInfoMap["verified"] = true

        rootRef.child("Users").child(mAuth.currentUser!!.uid)
            .updateChildren(userInfoMap).addOnCompleteListener {task ->
                if (task.isSuccessful) {
                    loadingBar.dismiss()
                    val intent = Intent (this@WelcomeActivity,
                        CustomerMainActivity::class.java)
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                            Intent.FLAG_ACTIVITY_CLEAR_TASK
                    startActivity(intent)
                    finish()
                    Log.i("Store user info", "Stored user info on database")
                }else {
                    loadingBar.dismiss()
                    Log.i("Store user info", "Unable to store user info")
                }
            }
    }

    companion object {
        private const val RC_SIGN_IN: Int = 1
        private const val FB_TAG = "FacebookAuthentication"
    }
}
