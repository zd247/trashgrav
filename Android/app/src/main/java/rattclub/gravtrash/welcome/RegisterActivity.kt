package rattclub.gravtrash.welcome

import android.content.Intent
import android.net.Uri
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
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.storage.FirebaseStorage
import com.google.firebase.storage.StorageReference
import com.theartofdev.edmodo.cropper.CropImage
import kotlinx.android.synthetic.main.activity_register.*
import kotlinx.android.synthetic.main.activity_welcome.*
import rattclub.gravtrash.R
import rattclub.gravtrash.customers.CustomerMainActivity
import rattclub.gravtrash.model.Prevalent
import java.util.regex.Matcher
import java.util.regex.Pattern

class RegisterActivity : AppCompatActivity() {
    private var imageUri: Uri? = null
    private var checker = false
    private var validateInputArr = arrayOf(false,false,false)
    private var contBtnIsEnabled = false

    //input
    private lateinit var firstName: String
    private lateinit var lastName: String
    private lateinit var email: String

    private val mAuth = FirebaseAuth.getInstance()
    private val rootRef = FirebaseDatabase.getInstance().reference

    // co-routines
    private var handler = Handler()
    private lateinit var runnable: Runnable


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)
        Prevalent.loadLocale(this)

        handleOnClickListeners()
        observeInputButtonState()
    }

    override fun onStart() {
        super.onStart()

        runnable = Runnable {
            // input validator
            if (validateUserInputs()) {
                register_cont_btn.setBackgroundResource(R.drawable.continue_color_btn)
                contBtnIsEnabled = true
            }else {
                register_cont_btn.setBackgroundResource(R.drawable.continue_color_fade_btn)
                contBtnIsEnabled = false
            }

            handler.postDelayed(runnable,INPUT_CHECK_INTERVAL)
        }
        handler.postDelayed(runnable,INPUT_CHECK_INTERVAL)
    }

    override fun onStop() {
        super.onStop()
        handler.removeCallbacks(runnable)
    }

    private fun handleOnClickListeners() {
        register_profile_image.setOnClickListener {
            checker = true
            CropImage.activity(imageUri)
                .setAspectRatio(1,1)
                .start(this);
        }
        register_cont_btn.setOnTouchListener(object: View.OnTouchListener {
            override fun onTouch(v: View?, event: MotionEvent?): Boolean {
                when(event?.action){
                    MotionEvent.ACTION_DOWN-> {
                        if (contBtnIsEnabled) {
                            v?.alpha = 0.85f

                            // continue button
                            register_cont_btn_pbar.visibility = View.VISIBLE
                            register_cont_btn_text.visibility = View.INVISIBLE
                            contBtnIsEnabled = false

                            // store user info into database and redirect
                            storeUserInfo()
                        }

                    }
                    MotionEvent.ACTION_UP-> { v?.alpha = 1f }
                }

                return v?.onTouchEvent(event) ?: true
            }
        })

    }

    private fun observeInputButtonState() {
        register_first_name.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                firstName = register_first_name.text.toString()
                validateInputArr[0] = firstName.isNotEmpty()
            }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        })

        register_last_name.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                lastName = register_last_name.text.toString()
                validateInputArr[1] =  lastName.isNotEmpty()
            }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}

        })

        register_email.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                email = register_email.text.toString()
                validateInputArr[2] = isEmailValid(email)
            }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}

        })
    }

    private fun validateUserInputs():Boolean {
        var count = 0
        for (validator in validateInputArr) { if (validator) count++ }
        return count == 3
    }


    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == CropImage.CROP_IMAGE_ACTIVITY_REQUEST_CODE
            && resultCode == RESULT_OK && data != null){
            val result: CropImage.ActivityResult = CropImage.getActivityResult(data)
            imageUri = result.uri
            register_profile_image.setImageURI(imageUri)
        }
    }

    private fun storeUserInfo() {
        if (checker && imageUri != null){
            uploadImage()
        }
        var profileSettingMap = HashMap<String, Any?>()
        profileSettingMap["first_name"] = firstName
        profileSettingMap["last_name"] = lastName
        profileSettingMap["email"] = email
        profileSettingMap["phone"] = intent.getStringExtra("phoneNumber")
        rootRef.child("Users").child(mAuth.currentUser!!.uid)
            .updateChildren(profileSettingMap)
            .addOnCompleteListener{ task ->
                if (task.isSuccessful){
                    Toast.makeText(this, "Welcome $firstName", Toast.LENGTH_SHORT).show()
                    Prevalent.startActivity(this@RegisterActivity,
                        CustomerMainActivity::class.java, true)
                }else {
                    @Suppress("DEPRECATION")
                    Snackbar.make(register_layout, R.string.snackbar_error_text, SNACKBAR_ERROR_DISPLAY_TIME)
                        .setAction(R.string.snackbar_detail_text) {
                            val alert = AlertDialog.Builder(this@RegisterActivity)
                            alert.setMessage(task.exception?.message)
                            alert.setPositiveButton("OK", null)
                            alert.create().show()
                        }
                        .setActionTextColor(resources.getColor(R.color.colorAccent))
                        .show()
                }
            }

    }

    private fun uploadImage() {
        val storageProfilePictureRef : StorageReference =
            FirebaseStorage.getInstance().reference.child("Profile Pictures")
        val fileRef : StorageReference = storageProfilePictureRef
            .child(imageUri!!.lastPathSegment.toString())

        // upload image to firebase storage
        var uploadTask= fileRef.putFile(imageUri!!)
        uploadTask.addOnFailureListener {
            @Suppress("DEPRECATION")
            Snackbar.make(register_layout, R.string.snackbar_error_text, SNACKBAR_ERROR_DISPLAY_TIME)
                .setAction(R.string.snackbar_detail_text) {
                    val alert = AlertDialog.Builder(this@RegisterActivity)
                    alert.setMessage(uploadTask.exception?.message)
                    alert.setPositiveButton("OK", null)
                    alert.create().show()
                }
                .setActionTextColor(resources.getColor(R.color.colorAccent))
                .show()
        }

        // save download url of the image to firebase database
        uploadTask.continueWithTask {task->
            if (!task.isSuccessful){
                task.exception?.let { throw it }
            }
            fileRef.downloadUrl
        }.addOnCompleteListener{ task->
            if (task.isSuccessful){
                val myUrl : String = task.result.toString()
                rootRef.child("Users").child(mAuth.currentUser!!.uid)
                    .child("image")
                    .setValue(myUrl)
            }else {
                @Suppress("DEPRECATION")
                Snackbar.make(register_layout, R.string.snackbar_error_text, SNACKBAR_ERROR_DISPLAY_TIME)
                    .setAction(R.string.snackbar_detail_text) {
                        val alert = AlertDialog.Builder(this@RegisterActivity)
                        alert.setMessage(task.exception?.message)
                        alert.setPositiveButton("OK", null)
                        alert.create().show()
                    }
                    .setActionTextColor(resources.getColor(R.color.colorAccent))
                    .show()
            }
        }
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

    companion object {
        private const val INPUT_CHECK_INTERVAL: Long = 400
        private const val SNACKBAR_ERROR_DISPLAY_TIME: Int = 5500
    }
}