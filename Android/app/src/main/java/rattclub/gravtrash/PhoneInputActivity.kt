@file:Suppress("DEPRECATION")

package rattclub.gravtrash

import android.app.ProgressDialog
import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.os.Handler
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import android.view.View
import android.widget.Toast
import com.google.firebase.FirebaseException
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.auth.PhoneAuthCredential
import com.google.firebase.auth.PhoneAuthProvider
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import kotlinx.android.synthetic.main.activity_phone_input.*
import rattclub.gravtrash.customers.CustomerMainActivity
import java.util.concurrent.TimeUnit

class PhoneInputActivity : AppCompatActivity() {
    // firebase database
    private val mAuth = FirebaseAuth.getInstance()
    private val rootRef = FirebaseDatabase.getInstance().reference
    private lateinit var currentUserID: String

    // co-routines
    private var handler = Handler()
    private lateinit var runnable: Runnable
    private var codeSent = false

    // phone authentication
    private lateinit var phone: String
    private lateinit var callbacks: PhoneAuthProvider.OnVerificationStateChangedCallbacks
    private lateinit var loadingBar: ProgressDialog
    private lateinit var mVerificationID: String
    private lateinit var mResendToken: PhoneAuthProvider.ForceResendingToken

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_phone_input)
        loadingBar = ProgressDialog(this@PhoneInputActivity)
        currentUserID = mAuth.currentUser!!.uid

        observePinputButtonState()
        initVerificationCallBack()
        initOnClickListeners()

    }

    private fun observePinputButtonState() {
        pinput_edit_text.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(p0: Editable?) {
                phone = pinput_edit_text.text.toString()
                if (phone.length == PHONE_NUMBER_LIMIT) {
                    if (phone[0] == '0') {
                        phone = phone.substring(1)
                        phone = pinput_ccp.selectedCountryCodeWithPlus + phone
                    } else {
                        phone = pinput_ccp.selectedCountryCodeWithPlus + phone
                    }
                    pinput_login_btn.setBackgroundResource(R.color.colorSignInSignUp)
                    pinput_login_btn.isClickable = true
                }else {
                    pinput_login_btn.setBackgroundResource(R.color.colorSignInSignUpFade)
                    pinput_login_btn.isClickable = false
                }
            }
            override fun beforeTextChanged(p0: CharSequence?, p1: Int, p2: Int, p3: Int) {}
            override fun onTextChanged(p0: CharSequence?, p1: Int, p2: Int, p3: Int) {}
        })
    }

    private fun initOnClickListeners() {
        pinput_login_btn.setOnClickListener {
            loadingBar.setTitle("Verifying")
            loadingBar.setMessage("Please wait...")
            loadingBar.setCanceledOnTouchOutside(false)
            loadingBar.show()
            rootRef.addListenerForSingleValueEvent(object: ValueEventListener {
                override fun onCancelled(p0: DatabaseError) {}
                override fun onDataChange(p0: DataSnapshot) {
                    if (p0.child("Users")
                            .child("Customers")
                            .child(phone).value == null){
                        //send SMS verification code
                        PhoneAuthProvider.getInstance()
                            .verifyPhoneNumber(phone,60,TimeUnit.SECONDS,
                                this@PhoneInputActivity, callbacks)
                    }else {
                        loadingBar.dismiss()
                        Toast.makeText(this@PhoneInputActivity,
                            "Phone number already existed", Toast.LENGTH_SHORT).show()
                    }
                }

            })
        }

        pinput_verification_code_btn.setOnClickListener {
            verifyVerificationCode()
        }
    }

    override fun onStart() {
        super.onStart()

        runnable = Runnable {
            if (codeSent) {
                if (pinput_verification_code_input.code.length == 6) {
                    pinput_verification_code_btn.isClickable = true
                    pinput_verification_code_btn.setBackgroundResource(R.color.colorSignInSignUp)
                }else {
                    pinput_verification_code_btn.isClickable = false
                    pinput_verification_code_btn.setBackgroundResource(R.color.colorSignInSignUpFade)
                }
            }

            handler.postDelayed(runnable, INPUT_CHECK_INTERVAL)
        }
        handler.postDelayed(runnable, INPUT_CHECK_INTERVAL)

    }

    override fun onStop() {
        super.onStop()
        handler.removeCallbacks(runnable)
    }

    private fun initVerificationCallBack() {
        callbacks = object:  PhoneAuthProvider.OnVerificationStateChangedCallbacks() {
            // not likely to happen
            override fun onVerificationCompleted(credential: PhoneAuthCredential) {
                //verified successful, no need to verify device, signing in
                loadingBar.dismiss()
                codeSent = false
                signInWithPhoneAuthCredential(credential)
            }
            override fun onVerificationFailed(p0: FirebaseException) {
                loadingBar.dismiss()
                p0.printStackTrace()
                Toast.makeText(this@PhoneInputActivity,
                    "Verification failed", Toast.LENGTH_SHORT).show()
                displayVerifyFields(false)
            }
            override fun onCodeSent(p0: String, p1: PhoneAuthProvider.ForceResendingToken) {
                super.onCodeSent(p0, p1)
                loadingBar.dismiss()
                // Save verification ID and resending token so we can use them later
                mVerificationID = p0
                mResendToken = p1
                codeSent = true
                displayVerifyFields(true)
            }
        }
    }

    private fun verifyVerificationCode () {
        val code : String = pinput_verification_code_input.code

        loadingBar.setTitle("Verifying")
        loadingBar.setMessage("Please wait...")
        loadingBar.setCanceledOnTouchOutside(false)
        loadingBar.show()

        val credential = PhoneAuthProvider.getCredential(mVerificationID, code)
        signInWithPhoneAuthCredential(credential)

    }

    private fun signInWithPhoneAuthCredential(credential: PhoneAuthCredential) {
        mAuth.signInWithCredential(credential)
            .addOnCompleteListener {task ->
                if (task.isSuccessful) {
                    storeUserInfo()
                }
                else {
                    pinput_verification_code_input.error = ""
                    pinput_verification_code_input.clearError()
                    pinput_verification_code_input.code = ""
                    pinput_verification_code_input.setEditable(true)
                    Toast.makeText(this, "Invalid code entered", Toast.LENGTH_SHORT).show()
                    loadingBar.dismiss()
                }
            }
    }

    private fun storeUserInfo() {
        rootRef.child("Users").child(currentUserID)
            .child("phone").setValue(phone)
            .addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    loadingBar.dismiss()
                    // take back to the previously stacked activity
                    finish()
                }else {
                    loadingBar.dismiss()
                    Log.i ("database", "Unable to store phone number in DB")
                }
            }
    }

    private fun displayVerifyFields(flag :Boolean) {
        if (flag) {
            // Gone
            pinput_edit_text.visibility = View.GONE
            pinput_ccp.visibility = View.GONE
            login_pinput_text_view.visibility = View.GONE
            pinput_login_btn.visibility = View.GONE

            // Visible
            pinput_verification_code_input.visibility = View.VISIBLE
            pinput_verification_code_btn.visibility = View.VISIBLE
        }else {
            // Gone
            pinput_verification_code_input.visibility = View.GONE
            pinput_verification_code_btn.visibility = View.GONE

            // Visible
            pinput_edit_text.visibility = View.VISIBLE
            pinput_ccp.visibility = View.VISIBLE
            login_pinput_text_view.visibility = View.VISIBLE
            pinput_login_btn.visibility = View.VISIBLE

            codeSent = false
        }
    }


    companion object {
        private const val PHONE_NUMBER_LIMIT = 10
        private const val INPUT_CHECK_INTERVAL: Long = 400
    }
}
