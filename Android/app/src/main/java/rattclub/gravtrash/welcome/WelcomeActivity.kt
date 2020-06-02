package rattclub.gravtrash.welcome

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.os.Handler
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import android.view.MotionEvent
import android.view.View
import android.widget.Toast
import com.google.firebase.FirebaseException
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.PhoneAuthCredential
import com.google.firebase.auth.PhoneAuthProvider
import com.google.firebase.database.FirebaseDatabase
import com.raycoarana.codeinputview.OnDigitInputListener
import kotlinx.android.synthetic.main.activity_welcome.*
import rattclub.gravtrash.R
import java.util.concurrent.TimeUnit


class WelcomeActivity : AppCompatActivity() {
    // firebase database
    private val mAuth = FirebaseAuth.getInstance()
    private val rootRef = FirebaseDatabase.getInstance().reference

    // co-routines
    private var handler = Handler()
    private lateinit var runnable: Runnable
    private var currentInterval: Long = RESET_TOTAL_INTERVAL


    private var veriCodeSent = false // when cont button is hit
    private var contBtnIsEnabled = false
    private var veriBtnIsEnabled = false

    // phone authentication
    private lateinit var phone: String
    private lateinit var callbacks: PhoneAuthProvider.OnVerificationStateChangedCallbacks
    private lateinit var mVerificationID: String
    private lateinit var mResendToken: PhoneAuthProvider.ForceResendingToken

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_welcome)

        initVerificationCallBack()
        observePinputButtonState()
        handleOnClicks()

    }

    private fun observePinputButtonState() {
        welcome_phone_edit_text.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(p0: Editable?) {
                phone = welcome_phone_edit_text.text.toString()
                if (phone.length == PHONE_NUMBER_LIMIT) {
                    if (phone[0] == '0') {
                        phone = phone.substring(1)
                        phone = welcome_ccp.selectedCountryCodeWithPlus + phone
                    } else {
                        phone = welcome_ccp.selectedCountryCodeWithPlus + phone
                    }
                    welcome_cont_btn.setBackgroundResource(R.drawable.continue_color_btn)
                    contBtnIsEnabled = true
                }else {
                    welcome_cont_btn.setBackgroundResource(R.drawable.continue_color_fade_btn)
                    contBtnIsEnabled = false
                }
            }
            override fun beforeTextChanged(p0: CharSequence?, p1: Int, p2: Int, p3: Int) {}
            override fun onTextChanged(p0: CharSequence?, p1: Int, p2: Int, p3: Int) {}
        })

    }

    private fun handleOnClicks() {
        welcome_cont_btn.setOnTouchListener(object: View.OnTouchListener {
            override fun onTouch(v: View?, event: MotionEvent?): Boolean {
                when(event?.action){
                    MotionEvent.ACTION_DOWN-> {
                        if (contBtnIsEnabled) {
                            v?.alpha = 0.85f

                            // continue button
                            welcome_cont_btn_pbar.visibility = View.VISIBLE
                            welcome_cont_btn_text.visibility = View.INVISIBLE
                            contBtnIsEnabled = false

                            //send SMS verification code
                            PhoneAuthProvider.getInstance()
                                .verifyPhoneNumber(phone,60, TimeUnit.SECONDS,
                                    this@WelcomeActivity, callbacks)
                        }

                    }
                    MotionEvent.ACTION_UP-> { v?.alpha = 1f }
                }

                return v?.onTouchEvent(event) ?: true
            }
        })

        welcome_verification_cancel_txt.setOnClickListener {
            displayVerifyFields(false)
            welcome_phone_edit_text.setText("")
            welcome_verification_input.code = ""
            welcome_cont_btn_text.visibility = View.VISIBLE
        }

        welcome_verification_input.setOnClickListener { welcome_verification_input.setEditable(true) }

        welcome_verification_input.addOnDigitInputListener(object: OnDigitInputListener{
            override fun onInput(inputDigit: Char) {
                veriBtnIsEnabled = welcome_verification_input.code.length == 6
                if (welcome_verification_input.code.length == 6) {
                    welcome_verification_btn.setBackgroundResource(R.drawable.continue_color_btn)
                }else {
                    welcome_verification_btn.setBackgroundResource(R.drawable.continue_color_fade_btn)
                }
            }

            override fun onDelete() {
                veriBtnIsEnabled = false
                welcome_verification_btn.setBackgroundResource(R.drawable.continue_color_fade_btn)
            }

        })

        welcome_verification_btn.setOnTouchListener(object: View.OnTouchListener {
            override fun onTouch(v: View?, event: MotionEvent?): Boolean {
                when(event?.action){
                    MotionEvent.ACTION_DOWN-> {
                        if (veriBtnIsEnabled) {
                            v?.alpha = 0.85f

                            // continue button
                            welcome_verification_btn_pbar.visibility = View.VISIBLE
                            welcome_verification_btn_text.visibility = View.INVISIBLE
                            veriBtnIsEnabled = false

                            verifyVerificationCode()
                        }
                    }

                    MotionEvent.ACTION_UP-> { v?.alpha = 1f }
                }
                return v?.onTouchEvent(event) ?: true
            }

        })
    }

    private fun initVerificationCallBack() {
        callbacks = object:  PhoneAuthProvider.OnVerificationStateChangedCallbacks() {
            override fun onVerificationCompleted(credential: PhoneAuthCredential) {
                veriCodeSent = false

                // reset cont button state
                welcome_cont_btn_pbar.visibility = View.INVISIBLE
                welcome_cont_btn_text.visibility = View.VISIBLE
                signInWithPhoneAuthCredential(credential)
            }

            override fun onVerificationFailed(p0: FirebaseException) {
                p0.printStackTrace()
                displayVerifyFields(false)
                veriCodeSent = false

                // reset cont button state
                welcome_cont_btn_pbar.visibility = View.INVISIBLE
                welcome_cont_btn_text.visibility = View.VISIBLE
                welcome_phone_edit_text.setText("")

                //snackbar fail indicator with stacktrace
            }

            override fun onCodeSent(p0: String, p1: PhoneAuthProvider.ForceResendingToken) {
                super.onCodeSent(p0, p1)
                // Save verification ID and resending token so we can use them later
                mVerificationID = p0
                mResendToken = p1
                displayVerifyFields(true)

                // reset cont button state
                welcome_cont_btn_pbar.visibility = View.INVISIBLE
                welcome_cont_btn_text.visibility = View.VISIBLE
                contBtnIsEnabled = false
            }

        }
    }

    private fun verifyVerificationCode () {
        val code : String = welcome_verification_input.code

        val credential = PhoneAuthProvider.getCredential(mVerificationID, code)
        signInWithPhoneAuthCredential(credential)

    }

    private fun signInWithPhoneAuthCredential(credential: PhoneAuthCredential) {
        mAuth.signInWithCredential(credential)
            .addOnCompleteListener {task ->
                if (task.isSuccessful) {
                    Toast.makeText(this, "OK", Toast.LENGTH_SHORT).show();
                }
                else {
                    welcome_verification_input.error = ""
                    welcome_verification_input.clearError()
                    welcome_verification_input.code = ""
                    welcome_verification_input.setEditable(true)

                    veriBtnIsEnabled = false
                    welcome_verification_btn_pbar.visibility = View.INVISIBLE
                    welcome_verification_btn_text.visibility = View.VISIBLE


                    //Snackbar here
                }
            }
    }

    private fun displayVerifyFields(flag :Boolean) {
        if (flag) {
            // Gone
            welcome_text_view.visibility = View.GONE
            welcome_ccp.visibility = View.GONE
            welcome_phone_edit_text.visibility = View.GONE
            welcome_cont_btn.visibility = View.GONE

            // Visible
            welcome_verification_input.visibility = View.VISIBLE
            welcome_verification_btn.visibility = View.VISIBLE
            welcome_verification_cancel_txt.visibility = View.VISIBLE
        }else {
            // Gone
            welcome_verification_input.visibility = View.GONE
            welcome_verification_btn.visibility = View.GONE
            welcome_verification_cancel_txt.visibility = View.GONE

            // Visible
            welcome_text_view.visibility = View.VISIBLE
            welcome_ccp.visibility = View.VISIBLE
            welcome_phone_edit_text.visibility = View.VISIBLE
            welcome_cont_btn.visibility = View.VISIBLE

            veriCodeSent = false
        }
    }


    companion object {
        private const val PHONE_NUMBER_LIMIT = 10
        private const val INPUT_CHECK_INTERVAL: Long = 400
        private const val RESET_COUNT_INTERVAL: Long = 1000
        private const val RESET_TOTAL_INTERVAL: Long = 60000
    }
}
