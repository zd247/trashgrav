package rattclub.gravtrash.customers.model;

import android.view.View;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import rattclub.gravtrash.R;
import rattclub.gravtrash.model.RecyclerClickListener;

public class ItemViewHolder extends RecyclerView.ViewHolder implements View.OnClickListener {
    public TextView itemCategory, itemPrice;
    public ImageView itemImage;
    public EditText itemQuantity;
    public TextView itemKgText;
    public RecyclerClickListener listener;

    public ItemViewHolder(@NonNull View itemView) {
        super(itemView);

        itemCategory = itemView.findViewById(R.id.item_category);
        itemPrice = itemView.findViewById(R.id.item_price);
        itemImage = itemView.findViewById(R.id.item_image);
        itemQuantity = itemView.findViewById(R.id.item_quantity_edit_text);
        itemKgText = itemView.findViewById(R.id.item_kg_text);

    }

    public void setItemClickListener(RecyclerClickListener listener) {
        this.listener = listener;
    }

    @Override
    public void onClick(View v) {
        listener.onClick(v, getAdapterPosition(), false);
    }
}