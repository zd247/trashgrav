package rattclub.gravtrash.model

import android.app.Activity
import android.app.Dialog
import android.content.Context
import android.content.Intent
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.appcompat.app.AlertDialog
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.firebase.ui.database.FirebaseRecyclerAdapter
import com.firebase.ui.database.FirebaseRecyclerOptions
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.*
import com.squareup.picasso.Picasso
import rattclub.gravtrash.ChatActivity
import rattclub.gravtrash.R

object Prevalent {
    const val REQUEST_LOCATION_PERMISSION = 1
    const val LOCATION_REQUEST_REFRESH_INTERVAL: Long = 1000
    const val LOCATION_REQUEST_FASTEST_INTERVAL: Long = 1000
    const val PRIORITY_HIGH_ACCURACY = 100
    const val CAMERA_ZOOM_VALUE: Float = 15F

    private val mAuth = FirebaseAuth.getInstance()
    private val rootRef = FirebaseDatabase.getInstance().reference
    private lateinit var layoutManager: RecyclerView.LayoutManager

    fun handlePopUpInbox(context: Context, inboxDialog: Dialog) {
        val inboxRecycleList = inboxDialog.findViewById<RecyclerView>(R.id.inbox_recycler_view)
        inboxRecycleList.setHasFixedSize(true)
        layoutManager = LinearLayoutManager(context)
        inboxRecycleList.layoutManager =
            layoutManager

        val options = FirebaseRecyclerOptions.Builder<Message>()
            .setQuery(
                rootRef.child("Messages")
                .child(mAuth.currentUser?.uid.toString()),
                Message::class.java)
            .build()

        val adapter = object: FirebaseRecyclerAdapter<Message, InboxViewHolder>(options) {
            override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): InboxViewHolder {
                val view = LayoutInflater.from(parent.context)
                    .inflate(R.layout.inbox_user_display_layout, parent, false)
                view.setBackgroundResource(R.color.colorAccent)
                return InboxViewHolder(view)
            }

            override fun onBindViewHolder(holder: InboxViewHolder, position: Int, model: Message) {
                val listUserID = getRef(position).key.toString()
                getRef(position).addChildEventListener(object: ChildEventListener {
                    override fun onCancelled(p0: DatabaseError) {}
                    override fun onChildMoved(p0: DataSnapshot, p1: String?) {}
                    override fun onChildChanged(p0: DataSnapshot, p1: String?) {}
                    override fun onChildRemoved(p0: DataSnapshot) {}
                    override fun onChildAdded(p0: DataSnapshot, p1: String?) {
                        if (p0.exists()) {
                            var fullName = ""
                            var image = ""
                            // retrieve from Messages database
                            holder.userLastMessage.text = p0.child("message").value.toString()
                            val lastSentTime = p0.child("time").value.toString() +
                                    " " + p0.child("date").value.toString()
                            holder.userLastSent.text = lastSentTime
                            rootRef.child("Users")
                                .child(listUserID)
                                .addListenerForSingleValueEvent(object: ValueEventListener {
                                    override fun onCancelled(p0: DatabaseError) {}
                                    override fun onDataChange(p0: DataSnapshot) {
                                        if (p0.exists()) {
                                            fullName = p0.child("first_name").value.toString() +
                                                    " " + p0.child("last_name").value.toString()
                                            image = p0.child("image").value.toString()
                                            holder.userName.text = fullName
                                            Picasso.get().load(image)
                                                .placeholder(R.drawable.profile)
                                                .into(holder.userProfileImage)
                                        }
                                    }
                                })

                            holder.itemView.setOnClickListener {
                                val intent = Intent(context, ChatActivity::class.java)
                                intent.putExtra("receiver_uid", listUserID)
                                intent.putExtra("receiver_user_name", fullName)
                                intent.putExtra("receiver_user_profile_image", image)
                                context.startActivity(intent)
                            }

                            holder.itemView.setOnLongClickListener {
                                // create a alert dialog
                                (context as Activity).let {
                                    val builder: AlertDialog.Builder? =
                                        context.let { AlertDialog.Builder(it) }
                                    builder?.setMessage("Delete message ?")
                                    builder?.apply {
                                        setPositiveButton("Yes") { _, _ ->
                                            deleteMessage()
                                        }
                                        setNegativeButton("No") { dialog, _ ->
                                            dialog.cancel()
                                        }
                                    }
                                    builder?.create()
                                    builder?.show()
                                }
                                true
                            }
                        }
                    }
                })
            }

        }

        inboxRecycleList.adapter = adapter
        adapter.startListening()



        inboxDialog.show()
    }

    private fun deleteMessage() {

    }
}