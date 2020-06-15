package rattclub.gravtrash.prevalent

import android.annotation.SuppressLint
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.recyclerview.widget.RecyclerView
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import com.squareup.picasso.Picasso
import rattclub.gravtrash.R

class MessageAdapter: RecyclerView.Adapter<MessageViewHolder> {
    private var userMessagesList: List<Message>
    private val mAuth = FirebaseAuth.getInstance()
    private val rootRef = FirebaseDatabase.getInstance().reference

    constructor(userMessagesList: List<Message>) : super() {
        this.userMessagesList = userMessagesList

    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MessageViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.chat_message_display_layout,parent, false)
        return MessageViewHolder(view)
    }

    @SuppressLint("SetTextI18n")
    override fun onBindViewHolder(holder: MessageViewHolder, position: Int) {
        val senderUserID = mAuth.currentUser?.uid.toString()
        val message = userMessagesList[position]
        val receiverUserID = message.from

        val receiveUsersRef = rootRef.child("Users").child(receiverUserID)
        receiveUsersRef.addValueEventListener(object: ValueEventListener {
            override fun onCancelled(p0: DatabaseError) {}
            override fun onDataChange(p0: DataSnapshot) {
                if (p0.hasChild("image")) {
                    val receiverImage = p0.child("image").value.toString()
                    Picasso.get().load(receiverImage)
                        .placeholder(R.drawable.profile)
                        .into(holder.receiverProfileImage)
                }
            }
        })

        holder.receiverMessageText.visibility = View.GONE
        holder.receiverProfileImage.visibility = View.GONE
        holder.receiverSentTime.visibility = View.GONE
        holder.senderMessageText.visibility = View.GONE
        holder.senderSentTime.visibility = View.GONE
        if (receiverUserID == senderUserID) {
            holder.senderMessageText.visibility = View.VISIBLE

            holder.senderMessageText.setBackgroundResource(R.drawable.sender_messages_layout)
            holder.senderMessageText.text = message.message
            holder.senderSentTime.text = message.time + " - " + message.date
            holder.senderMessageText.setOnClickListener {
                if (holder.senderSentTime.visibility != View.VISIBLE)
                    holder.senderSentTime.visibility = View.VISIBLE
                else holder.senderSentTime.visibility = View.GONE
            }
        }else {
            holder.receiverMessageText.visibility = View.VISIBLE
            holder.receiverProfileImage.visibility = View.VISIBLE

            holder.receiverMessageText.setBackgroundResource(R.drawable.receiver_messages_layout)
            holder.receiverMessageText.text = message.message
            holder.receiverSentTime.text = message.time + " - " + message.date
            holder.receiverMessageText.setOnClickListener {
                if (holder.receiverSentTime.visibility != View.VISIBLE)
                    holder.receiverSentTime.visibility = View.VISIBLE
                else holder.receiverSentTime.visibility = View.GONE
            }

        }
        holder.itemView.setOnLongClickListener{
            holder.itemView.context.let {
                val builder: AlertDialog.Builder? =
                    holder.itemView.context.let { AlertDialog.Builder(it) }
                builder?.setMessage("Delete message ?")
                builder?.apply {
                    setPositiveButton("Yes") { _, _ ->
                        deleteMessage(position, holder)
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

    private fun deleteMessage(position: Int, holder: MessageViewHolder) {
        val messagesRef = rootRef.child("Messages")
        messagesRef.child(userMessagesList[position].from)
            .child(userMessagesList[position].to)
            .child(userMessagesList[position].messageID)
            .removeValue().addOnCompleteListener {task ->
                if (task.isSuccessful) {
                    messagesRef.child(userMessagesList[position].to)
                        .child(userMessagesList[position].from)
                        .child(userMessagesList[position].messageID)
                        .removeValue().addOnCompleteListener {task ->
                            if (task.isSuccessful) {
                                Toast.makeText(holder.itemView.context,
                                    "Message Deleted", Toast.LENGTH_SHORT).show()
                            }else {
                                Log.i ("error", "${task.exception}")
                                Toast.makeText(holder.itemView.context,
                                    "Unable to delete message", Toast.LENGTH_SHORT).show()
                            }
                        }
                }else {Toast.makeText(holder.itemView.context,
                    "Unable to delete message", Toast.LENGTH_SHORT).show()}
            }
    }

    override fun getItemCount(): Int {
        return userMessagesList.size
    }

}