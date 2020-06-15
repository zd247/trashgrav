package rattclub.gravtrash.customers.model;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.recyclerview.widget.RecyclerView;
import com.bumptech.glide.Glide;
import java.util.ArrayList;

import rattclub.gravtrash.R;

public class VoucherAdapter extends RecyclerView.Adapter<VoucherAdapter.MyViewHolder> {

    private Context context;
    private ArrayList<Voucher> dataModel;

    public static class MyViewHolder extends RecyclerView.ViewHolder {

        ImageView imageView;
        TextView text_title;

        public MyViewHolder(View view) {
            super(view);
            this.imageView = (ImageView) view.findViewById(R.id.voucher_image);
            this.text_title = (TextView) view.findViewById(R.id.voucher_title);
        }
    }

    public VoucherAdapter(Context _context, ArrayList<Voucher> data) {
        this.context = _context;
        this.dataModel = data;
    }

    @Override
    public MyViewHolder onCreateViewHolder(ViewGroup parent,
                                           int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.voucher_layout, parent, false);

        // view.setOnClickListener(MainActivity.myOnClickListener);

        MyViewHolder myViewHolder = new MyViewHolder(view);
        return myViewHolder;
    }

    @Override
    public void onBindViewHolder(final MyViewHolder holder, final int position) {

        TextView text_title = holder.text_title;

        Glide.with(context)
                .load(dataModel.get(position).getImage())
                .placeholder(R.drawable.splash_background)
                .into(holder.imageView);

        text_title.setText(dataModel.get(position).getTitle());
    }

    @Override
    public int getItemCount() {
        return dataModel.size();
    }
}
