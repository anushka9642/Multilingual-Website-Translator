import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export default function Contact() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <>
      <div className="ars-page-head">
        <div className="ars-wrap">
          <div className="ars-crumb"><Link to="/">Home</Link> / Contact</div>
          <h1 className="ars-serif">Contact ARS</h1>
        </div>
      </div>

      <section className="ars-section">
        <div className="ars-wrap ars-contact-grid">
          <div>
            <div className="ars-contact-item">
              <MapPin size={18} />
              <div>
                <strong>Registered Office</strong>
                <span>17th Floor, Ledger House, Bandra Kurla Complex, Mumbai 400051, India</span>
              </div>
            </div>
            <div className="ars-contact-item">
              <Phone size={18} />
              <div>
                <strong>Helpdesk</strong>
                <span>+91 22 4900 0000</span>
              </div>
            </div>
            <div className="ars-contact-item">
              <Mail size={18} />
              <div>
                <strong>Email</strong>
                <span>helpdesk@anchorpointregistry.example</span>
              </div>
            </div>
            <div className="ars-contact-item">
              <Clock size={18} />
              <div>
                <strong>Hours</strong>
                <span>Monday – Friday, 9:30 AM – 6:00 PM IST</span>
              </div>
            </div>
          </div>

          <div>
            {sent ? (
              <div className="ars-callout">
                Thanks — this is a demo form, so nothing was actually sent, but in a
                live build this is where a confirmation message would appear.
              </div>
            ) : (
              <form className="ars-form" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="name">Full name</label>
                  <input id="name" type="text" required placeholder="Your name" />
                </div>
                <div>
                  <label htmlFor="email">Email</label>
                  <input id="email" type="email" required placeholder="you@example.com" />
                </div>
                <div>
                  <label htmlFor="message">Message</label>
                  <textarea id="message" rows={5} required placeholder="How can we help?" />
                </div>
                <button className="ars-btn ars-btn-primary" type="submit" style={{ alignSelf: "flex-start" }}>
                  Send message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
