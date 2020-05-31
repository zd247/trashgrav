package rattclub.gravtrash.welcome.slider

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import kotlinx.android.synthetic.main.activity_slider.*
import rattclub.gravtrash.R
import rattclub.gravtrash.welcome.WelcomeActivity
import androidx.viewpager.widget.ViewPager


class SliderActivity : AppCompatActivity() {
    private val layouts: IntArray = intArrayOf(
        R.layout.welcome_slider1,
        R.layout.welcome_slider2,
        R.layout.welcome_slider3 )
    private var adapter: SliderAdapter? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_slider)

        adapter = SliderAdapter(this, layouts)
        pager.adapter = adapter

        pager.addOnPageChangeListener(object: ViewPager.OnPageChangeListener {
            override fun onPageScrollStateChanged(state: Int) {}
            override fun onPageScrolled(position: Int, positionOffset: Float, positionOffsetPixels: Int) {}
            override fun onPageSelected(position: Int) {
                if (position == layouts.size - 1) slider_next_btn.text = "Continue"
                else slider_next_btn.text = "Next"
            }

        })


        slider_next_btn.setOnClickListener {
            if (pager.currentItem+1 < layouts.size){
                pager.currentItem = pager.currentItem+ 1
            }else {
                startActivity(Intent(this@SliderActivity, WelcomeActivity::class.java ))
            }
        }


    }

}