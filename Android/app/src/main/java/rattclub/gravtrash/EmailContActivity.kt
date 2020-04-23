@file:Suppress("DEPRECATION")

package rattclub.gravtrash

import android.app.ProgressDialog
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.PhoneAuthProvider
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import kotlinx.android.synthetic.main.activity_email_cont.*
import rattclub.gravtrash.customers.CustomerMainActivity
import java.util.regex.Matcher
import java.util.regex.Pattern

class EmailContActivity : AppCompatActivity() {
    // validators
    private var alreadyHaveAccount = true
    private var validateInputArr = arrayOf(false,false,false,false,false)
    private var codeSent = false

    //input fields
    private lateinit var email: String
    private lateinit var password: String
    private lateinit var firstName: String
    private lateinit var lastName: String

    // firebase
    private val mAuth: FirebaseAuth = FirebaseAuth.getInstance()
    private val rootRef = FirebaseDatabase.getInstance().reference

    // co-routines
    private var handler = Handler()
    private lateinit var runnable: Runnable

    // phone verification
    private lateinit var loadingBar: ProgressDialog

    /**<------------------------------------------------------------------------------------------------------------------>**/

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_email_cont)

        loadingBar = ProgressDialog(this@EmailContActivity)

        initInputTextChangeListener()

        // set onclick listeners
        sign_type_check_btn.setOnClickListener {alreadyHaveAccount = !alreadyHaveAccount; signTypeChecker()}
        signup_btn.setOnClickListener { registerUser()}
        login_btn.setOnClickListener { loginUser() }

        runFixedUpdate()

    }

    override fun onStop() {
        super.onStop()
        handler.removeCallbacks(runnable)
    }

    private fun runFixedUpdate() {
        runnable = Runnable {
            // input validator
            if (validateUserInput()) {
                if (alreadyHaveAccount) {
                    login_btn.isClickable = true
                    login_btn.setBackgroundResource(R.color.colorSignInSignUp)
                }else {
                    signup_btn.isClickable = true
                    signup_btn.setBackgroundResource(R.color.colorSignInSignUp)
                }
            }else {
                if (alreadyHaveAccount) {
                    login_btn.isClickable = false
                    login_btn.setBackgroundResource(R.color.colorSignInSignUpFade)
                }else {
                    signup_btn.isClickable = false
                    signup_btn.setBackgroundResource(R.color.colorSignInSignUpFade)
                }
            }

            handler.postDelayed(runnable,INPUT_CHECK_INTERVAL)
        }
        handler.postDelayed(runnable,INPUT_CHECK_INTERVAL)
    }


    private fun initInputTextChangeListener () {
        email_edit_text.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                email = email_edit_text.text.toString()
                validateInputArr[0] = isEmailValid(email)
            }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}

        })

        // password
        password_edit_text.addTextChangedListener(object: TextWatcher{
            override fun afterTextChanged(s: Editable?) {
                password = password_edit_text.text.toString()
                validateInputArr[1] = password.length >= PASSWORD_NUMBER_MIN_LIMIT
            }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}

        })


        first_name_edit_text.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                firstName = first_name_edit_text.text.toString()
                validateInputArr[2] =  firstName.isNotEmpty()
            }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}

        })

        last_name_edit_text.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                lastName = last_name_edit_text.text.toString()
                validateInputArr[3] =  lastName.isNotEmpty()
            }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}

        })
    }

    private fun loginUser() {
        loadingBar.setTitle("Signing in")
        loadingBar.setMessage("Please wait...")
        loadingBar.setCanceledOnTouchOutside(false)
        loadingBar.show()
        mAuth.signInWithEmailAndPassword(email, password)
            .addOnCompleteListener {task->
                if (task.isSuccessful) {
                    if (mAuth.currentUser!!.isEmailVerified) {
                        loadingBar.dismiss()
                        rootRef.child("Users").child(mAuth.currentUser!!.uid)
                            .child("verified").setValue(true)
                        val intent = Intent (this@EmailContActivity,
                            CustomerMainActivity::class.java)
                        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                                Intent.FLAG_ACTIVITY_CLEAR_TASK
                        startActivity(intent)
                        finish()
                    }else {
                        loadingBar.dismiss()
                        Toast.makeText(this@EmailContActivity,
                            "Please verify your email address",
                            Toast.LENGTH_LONG).show()
                    }
                }else {
                    loadingBar.dismiss()
                    Toast.makeText(this@EmailContActivity,
                        "Error: ${task.exception.toString()}",
                        Toast.LENGTH_LONG).show()
                }
            }

    }

    private fun registerUser() {
        loadingBar.setTitle("Signing up")
        loadingBar.setMessage("Please wait...")
        loadingBar.setCanceledOnTouchOutside(false)
        loadingBar.show()
        mAuth.createUserWithEmailAndPassword(email, password)
            .addOnCompleteListener{task ->
                if (task.isSuccessful) {
                    mAuth.currentUser!!.sendEmailVerification()
                        .addOnCompleteListener {task ->
                            if (task.isSuccessful) {
                                storeUserInfo()
                                Toast.makeText(this@EmailContActivity,
                                    "Registered successful, " +
                                            "a verification has been sent to your email," +
                                            " please check",
                                    Toast.LENGTH_LONG).show()
                                email = "" ; password = ""
                                email_edit_text.setText(""); password_edit_text.setText("")
                                alreadyHaveAccount = true; signTypeChecker()
                            }else {
                                loadingBar.dismiss()
                                Toast.makeText(this@EmailContActivity,
                                    "Error: ${task.exception.toString()}",
                                    Toast.LENGTH_LONG).show()
                            }
                        }
                }else {
                    loadingBar.dismiss()
                    Toast.makeText(this@EmailContActivity,
                        "Error: ${task.exception.toString()}",
                        Toast.LENGTH_LONG).show()
                }
            }
    }


    private fun storeUserInfo() {
        var userInfoMap : HashMap<String, Any> = HashMap()
        userInfoMap["first_name"] = firstName
        userInfoMap["last_name"] = lastName
        userInfoMap["email"] = email
        userInfoMap["image"] = ""
        userInfoMap["phone"] = ""
        userInfoMap["verified"] = false

        rootRef.child("Users").child(mAuth.currentUser!!.uid)
            .updateChildren(userInfoMap).addOnCompleteListener {task ->
                if (task.isSuccessful) {
                    loadingBar.dismiss()
                    Log.i("Store user info", "Stored user info on database")
                }else {
                    loadingBar.dismiss()
                    Log.i("Store user info", "Unable to store user info")
                }
        }
    }

    private fun validateUserInput(): Boolean {
        var count = 0
        for (validator in validateInputArr) { if (validator) count++ }
        if (alreadyHaveAccount) return count >= 2
        return count == 4
    }

    private fun isEmailValid(email: String): Boolean {
        val regExpn = ("^(([\\w-]+\\.)+[\\w-]+|([a-zA-Z]{1}|[\\w-]{2,}))@"
                + "((([0-1]?[0-9]{1,2}|25[0-5]|2[0-4][0-9])\\.([0-1]?"
                + "[0-9]{1,2}|25[0-5]|2[0-4][0-9])\\."
                + "([0-1]?[0-9]{1,2}|25[0-5]|2[0-4][0-9])\\.([0-1]?"
                + "[0-9]{1,2}|25[0-5]|2[0-4][0-9])){1}|"
                + "([a-zA-Z]+[\\w-]+\\.)+[a-zA-Z]{2,4})$")
        val inputStr: CharSequence = email
        val pattern: Pattern = Pattern.compile(regExpn, Pattern.CASE_INSENSITIVE)
        val matcher: Matcher = pattern.matcher(inputStr)
        return matcher.matches()
    }

    private fun signTypeChecker() {
        if (alreadyHaveAccount) {
            sign_type_check_btn.text = resources.getString(R.string.no_account)
            login_btn.visibility = View.VISIBLE
            login_btn.isClickable = true
            signup_btn.visibility = View.INVISIBLE
            signup_btn.isClickable = false
            first_name_edit_text.visibility = View.GONE
            first_name_edit_text.setText("")
            last_name_edit_text.visibility = View.GONE
            last_name_edit_text.setText("")
            validateInputArr[2] = false
            validateInputArr[3] = false
        }else {
            sign_type_check_btn.text = resources.getString(R.string.already_have_account)
            login_btn.visibility = View.INVISIBLE
            login_btn.isClickable = false
            signup_btn.visibility = View.VISIBLE
            signup_btn.isClickable = true
            first_name_edit_text.visibility = View.VISIBLE
            last_name_edit_text.visibility = View.VISIBLE
        }
    }

    companion object {
        private const val PASSWORD_NUMBER_MIN_LIMIT = 6
        private const val INPUT_CHECK_INTERVAL: Long = 400
    }

}
