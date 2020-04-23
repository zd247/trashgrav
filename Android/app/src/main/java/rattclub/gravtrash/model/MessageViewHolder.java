package rattclub.gravtrash.model;

import android.view.View;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import de.hdodenhof.circleimageview.CircleImageView;
import rattclub.gravtrash.R;

public class MessageViewHolder extends RecyclerView.ViewHolder implements View.OnClickListener {
    public CircleImageView receiverProfileImage;
    public TextView receiverMessageText, receiverSentTime, senderMessageText, senderSentTime;
    public RecyclerClickListener listener;


    public MessageViewHolder(@NonNull View itemView) {
        super(itemView);
        receiverProfileImage = itemView.findViewById(R.id.msg_receiver_profile_image);
        receiverMessageText = itemView.findViewById(R.id.msg_receiver_message_text);
        receiverSentTime = itemView.findViewById(R.id.msg_receiver_last_sent);
        senderMessageText = itemView.findViewById(R.id.msg_sender_message_text);
        senderSentTime = itemView.findViewById(R.id.msg_sender_last_sent);
    }

    public void setItemClickListener(RecyclerClickListener listener) {
        this.listener = listener;
    }

    @Override
    public void onClick(View v) {
        listener.onClick(v, getAdapterPosition(), true);
    }
}
