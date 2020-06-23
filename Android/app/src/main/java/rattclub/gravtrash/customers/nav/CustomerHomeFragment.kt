@file:Suppress("DEPRECATION")

package rattclub.gravtrash.customers.nav

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.DefaultItemAnimator
import androidx.recyclerview.widget.RecyclerView
import com.firebase.ui.database.FirebaseRecyclerAdapter
import com.firebase.ui.database.FirebaseRecyclerOptions
import com.google.firebase.database.FirebaseDatabase
import com.squareup.picasso.Picasso
import rattclub.gravtrash.R
import rattclub.gravtrash.customers.VoucherDetailActivity
import rattclub.gravtrash.customers.model.Voucher
import rattclub.gravtrash.customers.model.VoucherViewHolder
import rattclub.gravtrash.prevalent.Prevalent
import rattclub.gravtrash.welcome.RegisterActivity

class CustomerHomeFragment: Fragment(){
    private lateinit var root: View
    private lateinit var voucherRecyclerView: RecyclerView
    private val rootRef = FirebaseDatabase.getInstance().reference

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        root = inflater.inflate(R.layout.customer_fragment_home, container, false)

        voucherRecyclerView = root.findViewById(R.id.voucher_recycler_view) as RecyclerView
        voucherRecyclerView.isNestedScrollingEnabled = false;
        voucherRecyclerView.setHasFixedSize(true)
        voucherRecyclerView.itemAnimator = DefaultItemAnimator()

        val options = FirebaseRecyclerOptions.Builder<Voucher>()
            .setQuery(rootRef.child("Vouchers"), Voucher::class.java)
            .build()

        val adapter = object: FirebaseRecyclerAdapter<Voucher, VoucherViewHolder>(options) {
            override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VoucherViewHolder {
                val view = LayoutInflater.from(parent.context)
                    .inflate(R.layout.voucher_layout, parent, false)
                return VoucherViewHolder(view)
            }

            override fun onBindViewHolder(holder: VoucherViewHolder, position: Int, model: Voucher) {
                holder.title.text = model.title
                Picasso.get().load(model.background).placeholder(R.drawable.splash_background).into(holder.image)
                holder.itemView.setOnClickListener {
                    val intent = Intent(root.context,
                        VoucherDetailActivity::class.java)
                    intent.putExtra("background", model.background)
                    intent.putExtra("description", model.description)
                    intent.putExtra("email", model.email)
                    intent.putExtra("highlight", model.highlight)
                    intent.putExtra("phone", model.phone)
                    intent.putExtra("points", model.points)
                    intent.putExtra("sponsor_icon", model.sponsor_icon)
                    intent.putExtra("sponsor_name", model.sponsor_name)
                    intent.putExtra("terms", model.terms)
                    intent.putExtra("title", model.title)
                    intent.putExtra("validity", model.validity)
                    intent.putExtra("website", model.website)
                    Prevalent.startActivity(root.context, VoucherDetailActivity::class.java, false, intent)
                }
            }
        }

        voucherRecyclerView.adapter = adapter
        adapter.startListening()

        return root


    }

}