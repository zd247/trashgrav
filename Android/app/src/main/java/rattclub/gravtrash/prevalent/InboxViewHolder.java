package rattclub.gravtrash.prevalent;

import android.view.View;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import de.hdodenhof.circleimageview.CircleImageView;
import rattclub.gravtrash.R;

public class InboxViewHolder extends RecyclerView.ViewHolder implements View.OnClickListener {
    public CircleImageView userProfileImage;
    public TextView userName, userLastMessage, userLastSent;
    public RecyclerClickListener listener;

    public InboxViewHolder(@NonNull View itemView) {
        super(itemView);
        userProfileImage = itemView.findViewById(R.id.user_inbox_profile_image);
        userName = itemView.findViewById(R.id.user_inbox_name);
        userLastMessage = itemView.findViewById(R.id.user_inbox_last_message);
        userLastSent = itemView.findViewById(R.id.user_inbox_last_sent);
    }

    public void setItemClickListener(RecyclerClickListener listener) {
        this.listener = listener;
    }

    @Override
    public void onClick(View v)  {
        listener.onClick(v, getAdapterPosition(), true);
    }
}
