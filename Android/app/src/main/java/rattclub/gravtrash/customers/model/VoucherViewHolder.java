package rattclub.gravtrash.customers.model;

import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import rattclub.gravtrash.R;

public class VoucherViewHolder extends RecyclerView.ViewHolder implements View.OnClickListener {
    public TextView title;
    public ImageView image;

    public VoucherViewHolder(@NonNull View itemView) {
        super(itemView);
        title = itemView.findViewById(R.id.voucher_title);
        image = itemView.findViewById(R.id.voucher_image);
    }

    @Override
    public void onClick(View v) {

    }
}
