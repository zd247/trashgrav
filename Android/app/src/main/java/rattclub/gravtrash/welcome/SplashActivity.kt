package rattclub.gravtrash.welcome

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.os.Handler
import android.view.Window
import android.view.WindowManager
import kotlinx.android.synthetic.main.activity_phone_input.*
import rattclub.gravtrash.PhoneInputActivity
import rattclub.gravtrash.R
import rattclub.gravtrash.welcome.slider.SliderActivity

class SplashActivity : AppCompatActivity() {
    private var handler = Handler()
    private lateinit var runnable: Runnable
    private lateinit var launcherManager: LauncherManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        this.window.setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,WindowManager.LayoutParams.FLAG_FULLSCREEN )
        setContentView(R.layout.activity_splash)

        launcherManager = LauncherManager(this)

        runnable = Runnable {
            if (launcherManager.isFirstTime()) {
                launcherManager.setFirstLaunch(false)
                startActivity(SliderActivity::class.java)
            }else {
                startActivity(WelcomeActivity::class.java)
            }
            handler.postDelayed(runnable, 2000)
        }
        handler.postDelayed(runnable, 2000)
    }

    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacks(runnable)
    }

    private fun startActivity(activity: Class<*> ) {
        val intent = Intent(this@SplashActivity, activity)
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK or Intent.FLAG_ACTIVITY_NEW_TASK)
        startActivity(intent)
        finish()
    }
}