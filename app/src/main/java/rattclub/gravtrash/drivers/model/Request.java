package rattclub.gravtrash.drivers.model;

import java.util.HashMap;

public class Request {
    private String message, pickup_address, request_type;
    private HashMap<String, Double> pickup_location;
    private Double price;

    public Request() { }

    public Request(String message, String pickup_address, String request_type, HashMap<String, Double> pickup_location, Double price) {
        this.message = message;
        this.pickup_address = pickup_address;
        this.request_type = request_type;
        this.pickup_location = pickup_location;
        this.price = price;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getPickup_address() {
        return pickup_address;
    }

    public void setPickup_address(String pickup_address) {
        this.pickup_address = pickup_address;
    }

    public String getRequest_type() {
        return request_type;
    }

    public void setRequest_type(String request_type) {
        this.request_type = request_type;
    }

    public HashMap<String, Double> getPickup_location() {
        return pickup_location;
    }

    public void setPickup_location(HashMap<String, Double> pickup_location) {
        this.pickup_location = pickup_location;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }
}
