import React from "react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <>
      <div className="ars-page-head">
        <div className="ars-wrap">
          <div className="ars-crumb"><Link to="/">Home</Link> / About ARS</div>
          <h1 className="ars-serif">About Anchorpoint Registry Services</h1>
        </div>
      </div>

      <section className="ars-section">
        <div className="ars-wrap ars-prose">
          <p>
            <strong>Anchorpoint Registry Services (ARS)</strong> is a wholly owned
            subsidiary of Meridian Depository Services Ltd., one of the region's
            listed securities depositories.
          </p>

          <p>
            ARS began operations in 2008, initially handling investor profiling and
            record-keeping to support mutual fund KYC compliance. When registry-agency
            regulations were introduced in 2011, ARS was among the first entities to
            register as a KYC Registration Agency, and it now maintains fully
            digitised KYC records for tens of millions of investors across capital
            market intermediaries.
          </p>

          <p>
            ARS also became the first registry agency to open a branch under an
            international financial services centre framework, giving regulated
            entities there a fully digital, paperless KYC pathway aligned with local
            regulatory requirements.
          </p>

          <h2 className="ars-serif">Beyond KYC registration</h2>
          <p>ARS's service portfolio also includes:</p>
          <ol>
            <li>Support for uploading KYC documents to a central records registry</li>
            <li>Aadhaar-based e-KYC services</li>
            <li>Aadhaar-based eSign services</li>
            <li>Registrar and share transfer agent services</li>
            <li>Claims-repository and de-duplication support for a group life insurance scheme</li>
            <li>GST filing infrastructure as a GST Suvidha Provider, including refund processing</li>
            <li>A digital academic-records depository for institutions, students and verifiers</li>
          </ol>

          <h2 className="ars-serif">How we operate</h2>
          <p>
            ARS aims to be recognised as a dependable technology-enabled services
            company. Integrity is treated as central to the role, given the level of
            trust clients place in the registry, and the team is encouraged to take
            on demanding assignments in service of that trust.
          </p>
          <p>
            Data confidentiality is supported by layered electronic and physical
            security controls. Systems are run in-house with active monitoring of
            capacity and a defined backup and archival schedule. A primary data
            centre is paired with a disaster-recovery site in a different seismic
            zone, with data mirrored on a near real-time basis and recovery drills
            run quarterly, each with an audit trail retained. Network capacity is
            monitored continuously to support high-volume processing across
            services.
          </p>

          <div className="ars-callout">
            ARS is ISO/IEC 27001 certified for information security and operates
            under the oversight of multiple regulators across its different service
            lines.
          </div>

          <p>
            As part of a larger market-infrastructure group, ARS benchmarks its
            infrastructure, security and risk-management practices against
            industry-leading standards.
          </p>
        </div>
      </section>
    </>
  );
}
