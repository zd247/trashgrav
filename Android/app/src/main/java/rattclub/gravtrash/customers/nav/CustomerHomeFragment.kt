@file:Suppress("DEPRECATION")

package rattclub.gravtrash.customers.nav

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.DefaultItemAnimator
import androidx.recyclerview.widget.RecyclerView
import kotlinx.android.synthetic.main.customer_fragment_home.*
import rattclub.gravtrash.R
import rattclub.gravtrash.customers.model.Voucher
import rattclub.gravtrash.customers.model.VoucherAdapter
import rattclub.gravtrash.customers.model.VoucherDataTemp
import java.util.*

class CustomerHomeFragment: Fragment(){
    private lateinit var root: View
    private lateinit var recyclerView: RecyclerView

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        root = inflater.inflate(R.layout.customer_fragment_home, container, false)

        recyclerView = root.findViewById(R.id.voucher_recycler_view) as RecyclerView
        recyclerView.isNestedScrollingEnabled = false;
        recyclerView.setHasFixedSize(true)
        recyclerView.itemAnimator = DefaultItemAnimator()

        val data = ArrayList<Voucher>()
        for (i in VoucherDataTemp.title_Array.indices) {
            data.add(
                Voucher(
                    VoucherDataTemp.image_Array[i],
                    VoucherDataTemp.title_Array[i]
                )
            )
        }

        recyclerView.adapter = VoucherAdapter(context, data)


        return root
    }
}