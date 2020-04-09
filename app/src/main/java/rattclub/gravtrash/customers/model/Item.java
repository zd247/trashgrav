package rattclub.gravtrash.customers.model;

public class Item {
    private String category, image, description;
    private Double price;

    public Item() { }

    public Item(String category, Double price, String image, String description) {
        this.category = category;
        this.price = price;
        this.image = image;
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
