@file:Suppress("DEPRECATION")

package rattclub.gravtrash.customers.nav

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import de.hdodenhof.circleimageview.CircleImageView
import rattclub.gravtrash.*
import rattclub.gravtrash.drivers.DriverMainActivity
import rattclub.gravtrash.welcome.WelcomeActivity

class CustomerDashboardFragment : Fragment() {
    private lateinit var root: View

    // firebase
    private val mAuth = FirebaseAuth.getInstance()
    private val rootRef = FirebaseDatabase.getInstance().reference


    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        root = inflater.inflate(R.layout.customer_fragment_dashboard, container, false)
        initOnClickListeners()

        return root
    }

    private fun initOnClickListeners() {
        val becomeDriverBtn = root.findViewById<CircleImageView>(R.id.dash_board_be_driver_btn)
        becomeDriverBtn.setOnClickListener {
            rootRef.child("Users").child(mAuth.currentUser!!.uid).child("phone")
                .addListenerForSingleValueEvent(object: ValueEventListener {
                    override fun onCancelled(p0: DatabaseError) {}
                    override fun onDataChange(p0: DataSnapshot) {
                        @Suppress("SENSELESS_COMPARISON")
                        if (p0.value.toString() == "" || p0.value.toString() == null) {
                            // create a dialog
                            activity?.let {
                                val builder: AlertDialog.Builder? = activity?.let { AlertDialog.Builder(it) }
                                builder?.setMessage("You have not set your phone number!" +
                                        " Please set your phone number to continue")
                                builder?.apply {
                                    setPositiveButton("OK") { _, _ ->
                                    }
                                    setNegativeButton("Cancel") { dialog, _ ->
                                        dialog.cancel()
                                    }
                                }
                                builder?.create()
                                builder?.show()
                            }
                        }else {
                            goToNextActivity(DriverMainActivity::class.java, true)
                        }
                    }
                })
        }

        val accountSettingsBtn = root.findViewById<CircleImageView>(R.id.dash_board_acc_settings_btn)
        accountSettingsBtn.setOnClickListener {
            goToNextActivity(AccountSettingsActivity::class.java, false)
        }

        val recycleBtn = root.findViewById<CircleImageView>(R.id.dash_board_recycle_btn)
        recycleBtn.setOnClickListener {
            goToNextActivity(RecycleActivity::class.java, false)
        }

        val logoutBtn = root.findViewById<CircleImageView>(R.id.dash_board_logout_btn)
        logoutBtn.setOnClickListener {
            mAuth.signOut()
            goToNextActivity(WelcomeActivity::class.java, true)
        }
    }

    private fun goToNextActivity (nextActivity: Class<*>, isFinish: Boolean){
        val intent = Intent(root.context, nextActivity)
        if (isFinish) intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        if (isFinish) activity?.finish()
    }
}
