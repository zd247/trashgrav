package rattclub.gravtrash.model;

public class Message {
    public String messageID, message, from, to, date, time;

    public Message() { }

    public Message(String messageID, String message, String from, String to, String date, String time) {
        this.messageID = messageID;
        this.message = message;
        this.from = from;
        this.to = to;
        this.date = date;
        this.time = time;
    }

    public String getMessageID() {
        return messageID;
    }

    public void setMessageID(String messageID) {
        this.messageID = messageID;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }
}
