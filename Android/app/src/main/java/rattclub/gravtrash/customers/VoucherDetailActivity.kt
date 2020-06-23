package rattclub.gravtrash.customers

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import com.squareup.picasso.Picasso
import kotlinx.android.synthetic.main.activity_voucher_detail.*
import rattclub.gravtrash.R

class VoucherDetailActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_voucher_detail)

        bindComponent()
    }

    private fun bindComponent() {
        Picasso.get().load(intent.getStringExtra("background"))
            .placeholder(R.drawable.splash_background).into(voucher_detail_background)
        Picasso.get().load(intent.getStringExtra("sponsor_icon"))
            .placeholder(R.drawable.splash_background).into(voucher_detail_sponsor_icon)

        voucher_details_description.text = intent.getStringExtra("description")
        voucher_detail_email.text = intent.getStringExtra("email")
        voucher_detail_highlight.text = intent.getStringExtra("highlight")
        voucher_detail_phone.text = intent.getStringExtra("phone")
        voucher_detail_points.text = intent.getStringExtra("points")
        voucher_detail_sponsor_name.text = intent.getStringExtra("sponsor_name")
        voucher_detail_terms.text = intent.getStringExtra("terms")
        voucher_detail_title.text = intent.getStringExtra("title")
        voucher_detail_validity.text = intent.getStringExtra("validity")
        voucher_detail_website.text = intent.getStringExtra("website")
    }
}