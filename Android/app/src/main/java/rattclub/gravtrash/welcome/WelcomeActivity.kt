package rattclub.gravtrash.welcome

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.os.Handler
import android.text.Editable
import android.text.TextWatcher
import android.view.MotionEvent
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import com.google.android.material.snackbar.Snackbar
import com.google.firebase.FirebaseException
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.PhoneAuthCredential
import com.google.firebase.auth.PhoneAuthProvider
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import com.raycoarana.codeinputview.OnDigitInputListener
import kotlinx.android.synthetic.main.activity_welcome.*
import rattclub.gravtrash.R
import rattclub.gravtrash.customers.CustomerMainActivity
import rattclub.gravtrash.model.Prevalent
import java.util.concurrent.TimeUnit
import kotlin.properties.Delegates


@Suppress("DEPRECATION")
class WelcomeActivity : AppCompatActivity() {
    // firebase database
    private val mAuth = FirebaseAuth.getInstance()
    private val rootRef = FirebaseDatabase.getInstance().reference

    // co-routines
    private var handler = Handler()
    private lateinit var runnable: Runnable
    private var currentInterval by Delegates.notNull<Long>()


    private var veriCodeSent = false // when cont button is hit
    private var contBtnIsEnabled = false
    private var veriBtnIsEnabled = false
    private var resendIsClickable = false

    // phone authentication
    private lateinit var phone: String
    private lateinit var callbacks: PhoneAuthProvider.OnVerificationStateChangedCallbacks
    private lateinit var mVerificationID: String
    private lateinit var mResendToken: PhoneAuthProvider.ForceResendingToken

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_welcome)
        Prevalent.loadLocale(this)

        initVerificationCallBack()
        observeInputButtonState()
        handleOnClicks()

    }

    override fun onStop() {
        super.onStop()
        handler.removeCallbacks(runnable)
    }

    private fun observeInputButtonState() {
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
            handler.removeCallbacks(runnable)
            welcome_verification_resend_txt.text = "00:59"
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

        welcome_verification_resend_txt.setOnClickListener {
            if (resendIsClickable) {
                PhoneAuthProvider.getInstance()
                    .verifyPhoneNumber(
                        phone, 60, TimeUnit.SECONDS,
                        this@WelcomeActivity, callbacks, mResendToken)
                Toast.makeText(this, R.string.welcome_resend_toast_msg, Toast.LENGTH_SHORT).show()
                welcome_verification_input.code = ""
                handler.removeCallbacks(runnable)

                welcome_verification_btn.setBackgroundResource(R.drawable.continue_color_fade_btn)
                veriBtnIsEnabled = welcome_verification_input.code.length == 6

            }
        }

        welcome_language_viet.setOnClickListener {
            Prevalent.setLocale("vi", this@WelcomeActivity)
            recreate()
        }

        welcome_language_english.setOnClickListener {
            Prevalent.setLocale("", this@WelcomeActivity)
            recreate()
        }
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
                @Suppress("DEPRECATION")
                Snackbar.make(welcome_layout, R.string.snackbar_error_text, SNACKBAR_ERROR_DISPLAY_TIME)
                    .setAction(R.string.snackbar_detail_text) {
                        val alert = AlertDialog.Builder(this@WelcomeActivity)
                        alert.setMessage(p0.message)
                        alert.setPositiveButton("OK", null)
                        alert.create().show()
                    }
                    .setActionTextColor(resources.getColor(R.color.colorAccent))
                    .show()
            }

            override fun onCodeSent(p0: String, p1: PhoneAuthProvider.ForceResendingToken) {
                super.onCodeSent(p0, p1)
                // Save verification ID and resending token so we can use them later
                mVerificationID = p0
                mResendToken = p1
                displayVerifyFields(true)

                // reset cont button state for future use
                welcome_cont_btn_pbar.visibility = View.INVISIBLE
                welcome_cont_btn_text.visibility = View.VISIBLE
                contBtnIsEnabled = false


                // start re-send counter
                currentInterval = RESET_TOTAL_INTERVAL
                runnable = Runnable {
                    currentInterval -= RESET_COUNT_INTERVAL
                    welcome_verification_resend_txt.text = "00:${String.format("%02d", currentInterval/1000)}"
                    handler.postDelayed(runnable, RESET_COUNT_INTERVAL)

                    if (currentInterval == 0L) {
                        handler.removeCallbacks(runnable)
                        resendIsClickable = true
                        welcome_verification_resend_txt.setText(R.string.welcome_verify_resend_text)
                    }
                }
                handler.postDelayed(runnable, RESET_COUNT_INTERVAL)

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
                    mAuth.currentUser?.uid?.let {
                        rootRef.child("Users").child(it)
                            .addListenerForSingleValueEvent(object: ValueEventListener {
                                override fun onCancelled(p0: DatabaseError) {}
                                override fun onDataChange(p0: DataSnapshot) {
                                    if (p0.exists()) {
                                        Prevalent.startActivity(this@WelcomeActivity,
                                            CustomerMainActivity::class.java, true)
                                        Toast.makeText(this@WelcomeActivity,
                                            "Welcome ${p0.child("first_name").value}",
                                            Toast.LENGTH_LONG).show();
                                    }else {
                                        val intent = Intent(this@WelcomeActivity,
                                            RegisterActivity::class.java)
                                        intent.putExtra("phoneNumber", phone)
                                        Prevalent.startActivity(this@WelcomeActivity,
                                        RegisterActivity::class.java, false, intent)

                                        // reset this activity state
                                        welcome_verification_input.code = ""
                                        welcome_phone_edit_text.setText("")
                                        veriBtnIsEnabled = false
                                        welcome_verification_btn_pbar.visibility = View.INVISIBLE
                                        welcome_verification_btn_text.visibility = View.VISIBLE
                                        displayVerifyFields(false)
                                    }
                                }

                            })
                    }
                }
                else {
                    welcome_verification_input.code = ""

                    veriBtnIsEnabled = false
                    welcome_verification_btn_pbar.visibility = View.INVISIBLE
                    welcome_verification_btn_text.visibility = View.VISIBLE

                    welcome_verification_btn.setBackgroundResource(R.drawable.continue_color_fade_btn)

                    //Snackbar here
                    @Suppress("DEPRECATION")
                    Snackbar.make(welcome_layout, R.string.snackbar_error_text, SNACKBAR_ERROR_DISPLAY_TIME)
                        .setAction(R.string.snackbar_detail_text) {
                            val alert = AlertDialog.Builder(this@WelcomeActivity)
                            alert.setMessage(task.exception?.message)
                            alert.setPositiveButton("Ok", null)
                            alert.create().show()
                        }
                        .setActionTextColor(resources.getColor(R.color.colorAccent))
                        .show()
                }
            }
    }

    private fun displayVerifyFields(flag :Boolean) {
        if (flag) {
            // Gone
            welcome_cont_slogan.visibility = View.GONE
            welcome_phone_text.visibility = View.GONE
            welcome_ccp.visibility = View.GONE
            welcome_phone_edit_text.visibility = View.GONE
            welcome_cont_btn.visibility = View.GONE
            welcome_text_note.visibility = View.GONE
            welcome_text_or.visibility = View.GONE
            welcome_google_cont_btn.visibility = View.GONE
            welcome_facebook_cont_btn.visibility = View.GONE
            welcome_language_english.visibility = View.GONE
            welcome_language_viet.visibility = View.GONE

            // Visible
            welcome_verification_title.visibility = View.VISIBLE
            welcome_verification_linear_layout.visibility = View.VISIBLE
            welcome_verification_btn.visibility = View.VISIBLE
            welcome_verification_cancel_layout.visibility = View.VISIBLE

        }else {
            // Gone
            welcome_verification_title.visibility = View.GONE
            welcome_verification_linear_layout.visibility = View.GONE
            welcome_verification_btn.visibility = View.GONE
            welcome_verification_cancel_layout.visibility = View.GONE

            // Visible
            welcome_cont_slogan.visibility = View.VISIBLE
            welcome_phone_text.visibility = View.VISIBLE
            welcome_ccp.visibility = View.VISIBLE
            welcome_phone_edit_text.visibility = View.VISIBLE
            welcome_cont_btn.visibility = View.VISIBLE
            welcome_text_note.visibility = View.VISIBLE
            welcome_text_or.visibility = View.VISIBLE
            welcome_google_cont_btn.visibility = View.VISIBLE
            welcome_facebook_cont_btn.visibility = View.VISIBLE
            welcome_language_english.visibility = View.VISIBLE
            welcome_language_viet.visibility = View.VISIBLE


            veriCodeSent = false
        }
    }


    companion object {
        private const val PHONE_NUMBER_LIMIT = 10
        private const val RESET_COUNT_INTERVAL: Long = 1000
        private const val RESET_TOTAL_INTERVAL: Long = 59000
        private const val SNACKBAR_ERROR_DISPLAY_TIME: Int = 5500
    }
}
