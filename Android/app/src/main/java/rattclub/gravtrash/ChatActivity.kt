package rattclub.gravtrash

import android.annotation.SuppressLint
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.ChildEventListener
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.squareup.picasso.Picasso
import kotlinx.android.synthetic.main.activity_chat.*
import rattclub.gravtrash.prevalent.Message
import rattclub.gravtrash.prevalent.MessageAdapter
import java.text.SimpleDateFormat
import java.util.*
import kotlin.collections.ArrayList
import kotlin.collections.HashMap

@Suppress("UNCHECKED_CAST")
class ChatActivity : AppCompatActivity() {
    private val mAuth = FirebaseAuth.getInstance()
    private val rootRef = FirebaseDatabase.getInstance().reference
    private var messagesList = ArrayList<Message?>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_chat)

        displayUserInfo()
        displayMessages()

        send_message_btn.setOnClickListener {
            sendMessage()
        }
    }

    private fun displayMessages() {
        val messageAdapter = MessageAdapter(messagesList as List<Message>)
        val userRecyclerMessageList = findViewById<RecyclerView>(R.id.chat_message_list)
        val linearLayoutManager = LinearLayoutManager(this)
        userRecyclerMessageList.layoutManager = linearLayoutManager
        userRecyclerMessageList.adapter = messageAdapter

        val receiverID: String? = intent.getStringExtra("receiver_uid")
        rootRef.child("Messages").child(mAuth.currentUser?.uid.toString())
            .child(receiverID.toString()).addChildEventListener(object: ChildEventListener {
                override fun onCancelled(p0: DatabaseError) {}
                override fun onChildMoved(p0: DataSnapshot, p1: String?) {}
                override fun onChildChanged(p0: DataSnapshot, p1: String?) {}
                override fun onChildRemoved(p0: DataSnapshot) {}
                override fun onChildAdded(p0: DataSnapshot, p1: String?) {
                    val message = p0.getValue(Message::class.java)
                    messagesList.add(message)
                    messageAdapter.notifyDataSetChanged()
                    userRecyclerMessageList
                        .smoothScrollToPosition((userRecyclerMessageList
                            .adapter as MessageAdapter).itemCount)


                }



            })
    }

    @SuppressLint("SimpleDateFormat")
    private fun sendMessage() {
        val messageText = input_message.text.toString()
        if (messageText.isEmpty()) {
            Toast.makeText(this, "Please write your message", Toast.LENGTH_SHORT).show()
        }else {
            val receiverID: String? = intent.getStringExtra("receiver_uid")
            val messageSenderRef = "Messages/${mAuth.currentUser?.uid}/$receiverID"
            val messageReceiverRef = "Messages/$receiverID/${mAuth.currentUser?.uid}"

            // create unique key for each message sent
            val userMessageKeyRef = rootRef.child("Messages")
                .child(mAuth.currentUser?.uid.toString())
                .child(receiverID.toString()).push()
            val messageID = userMessageKeyRef.key

            val calendar = Calendar.getInstance()
            val currentDate = SimpleDateFormat("MMM dd, yyyy")
            val currentTime = SimpleDateFormat("hh:mm a")
            var messageDetailsMap: HashMap<String, Any> = HashMap()
            messageDetailsMap["messageID"] = messageID.toString()
            messageDetailsMap["message"] = messageText
            messageDetailsMap["from"] = mAuth.currentUser?.uid.toString()
            messageDetailsMap["to"] = receiverID.toString()
            messageDetailsMap["date"] = currentDate.format(calendar.time)
            messageDetailsMap["time"] = currentTime.format(calendar.time)

            // referencing child nodes layout in database with HashMap
            var messageRefMap: HashMap<String, Any> = HashMap()
            messageRefMap["$messageSenderRef/${messageID.toString()}"] = messageDetailsMap
            messageRefMap["$messageReceiverRef/${messageID.toString()}"] = messageDetailsMap

            rootRef.updateChildren(messageRefMap).addOnCompleteListener{task ->
                if (task.isSuccessful) {
                    Log.i("sending_message", "Message sent")
                }else {
                    Toast.makeText(this@ChatActivity,
                        "Unable to send message", Toast.LENGTH_SHORT).show();
                    Log.i("sending_message", "${task.exception}")
                }
                input_message.setText("")
            }
        }
    }

    private fun displayUserInfo() {
        Picasso.get().load(intent.getStringExtra("receiver_user_profile_image"))
            .placeholder(R.drawable.profile).into(chat_profile_image)
        chat_user_name.text = intent.getStringExtra("receiver_user_name")

    }
}
