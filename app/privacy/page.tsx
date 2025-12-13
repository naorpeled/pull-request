export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ marginBottom: '24px', fontSize: '2rem', fontWeight: 'bold' }}>
        Privacy Policy
      </h1>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '1.5rem', fontWeight: '600' }}>
          Data We Do Not Store
        </h2>
        <ul style={{ lineHeight: '1.8', color: '#666', paddingLeft: '24px' }}>
          <li><strong>Chat messages:</strong> Your conversations with the chatbot are not saved in our database.</li>
          <li><strong>Personal information:</strong> We do not collect names, email addresses, or usernames.</li>
          <li><strong>GitHub credentials:</strong> We never ask for or store your GitHub authentication.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '1.5rem', fontWeight: '600' }}>
          Data We Collect (With Your Consent)
        </h2>
        <p style={{ marginBottom: '12px', lineHeight: '1.8', color: '#666' }}>
          If you consent to analytics, we send anonymous usage metrics to third-party services:
        </p>
        <ul style={{ lineHeight: '1.8', color: '#666', paddingLeft: '24px', marginBottom: '16px' }}>
          <li><strong>Mixpanel:</strong> Product analytics (feature usage, language preferences)</li>
          <li><strong>Google Analytics:</strong> Page views and user interactions</li>
        </ul>
        <p style={{ lineHeight: '1.8', color: '#666' }}>
          <strong>What we track:</strong> Page views, language preference updates, issue recommendations, and link clicks.
        </p>
        <p style={{ lineHeight: '1.8', color: '#666', marginTop: '12px' }}>
          <strong>What we do not track:</strong> Your chat message content, personal identifiers, or any data that could identify you personally.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '1.5rem', fontWeight: '600' }}>
          Stored Preferences
        </h2>
        <p style={{ lineHeight: '1.8', color: '#666' }}>
          We store your preferred programming languages and analytics consent preference using an anonymous identifier (stored in a cookie).
          This data is stored in Vercel KV (Upstash Redis) and is not linked to your identity.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '1.5rem', fontWeight: '600' }}>
          Your Rights
        </h2>
        <ul style={{ lineHeight: '1.8', color: '#666', paddingLeft: '24px' }}>
          <li>You can withdraw analytics consent at any time via the settings panel.</li>
          <li>You can clear your preferences by clearing your browser cookies.</li>
          <li>Since we do not store chat data, there is no chat history to delete.</li>
        </ul>
      </section>

      <section>
        <h2 style={{ marginBottom: '16px', fontSize: '1.5rem', fontWeight: '600' }}>
          Contact
        </h2>
        <p style={{ lineHeight: '1.8', color: '#666' }}>
          If you have questions about this privacy policy, please open an issue on{' '}
          <a href="https://github.com" style={{ color: '#0070f3', textDecoration: 'underline' }}>
            GitHub
          </a>.
        </p>
      </section>

      <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
        <a href="/" style={{ color: '#0070f3', textDecoration: 'underline' }}>
          ← Back to chatbot
        </a>
      </div>
    </main>
  )
}

