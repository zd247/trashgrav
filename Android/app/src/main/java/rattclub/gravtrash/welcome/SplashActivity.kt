package rattclub.gravtrash.welcome

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.os.Handler
import android.view.Window
import android.view.WindowManager
import rattclub.gravtrash.R
import rattclub.gravtrash.prevalent.Prevalent
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
        Prevalent.loadLocale(this)
        Prevalent.setLocale("vi", this)

        runnable = Runnable {
            if (launcherManager.isFirstTime()) {
                launcherManager.setFirstLaunch(false)

                Prevalent.startActivity(this@SplashActivity, SliderActivity::class.java, true)
            }else {
                Prevalent.startActivity(this@SplashActivity,WelcomeActivity::class.java, true)
            }
            handler.postDelayed(runnable, 1500)
        }
        handler.postDelayed(runnable, 1500)
    }

    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacks(runnable)
    }
}