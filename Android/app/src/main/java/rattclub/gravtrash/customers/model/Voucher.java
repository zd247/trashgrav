package rattclub.gravtrash.customers.model;

public class Voucher {
    private String image;
    private String title;

    public Voucher(String image, String title) {

        this.image = image;
        this.title = title;
    }

    public String getImage() {
        return image;
    }

    public String getTitle() {
        return title;
    }
}
