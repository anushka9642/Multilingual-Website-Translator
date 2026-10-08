import React from "react";
import { Link } from "react-router-dom";
import { MANAGEMENT } from "../data/site.js";

function initials(name) {
  return name.split(" ").map((n) => n[0]).join("");
}

export default function ManagementPage() {
  return (
    <>
      <div className="ars-page-head">
        <div className="ars-wrap">
          <div className="ars-crumb"><Link to="/">Home</Link> / Management</div>
          <h1 className="ars-serif">Management</h1>
        </div>
      </div>

      <section className="ars-section">
        <div className="ars-wrap">
          <p style={{ color: "var(--ink-soft)", maxWidth: "70ch", lineHeight: 1.7, marginBottom: "34px" }}>
            The team below is a fictional leadership roster created for this demo
            site and does not represent real people.
          </p>

          <div className="ars-team-grid">
            {MANAGEMENT.map((m) => (
              <div className="ars-team-card" key={m.name}>
                <div className="ars-team-avatar">{initials(m.name)}</div>
                <h3 className="ars-serif">{m.name}</h3>
                <div className="ars-role">{m.role}</div>
                <div className="ars-since ars-mono">{m.since}</div>
                <p>{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
