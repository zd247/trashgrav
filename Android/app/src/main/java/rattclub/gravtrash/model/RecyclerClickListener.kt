package rattclub.gravtrash.model

import android.view.View

interface RecyclerClickListener {
    fun onClick(view: View, position: Int, isLongClick: Boolean)
}