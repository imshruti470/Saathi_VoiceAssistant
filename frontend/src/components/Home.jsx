import React from 'react';
import Navbar from './navbar';
import Footer from './footer';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <Navbar />
      
      {/* Hero Section */}
      <div style={styles.heroSection}>
        <div style={styles.heroContent}>
          <div style={styles.badge}>v2.0 Beta Live</div>
          <h1 style={styles.header}>
            Intelligence for your <br/>
            <span style={styles.gradientText}>Voice Conversations</span>
          </h1>
          <p style={styles.description}>
            Transform your meetings into actionable insights. Our AI-powered workspace automatically extracts tasks, generates summaries, and organizes your spoken knowledge.
          </p>

          <div style={styles.heroActions}>
            <button 
              className="premium-btn premium-btn-primary"
              style={styles.primaryCta}
              onClick={() => navigate("/recording")}
            >
              Launch Workspace
            </button>        
            <button 
              className="premium-btn premium-btn-outline"
              style={styles.secondaryCta}
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Features
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" style={styles.featuresSection}>
        <div style={styles.sectionHeaderContainer}>
          <h2 style={styles.sectionHeader}>Enterprise-grade capabilities</h2>
          <p style={styles.sectionSubheader}>Everything you need to capture, analyze, and act on your meetings.</p>
        </div>

        <div style={styles.featuresGrid}>
          {[
            {
              title: "Automated Task Extraction",
              desc: "Gemini AI automatically detects, organizes, and formats action items directly from conversational context.",
              color: "var(--accent-blue)"
            },
            {
              title: "Intelligent Summarization",
              desc: "Stop taking manual notes. Get concise, structured executive summaries seconds after the meeting ends.",
              color: "var(--accent-purple)"
            },
            {
              title: "Instant Distribution",
              desc: "Share critical insights and action items with your team via integrated email routing.",
              color: "var(--accent-blue)"
            },
            {
              title: "Real-time Processing",
              desc: "Experience high-accuracy, multi-accent transcription processing live or via bulk audio file uploads.",
              color: "var(--accent-purple)"
            }
          ].map((feature, idx) => (
            <div key={idx} className="glass-card" style={styles.featureCard}>
              <div style={{...styles.featureIndicator, backgroundColor: feature.color}}></div>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureDesc}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Workflow Section */}
      <div style={styles.workflowSection}>
        <div className="glass-card" style={styles.workflowContainer}>
          <div style={styles.workflowText}>
            <h2 style={styles.sectionHeader}>Frictionless Workflow</h2>
            <p style={styles.sectionSubheader}>Designed to stay out of your way until you need it.</p>
            
            <div style={styles.stepsContainer}>
              <div style={styles.step}>
                <div style={styles.stepNumber}>01</div>
                <div style={styles.stepContent}>
                  <h4 style={styles.stepTitle}>Capture</h4>
                  <p style={styles.stepDesc}>Record live directly in the browser or securely upload existing audio files.</p>
                </div>
              </div>
              <div style={styles.step}>
                <div style={styles.stepNumber}>02</div>
                <div style={styles.stepContent}>
                  <h4 style={styles.stepTitle}>Analyze</h4>
                  <p style={styles.stepDesc}>Our backend processes the audio through Gemini 1.5 Flash architecture instantly.</p>
                </div>
              </div>
              <div style={styles.step}>
                <div style={styles.stepNumber}>03</div>
                <div style={styles.stepContent}>
                  <h4 style={styles.stepTitle}>Execute</h4>
                  <p style={styles.stepDesc}>Export beautiful PDF reports or distribute action items directly to stakeholders.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

const styles = {
  page: {
    paddingTop: '80px',
  },
  heroSection: {
    minHeight: '70vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  heroContent: {
    maxWidth: '800px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  badge: {
    background: 'rgba(0, 242, 254, 0.1)',
    color: 'var(--accent-blue)',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    marginBottom: '24px',
    border: '1px solid rgba(0, 242, 254, 0.2)',
  },
  header: {
    fontSize: 'clamp(40px, 6vw, 64px)',
    fontWeight: '800',
    lineHeight: '1.1',
    marginBottom: '24px',
    color: 'var(--text-primary)',
    letterSpacing: '-1px',
  },
  gradientText: {
    background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  description: {
    fontSize: 'clamp(16px, 2vw, 20px)',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    maxWidth: '600px',
    marginBottom: '40px',
  },
  heroActions: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  primaryCta: {
    fontSize: '16px',
    padding: '16px 32px',
    minWidth: '200px',
  },
  secondaryCta: {
    fontSize: '16px',
    padding: '16px 32px',
    minWidth: '200px',
  },
  featuresSection: {
    padding: '80px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionHeaderContainer: {
    textAlign: 'center',
    marginBottom: '60px',
  },
  sectionHeader: {
    fontSize: '36px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '16px',
    letterSpacing: '-0.5px',
  },
  sectionSubheader: {
    fontSize: '18px',
    color: 'var(--text-secondary)',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
  },
  featureCard: {
    padding: '40px 30px',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  featureIndicator: {
    width: '40px',
    height: '4px',
    borderRadius: '2px',
    marginBottom: '24px',
  },
  featureTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '12px',
  },
  featureDesc: {
    fontSize: '15px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
  },
  workflowSection: {
    padding: '40px 20px 100px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  workflowContainer: {
    padding: '60px',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
  },
  workflowText: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  stepsContainer: {
    marginTop: '50px',
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
  },
  step: {
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
  },
  stepNumber: {
    fontFamily: 'monospace',
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--accent-blue)',
    background: 'rgba(0, 242, 254, 0.1)',
    padding: '8px 12px',
    borderRadius: '8px',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '8px',
  },
  stepDesc: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  },
};

export default Home;
