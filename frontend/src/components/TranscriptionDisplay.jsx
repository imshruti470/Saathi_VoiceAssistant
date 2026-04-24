import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from '../apiConfig';

const TranscriptionDisplay = () => {
    const [transcription, setTranscription] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [email, setEmail] = useState("");
    const [emailSent, setEmailSent] = useState(null);
    const [showEmailInput, setShowEmailInput] = useState(false);
    const [isGroupEmail, setIsGroupEmail] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const prevTranscriptionRef = useRef(null);
    const navigate = useNavigate();

    const fetchLatestTranscription = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/latest-transcript`, {
                headers: { "Authorization": `Bearer ${sessionStorage.getItem('token')}` }
            });

            if (response.status === 404) {
                setTranscription(null);
                return;
            }

            if (!response.ok) throw new Error("Failed to fetch transcription");

            const data = await response.json();
            if (JSON.stringify(prevTranscriptionRef.current) !== JSON.stringify(data)) {
                prevTranscriptionRef.current = data;
                setTranscription(data);
            }
        } catch (error) {
            console.error("Error fetching latest transcription:", error);
            setError("Failed to fetch latest transcript. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const sendEmail = async () => {
        if (!email) {
            setEmailSent({ success: false, message: "Please enter an email." });
            return;
        }

        setIsSendingEmail(true);
        setEmailSent(null);

        try {
            const response = await fetch(`${API_BASE_URL}/send-email`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionStorage.getItem('token')}`
                },
                body: JSON.stringify({ email, transcription }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to send email");
            }

            setEmailSent({ success: true, message: "Email sent successfully!" });
            setEmail("");
        } catch (error) {
            console.error("Error sending email:", error);
            setEmailSent({ success: false, message: error.message || "Failed to send email. Try again." });
        } finally {
            setIsSendingEmail(false);
        }
    };

    const syncCalendar = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/download-calendar`, {
                headers: { "Authorization": `Bearer ${sessionStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error("Failed to download calendar");
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "Meeting_Tasks.ics";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Error downloading calendar:", error);
            setError("Failed to download calendar.");
        }
    };

    const downloadPdf = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/download-pdf`, {
                headers: { "Authorization": `Bearer ${sessionStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error("Failed to download PDF");
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "Meeting_Summary.pdf";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Error downloading PDF:", error);
            setError("Failed to download PDF.");
        }
    };

    useEffect(() => {
        fetchLatestTranscription();
    }, []);

    const styles = {
        container: {
            maxWidth: "900px",
            margin: "80px auto",
            padding: "40px",
            display: "flex",
            flexDirection: "column",
            gap: "20px"
        },
        header: {
            fontSize: "32px",
            fontWeight: "800",
            color: "var(--text-primary)",
            marginBottom: "10px"
        },
        controls: {
            display: "flex",
            gap: "15px",
            marginBottom: "20px",
            flexWrap: "wrap"
        },
        cardSection: {
            padding: "25px",
            display: "flex",
            flexDirection: "column",
            gap: "15px"
        },
        cardTitle: {
            fontSize: "20px",
            fontWeight: "700",
            color: "var(--accent-blue)",
            borderBottom: "1px solid var(--glass-border)",
            paddingBottom: "10px",
            marginBottom: "5px"
        },
        list: {
            paddingLeft: "20px",
            lineHeight: "1.8",
            color: "var(--text-secondary)"
        },
        text: {
            color: "var(--text-secondary)",
            lineHeight: "1.8",
            fontSize: "16px"
        },
        emailInputGroup: {
            display: "flex",
            gap: "10px",
            marginTop: "10px"
        },
        input: {
            padding: "12px 15px",
            borderRadius: "8px",
            border: "1px solid var(--glass-border)",
            background: "rgba(0,0,0,0.2)",
            color: "var(--text-primary)",
            flex: 1,
            outline: "none"
        }
    };

    if (error) {
        return (
            <div style={{ ...styles.container, alignItems: "center", textAlign: "center", justifyContent: "center", minHeight: "60vh" }}>
                <div className="glass-card" style={{ padding: "50px", maxWidth: "500px", display: "flex", flexDirection: "column", gap: "20px", alignItems: "center" }}>
                    <div style={{ width: "60px", height: "60px", borderRadius: "30px", background: "rgba(79, 172, 254, 0.1)", border: "2px solid var(--accent-purple)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-purple)", fontSize: "30px", fontWeight: "bold" }}>
                        !
                    </div>
                    <h2 style={{ color: "var(--text-primary)", margin: 0, fontSize: "24px" }}>Connection Interrupted</h2>
                    <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>{error}</p>
                    <div style={{ display: "flex", gap: "15px", marginTop: "10px", flexWrap: "wrap", justifyContent: "center" }}>
                        <button onClick={fetchLatestTranscription} className="premium-btn premium-btn-primary">
                            Try Again
                        </button>
                        <button onClick={() => navigate("/recording")} className="premium-btn premium-btn-outline">
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    if (!transcription && loading) return <div style={styles.container}><p style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>Loading history...</p></div>;
    if (!transcription && !loading) {
        return (
            <div style={{ ...styles.container, alignItems: "center", textAlign: "center", justifyContent: "center", minHeight: "60vh" }}>
                <div className="glass-card" style={{ padding: "50px", maxWidth: "500px", display: "flex", flexDirection: "column", gap: "20px", alignItems: "center" }}>
                    <div style={{ width: "60px", height: "60px", borderRadius: "30px", background: "rgba(255, 255, 255, 0.05)", border: "2px solid var(--glass-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", fontSize: "24px" }}>
                        📁
                    </div>
                    <h2 style={{ color: "var(--text-primary)", margin: 0, fontSize: "24px" }}>No History Found</h2>
                    <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>It looks like you haven't recorded any meetings yet, or your past meetings have automatically expired to protect your privacy.</p>
                    <button onClick={() => navigate("/recording")} className="premium-btn premium-btn-primary" style={{ marginTop: "10px" }}>
                        Start a New Meeting
                    </button>
                </div>
            </div>
        );
    }

    const { analysis = {}, summary = "No summary available", createdAt } = transcription;
    const { keywords = [], actionItems = [] } = analysis;

    const dateObj = createdAt ? new Date(createdAt) : new Date();
    const formattedDate = dateObj.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = dateObj.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>Meeting History</h2>

            <div style={styles.controls}>


                <button
                    onClick={() => setShowEmailInput(!showEmailInput)}
                    className="premium-btn premium-btn-success"
                >
                    Share via Email
                </button>

                <button
                    onClick={downloadPdf}
                    className="premium-btn premium-btn-danger"
                >
                    Export PDF
                </button>
                <button
                    onClick={syncCalendar}
                    className="premium-btn premium-btn-outline"
                >
                    Sync Calendar
                </button>
            </div>

            {showEmailInput && (
                <div className="glass-card" style={{ padding: "20px", marginBottom: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", flexWrap: "wrap", gap: "10px" }}>
                        <p style={{ color: "var(--text-primary)", margin: 0, fontWeight: "600" }}>Share this summary</p>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ color: isGroupEmail ? "var(--text-secondary)" : "var(--accent-blue)", fontSize: "14px", fontWeight: "600" }}>Single User</span>
                            <label style={{ position: "relative", display: "inline-block", width: "44px", height: "24px" }}>
                                <input
                                    type="checkbox"
                                    checked={isGroupEmail}
                                    onChange={() => { setIsGroupEmail(!isGroupEmail); setEmail(""); }}
                                    style={{ opacity: 0, width: 0, height: 0 }}
                                />
                                <span style={{
                                    position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0,
                                    backgroundColor: isGroupEmail ? "var(--accent-purple)" : "rgba(255,255,255,0.2)",
                                    transition: ".3s", borderRadius: "24px"
                                }}>
                                    <span style={{
                                        position: "absolute", height: "18px", width: "18px", left: isGroupEmail ? "23px" : "3px", bottom: "3px",
                                        backgroundColor: "white", transition: ".3s", borderRadius: "50%"
                                    }}></span>
                                </span>
                            </label>
                            <span style={{ color: isGroupEmail ? "var(--accent-purple)" : "var(--text-secondary)", fontSize: "14px", fontWeight: "600" }}>Group</span>
                        </div>
                    </div>

                    <div style={{ ...styles.emailInputGroup, alignItems: "flex-start" }}>
                        {isGroupEmail ? (
                            <textarea
                                placeholder="Enter email addresses separated by commas..."
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ ...styles.input, minHeight: "60px", resize: "vertical", fontFamily: "inherit" }}
                            />
                        ) : (
                            <input
                                type="email"
                                placeholder="Enter colleague's email address..."
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={styles.input}
                            />
                        )}
                        <button
                            onClick={sendEmail}
                            className="premium-btn premium-btn-primary"
                            disabled={isSendingEmail}
                        >
                            {isSendingEmail ? "Sending..." : "Send"}
                        </button>
                    </div>
                    {emailSent && (
                        <p style={{ color: emailSent.success ? "var(--accent-blue)" : "var(--accent-purple)", marginTop: "10px", fontWeight: "600" }}>
                            {emailSent.message}
                        </p>
                    )}
                </div>
            )}

            <div className="glass-card" style={styles.cardSection}>
                <h3 style={styles.cardTitle}>Details</h3>
                <p style={styles.text}><strong>Date:</strong> {formattedDate}</p>
                <p style={styles.text}><strong>Time:</strong> {formattedTime}</p>
            </div>

            <div className="glass-card" style={styles.cardSection}>
                <h3 style={styles.cardTitle}>Executive Summary</h3>
                <p style={styles.text}>{summary}</p>
            </div>

            <div className="glass-card" style={styles.cardSection}>
                <h3 style={styles.cardTitle}>Action Items</h3>
                {actionItems.length ? (
                    <ul style={styles.list}>
                        {actionItems.map((action, index) => {
                            const taskStr = typeof action === 'object' ? `${action.task} ${action.deadline ? '(Due: ' + new Date(action.deadline).toLocaleDateString() + ')' : ''}` : action;
                            return <li key={index} style={{ marginBottom: "5px" }}>{taskStr}</li>;
                        })}
                    </ul>
                ) : <p style={styles.text}>No action items detected</p>}
            </div>

            <div className="glass-card" style={styles.cardSection}>
                <h3 style={styles.cardTitle}>Key Topics</h3>
                {keywords.length ? (
                    <ul style={styles.list}>
                        {keywords.map((point, index) => <li key={index}>{point}</li>)}
                    </ul>
                ) : <p style={styles.text}>No key points available</p>}
            </div>
        </div>
    );
};

export default TranscriptionDisplay;
