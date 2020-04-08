package rattclub.gravtrash

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.firebase.ui.database.FirebaseRecyclerAdapter
import com.firebase.ui.database.FirebaseRecyclerOptions
import com.google.firebase.database.FirebaseDatabase
import com.squareup.picasso.Picasso
import kotlinx.android.synthetic.main.activity_recycle.*
import rattclub.gravtrash.customers.model.Item
import rattclub.gravtrash.customers.model.ItemViewHolder

class RecycleActivity : AppCompatActivity() {
    private lateinit var layoutManager: RecyclerView.LayoutManager
    private val rootRef = FirebaseDatabase.getInstance().reference

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_recycle)

        recycle_recycler_menu.setHasFixedSize(true)
        layoutManager = LinearLayoutManager(this)
        recycle_recycler_menu.layoutManager = layoutManager

    }

    override fun onStart() {
        super.onStart()

        val options = FirebaseRecyclerOptions.Builder<Item>()
            .setQuery(rootRef.child("Items"), Item::class.java)
            .build()

        val adapter = object: FirebaseRecyclerAdapter<Item, ItemViewHolder> (options) {
            override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ItemViewHolder {
                val view = LayoutInflater.from(parent.context)
                    .inflate(R.layout.recycle_item_display_layout, parent, false)
                return ItemViewHolder(view)
            }

            override fun onBindViewHolder(holder: ItemViewHolder, position: Int, model: Item) {
                holder.itemCategory.text = model.category
                holder.itemPrice.text = "${model.price.toString()}$/kg"
                Picasso.get().load(model.image).into(holder.itemImage)

                holder.itemQuantity.visibility = View.GONE
                holder.itemKgText.visibility = View.GONE
            }

        }

        recycle_recycler_menu.adapter = adapter
        adapter.startListening()
    }
}
