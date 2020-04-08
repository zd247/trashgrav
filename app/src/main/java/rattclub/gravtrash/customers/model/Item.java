package rattclub.gravtrash.customers.model;

public class Item {
    private String category, image;
    private Long price;

    public Item() { }

    public Item(String category, Long price, String image) {
        this.category = category;
        this.price = price;
        this.image = image;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Long getPrice() {
        return price;
    }

    public void setPrice(Long price) {
        this.price = price;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }
}
