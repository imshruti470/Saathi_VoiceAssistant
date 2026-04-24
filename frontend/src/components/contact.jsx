import React, { useState } from "react";
import API_BASE_URL from '../apiConfig';

const ContactPage = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [rating, setRating] = useState(0);
    const [status, setStatus] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("Sending...");

        try {
            const response = await fetch(`${API_BASE_URL}/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, message, rating })
            });

            if (!response.ok) throw new Error("Failed to send message");

            setStatus("Message sent successfully!");
            setName("");
            setEmail("");
            setMessage("");
            setRating(0);
        } catch (error) {
            console.error("Error sending message:", error);
            setStatus("Failed to send message. Please try again.");
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <h2 style={styles.header}>Contact Us</h2>
                <p style={styles.subtext}>We’d love to hear from you! Fill out the form below.</p>
                <form onSubmit={handleSubmit}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Name</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Message</label>
                        <textarea 
                            value={message} 
                            onChange={(e) => setMessage(e.target.value)}
                            style={styles.textarea}
                            required
                        ></textarea>
                    </div>

                    {/* Feedback Section */}
                    <div style={styles.feedbackSection}>
                        <label style={styles.label}>Rate Your Experience:</label>
                        <div style={styles.ratingContainer}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    onClick={() => setRating(star)}
                                    style={{
                                        ...styles.star,
                                        color: star <= rating ? "#f4b400" : "#ccc",
                                    }}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>

                    <button type="submit" style={styles.button}>
                        Send Message
                    </button>
                </form>
                {status && <p style={{ ...styles.status, color: status.includes("success") ? "green" : "red" }}>{status}</p>}
            </div>
        </div>
    );
};

const styles = {
    page: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        // background: "rgb(149, 163, 252)",
        fontFamily: "'Arial', sans-serif",
    },
    container: {
        width: "90%",
        maxWidth: "500px",
        padding: "30px",
        backgroundColor: "#fff",
        borderRadius: "10px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
        textAlign: "center",
    },
    header: {
        fontSize: "26px",
        color: "#333",
        marginBottom: "10px",
    },
    subtext: {
        fontSize: "16px",
        color: "#666",
        marginBottom: "20px",
    },
    inputGroup: {
        marginBottom: "15px",
        textAlign: "left",
    },
    label: {
        display: "block",
        marginBottom: "5px",
        fontWeight: "bold",
        color: "#333",
    },
    input: {
        width: "100%",
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        fontSize: "16px",
    },
    textarea: {
        width: "100%",
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        height: "100px",
        fontSize: "16px",
    },
    feedbackSection: {
        marginTop: "20px",
    },
    ratingContainer: {
        display: "flex",
        justifyContent: "center",
        gap: "5px",
        marginTop: "5px",
    },
    star: {
        fontSize: "24px",
        cursor: "pointer",
        transition: "color 0.3s",
    },
    button: {
        width: "100%",
        padding: "12px",
        backgroundColor: "#28a745",
        border: "none",
        borderRadius: "5px",
        color: "white",
        fontSize: "18px",
        cursor: "pointer",
        transition: "background 0.3s",
    },
    status: {
        marginTop: "10px",
        fontSize: "16px",
    },
};

export default ContactPage;
