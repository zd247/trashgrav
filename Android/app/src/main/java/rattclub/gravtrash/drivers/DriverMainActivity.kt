package rattclub.gravtrash.drivers

import android.content.Intent
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import com.google.android.material.navigation.NavigationView
import androidx.navigation.findNavController
import androidx.navigation.ui.AppBarConfiguration
import androidx.navigation.ui.navigateUp
import androidx.navigation.ui.setupActionBarWithNavController
import androidx.navigation.ui.setupWithNavController
import androidx.drawerlayout.widget.DrawerLayout
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import com.firebase.geofire.GeoFire
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.FirebaseDatabase
import rattclub.gravtrash.*
import rattclub.gravtrash.customers.CustomerMainActivity
import rattclub.gravtrash.welcome.WelcomeActivity

class DriverMainActivity : AppCompatActivity() {

    private lateinit var appBarConfiguration: AppBarConfiguration

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.driver_main_activity)
        val toolbar: Toolbar = findViewById(R.id.toolbar)
        setSupportActionBar(toolbar)

        val drawerLayout: DrawerLayout = findViewById(R.id.drawer_layout)
        val navView: NavigationView = findViewById(R.id.driver_nav_view)
        val navController = findNavController(R.id.nav_host_fragment)

        appBarConfiguration = AppBarConfiguration(
            setOf(R.id.nav_home), drawerLayout
        )
        setupActionBarWithNavController(navController, appBarConfiguration)
        navView.setupWithNavController(navController)

        navView.setNavigationItemSelectedListener (object: NavigationView.OnNavigationItemSelectedListener {
            override fun onNavigationItemSelected(item: MenuItem): Boolean {
                if (item.itemId == R.id.nav_settings) {
                    goToNextActivity(AccountSettingsActivity::class.java, false)
                }
                if (item.itemId == R.id.nav_recycle) {
                    goToNextActivity(RecycleActivity::class.java, false)
                }
                if (item.itemId == R.id.nav_be_customer) {
                    val aDriversRef = FirebaseDatabase.getInstance().reference.child("Available Drivers")
                    val geoFire = GeoFire(aDriversRef)
                    geoFire.removeLocation(FirebaseAuth.getInstance().currentUser!!.uid,
                        GeoFire.CompletionListener { _, _ ->})
                    goToNextActivity(CustomerMainActivity::class.java, true)
                }
                if (item.itemId == R.id.nav_logout) {
                    val aDriversRef = FirebaseDatabase.getInstance().reference.child("Available Drivers")
                    val geoFire = GeoFire(aDriversRef)
                    geoFire.removeLocation(FirebaseAuth.getInstance().currentUser!!.uid,
                        GeoFire.CompletionListener { _, _ ->})
                    FirebaseAuth.getInstance().signOut()
                    goToNextActivity(WelcomeActivity::class.java, true)
                }
                return true
            }
        })
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        // Inflate the menu; this adds items to the action bar if it is present.
        menuInflater.inflate(R.menu.driver_main, menu)
        return true
    }

    override fun onSupportNavigateUp(): Boolean {
        val navController = findNavController(R.id.nav_host_fragment)
        return navController.navigateUp(appBarConfiguration) || super.onSupportNavigateUp()
    }

    private fun goToNextActivity (nextActivity: Class<*>, isFinish: Boolean){
        val intent = Intent(this@DriverMainActivity, nextActivity)
        if (isFinish) intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        if (isFinish) finish()
    }
}
