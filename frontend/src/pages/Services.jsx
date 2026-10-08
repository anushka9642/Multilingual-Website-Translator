import React from "react";
import { Link } from "react-router-dom";
import { SERVICES } from "../data/services.js";
import ServiceIcon from "../components/ServiceIcon.jsx";

export default function Services() {
  return (
    <>
      <div className="ars-page-head">
        <div className="ars-wrap">
          <div className="ars-crumb"><Link to="/">Home</Link> / Services</div>
          <h1 className="ars-serif">Services</h1>
        </div>
      </div>

      <section className="ars-section">
        <div className="ars-wrap">
          <div style={{ maxWidth: "70ch", marginBottom: "10px" }}>
            <p style={{ color: "var(--ink-soft)", lineHeight: 1.7 }}>
              Eleven registry services, listed below in reference order. Each entry
              links back to the same underlying investor or entity record.
            </p>
          </div>

          <div>
            {SERVICES.map((s) => (
              <div className="ars-service-row" id={s.slug} key={s.slug}>
                <div className="ars-service-row-icon">
                  <ServiceIcon name={s.icon} size={22} />
                </div>
                <div>
                  <span className="ars-mono" style={{ color: "var(--gold-600)", fontSize: "0.72rem" }}>
                    {s.ref}
                  </span>
                  <h3 className="ars-serif">
                    {s.title}
                    <small>{s.sub}</small>
                  </h3>
                  <p>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
