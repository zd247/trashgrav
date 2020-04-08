@file:Suppress("DEPRECATION")

package rattclub.gravtrash

import android.app.ProgressDialog
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import com.google.firebase.storage.FirebaseStorage
import com.google.firebase.storage.StorageReference
import com.squareup.picasso.Picasso
import com.theartofdev.edmodo.cropper.CropImage
import kotlinx.android.synthetic.main.activity_account_settings.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import rattclub.gravtrash.customers.CustomerMainActivity

class AccountSettingsActivity : AppCompatActivity() {
    private var imageUri: Uri? = null
    private var checker = false

    private lateinit var loadingBar: ProgressDialog

    private val mAuth = FirebaseAuth.getInstance()
    private val rootRef = FirebaseDatabase.getInstance().reference


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_account_settings)

        loadingBar = ProgressDialog(this@AccountSettingsActivity)

        initOnClickListeners()
    }

    override fun onStart() {
        super.onStart()
        displayUserInfo()
    }

    private fun initOnClickListeners() {
        settings_save_btn.setOnClickListener{ updateUserInfo() }

        settings_connect_phone_btn.setOnClickListener {
            startActivity(Intent(this, PhoneInputActivity::class.java))
        }
        settings_reset_password_btn

        profile_image_change_text.setOnClickListener {
            checker = true
            CropImage.activity(imageUri)
                .setAspectRatio(1,1)
                .start(this);

        }
    }

    private fun displayUserInfo() {
        loadingBar.setTitle("Displaying Profile")
        loadingBar.setMessage("Please wait...")
        loadingBar.setCanceledOnTouchOutside(false)
        loadingBar.show()

        rootRef.child("Users").child(mAuth.currentUser!!.uid)
            .addListenerForSingleValueEvent(object: ValueEventListener {
                override fun onCancelled(p0: DatabaseError) {}
                override fun onDataChange(p0: DataSnapshot) {
                    if (p0.exists()) {
                        val image = p0.child("image").value.toString()
                        if (image != "") Picasso.get().load(image).into(settings_profile_image)
                        settings_first_name.setText(p0.child("first_name").value.toString())
                        settings_last_name.setText(p0.child("last_name").value.toString())
                    }
                }

            })
        GlobalScope.launch(context = Dispatchers.Main) {
            delay(1500)
            loadingBar.dismiss()
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == CropImage.CROP_IMAGE_ACTIVITY_REQUEST_CODE
            && resultCode == RESULT_OK && data != null){
            val result: CropImage.ActivityResult = CropImage.getActivityResult(data)
            imageUri = result.uri
            settings_profile_image.setImageURI(imageUri)
        }else {
            startActivity(Intent(this, this.javaClass))
            finish()
        }
    }

    private fun updateUserInfo() {
        val firstName = settings_first_name.text.toString()
        val lastName = settings_last_name.text.toString()

        if (firstName.isEmpty() or lastName.isEmpty()) {
            Toast.makeText(this, "Please fill in the required fields", Toast.LENGTH_SHORT).show()
        }else {
            loadingBar.setTitle("Updating Profile")
            loadingBar.setMessage("Please wait...")
            loadingBar.setCanceledOnTouchOutside(false)
            loadingBar.show()
            if (checker && imageUri != null){
                uploadImage()
            }
            var profileSettingMap = HashMap<String, Any?>()
            profileSettingMap["first_name"] = firstName
            profileSettingMap["last_name"] = lastName
            rootRef.child("Users").child(mAuth.currentUser!!.uid)
                .updateChildren(profileSettingMap)
                .addOnCompleteListener{ task ->
                    if (task.isSuccessful){
                        loadingBar.dismiss()
                        Toast.makeText(this, "User profile updated", Toast.LENGTH_SHORT).show()
                        finish()
                    }else {
                        loadingBar.dismiss()
                        Toast.makeText(this,
                            "Error + ${task.exception.toString()}",
                            Toast.LENGTH_LONG).show()
                    }
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
            Toast.makeText(this, "Failed to upload image", Toast.LENGTH_SHORT).show()
            loadingBar?.dismiss()
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
                Toast.makeText(this,
                    "Failed to retrieve image download URL",
                    Toast.LENGTH_SHORT).show()
                loadingBar.dismiss()
            }
        }


    }
}
