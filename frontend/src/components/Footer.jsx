import React from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";
import { GROUP_LINKS } from "../data/site.js";

export default function Footer() {
  return (
    <>
      <div className="ars-links-strip">
        <div className="ars-wrap">
          <h4>Group &amp; Related Entities</h4>
          <div className="ars-links-row">
            {GROUP_LINKS.map((l) => (
              <a href="#" key={l}>{l}</a>
            ))}
          </div>
        </div>
      </div>

      <footer className="ars-footer">
        <div className="ars-wrap">
          <div className="ars-demo-note">
            This is a demo/dummy interface built for design and development practice.
            Anchorpoint Registry Services is a fictional company; all copy, names and
            imagery are original and are not copied from any real organisation's site.
          </div>

          <div className="ars-footer-grid">
            <div>
              <h5>Registered Office</h5>
              <div className="ars-footer-contact">
                <MapPin size={15} />
                <span>17th Floor, Ledger House, Bandra Kurla Complex, Mumbai 400051, India</span>
              </div>
              <div className="ars-footer-contact">
                <Phone size={15} />
                <span>+91 22 4900 0000</span>
              </div>
              <div className="ars-footer-contact">
                <Mail size={15} />
                <span>helpdesk@anchorpointregistry.example</span>
              </div>
            </div>
            <div>
              <h5>Company</h5>
              <ul className="ars-footer-links">
                <li><Link to="/about">About ARS</Link></li>
                <li><Link to="/management">Management</Link></li>
                <li><Link to="/services">Services</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h5>Policies</h5>
              <ul className="ars-footer-links">
                <li><a href="#">Copyright Policy</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms &amp; Conditions</a></li>
                <li><a href="#">Grievances</a></li>
                <li><a href="#">Hyper-Linking Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="ars-footer-bottom">
            <p>© 2026 Anchorpoint Registry Services Limited. All rights reserved. (Demo content.)</p>
            <p className="ars-mono">v1.0 · Design practice build</p>
          </div>
        </div>
      </footer>
    </>
  );
}
