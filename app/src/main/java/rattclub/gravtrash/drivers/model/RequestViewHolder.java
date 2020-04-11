package rattclub.gravtrash.drivers.model;

import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import de.hdodenhof.circleimageview.CircleImageView;
import rattclub.gravtrash.R;

public class RequestViewHolder extends RecyclerView.ViewHolder {
    public CircleImageView userProfileImage;
    public TextView userName, userAdress, userPrice;
    public Button acceptBtn, declineBtn;


    public RequestViewHolder(@NonNull View itemView) {
        super(itemView);
        userProfileImage = itemView.findViewById(R.id.user_request_profile_image);
        userName = itemView.findViewById(R.id.user_request_name);
        userAdress = itemView.findViewById(R.id.user_request_address);
        userPrice = itemView.findViewById(R.id.user_request_price);
        acceptBtn = itemView.findViewById(R.id.user_request_accept_btn);
        declineBtn = itemView.findViewById(R.id.user_request_decline_btn);
    }
}
