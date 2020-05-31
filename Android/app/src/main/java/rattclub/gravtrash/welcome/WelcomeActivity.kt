@file:Suppress("DEPRECATION")

package rattclub.gravtrash.welcome

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import rattclub.gravtrash.R


class WelcomeActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_welcome)
    }
}
