import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { SERVICES } from "../data/services.js";
import ServiceIcon from "../components/ServiceIcon.jsx";

export default function Home() {
  return (
    <>
      <section className="ars-hero">
        <div className="ars-wrap ars-hero-inner">
          <div>
            <div className="ars-eyebrow">Registry &amp; Digital Identity Infrastructure</div>
            <h1 className="ars-serif">
              One verified record, <em>held in trust</em> across India's financial system.
            </h1>
            <p>
              Anchorpoint Registry Services maintains KYC, identity and registry
              infrastructure used by banks, depositories, distributors and issuers —
              so an investor is verified once, and recognised everywhere.
            </p>
            <div className="ars-hero-ctas">
              <Link className="ars-btn ars-btn-primary" to="/services">
                Explore services <ArrowUpRight size={15} />
              </Link>
              <Link className="ars-btn ars-btn-ghost" to="/about">
                About the registry
              </Link>
            </div>

            <div className="ars-stat-row">
              <div className="ars-stat">
                <strong className="ars-serif">11</strong>
                <span>Registry services</span>
              </div>
              <div className="ars-stat">
                <strong className="ars-serif">24×7</strong>
                <span>e-KYC availability</span>
              </div>
              <div className="ars-stat">
                <strong className="ars-serif">ISO 27001</strong>
                <span>Information security</span>
              </div>
            </div>
          </div>

          <div className="ars-seal-wrap">
            <div className="ars-seal">
              <div className="ars-seal-inner">
                <span className="ars-mono">REGISTRY&nbsp;RECORD</span>
                <strong>ARS · 001</strong>
                <small>Verified once · valid everywhere</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ars-section" id="services">
        <div className="ars-wrap">
          <div className="ars-section-head">
            <div>
              <span className="ars-section-tag">Service Register</span>
              <h2 className="ars-serif">What the registry maintains</h2>
              <p>Eleven services, each a discrete entry in the same underlying record — from first KYC to share transfer.</p>
            </div>
            <Link className="ars-btn ars-btn-ghost" to="/services">
              View all services <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="ars-services-grid">
            {SERVICES.map((s) => (
              <Link className="ars-service-card" to={`/services#${s.slug}`} key={s.slug}>
                <div className="ars-service-top">
                  <span className="ars-service-icon"><ServiceIcon name={s.icon} /></span>
                  <span className="ars-service-ref">{s.ref}</span>
                </div>
                <h3 className="ars-serif">
                  {s.title}
                  <small>{s.sub}</small>
                </h3>
                <p>{s.blurb}</p>
                <span className="ars-service-link">Read more <ArrowUpRight size={13} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
