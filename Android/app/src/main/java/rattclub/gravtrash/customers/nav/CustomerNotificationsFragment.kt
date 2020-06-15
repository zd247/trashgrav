package rattclub.gravtrash.customers.nav

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import rattclub.gravtrash.R

class CustomerNotificationsFragment : Fragment() {
    private lateinit var root: View

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        root = inflater.inflate(R.layout.customer_fragment_notifications, container, false)

        return root
    }
}