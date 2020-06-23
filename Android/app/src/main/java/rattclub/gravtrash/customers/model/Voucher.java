package rattclub.gravtrash.customers.model;

public class Voucher {
    private String background;
    private String email;
    private String phone;
    private String website;
    private String description;
    private String highlight;
    private String points;
    private String sponsor_icon;
    private String sponsor_name;
    private String terms;
    private String title;
    private String validity;

    public Voucher() {}

    public Voucher(String background, String terms, String email, String phone, String website, String description, String highlight, String points, String sponsor_icon, String sponsor_name, String title, String validity) {
        this.background = background;
        this.email = email;
        this.phone = phone;
        this.website = website;
        this.description = description;
        this.highlight = highlight;
        this.points = points;
        this.sponsor_icon = sponsor_icon;
        this.sponsor_name = sponsor_name;
        this.title = title;
        this.validity = validity;
        this.terms = terms;
    }

    public String getTerms() {
        return terms;
    }

    public void setTerms(String terms) {
        this.terms = terms;
    }

    public String getBackground() {
        return background;
    }

    public void setBackground(String background) {
        this.background = background;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getHighlight() {
        return highlight;
    }

    public void setHighlight(String highlight) {
        this.highlight = highlight;
    }

    public String getPoints() {
        return points;
    }

    public void setPoints(String points) {
        this.points = points;
    }

    public String getSponsor_icon() {
        return sponsor_icon;
    }

    public void setSponsor_icon(String sponsor_icon) {
        this.sponsor_icon = sponsor_icon;
    }

    public String getSponsor_name() {
        return sponsor_name;
    }

    public void setSponsor_name(String sponsor_name) {
        this.sponsor_name = sponsor_name;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getValidity() {
        return validity;
    }

    public void setValidity(String validity) {
        this.validity = validity;
    }
}
