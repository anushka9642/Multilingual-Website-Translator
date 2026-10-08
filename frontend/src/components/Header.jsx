import React, { useEffect, useRef, useState } from "react";

import { NavLink } from "react-router-dom";

import {
    Sun,
    Moon,
    Menu,
    X,
    ChevronDown
} from "lucide-react";

import { NAV } from "../data/site.js";

import { SERVICES } from "../data/services.js";

import LanguageSelector from "./LanguageSelector.jsx";


export default function Header({
    theme,
    setTheme,
    fontScale,
    setFontScale
}) {

    const [mobileOpen, setMobileOpen] = useState(false);

    const [servicesOpen, setServicesOpen] = useState(false);

    const dropdownRef = useRef(null);

    const dark = theme === "dark";


    // Close Services dropdown when clicking outside
    useEffect(() => {

        function onClick(e) {

            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {

                setServicesOpen(false);

            }

        }


        document.addEventListener(
            "mousedown",
            onClick
        );


        return () => {

            document.removeEventListener(
                "mousedown",
                onClick
            );

        };

    }, []);


    return (

        <>

            {/* Top information bar */}

            <div className="ars-notice">

                <span>
                    <span className="ars-notice-dot"></span>

                    Demo site — ISO/IEC 27001 styled
                    placeholder. Report anything
                    suspicious to the ARS helpdesk.
                </span>


                <div className="ars-header-tools">

                    {/* Font controls */}

                    <button
                        className="ars-font-btn"
                        onClick={() =>
                            setFontScale((s) =>
                                Math.min(
                                    1.15,
                                    s + 0.075
                                )
                            )
                        }
                    >
                        A+
                    </button>


                    <button
                        className="ars-font-btn"
                        onClick={() =>
                            setFontScale(1)
                        }
                    >
                        A
                    </button>


                    <button
                        className="ars-font-btn"
                        onClick={() =>
                            setFontScale((s) =>
                                Math.max(
                                    0.9,
                                    s - 0.075
                                )
                            )
                        }
                    >
                        A-
                    </button>


                    {/* Dark / Light mode */}

                    <button
                        className="ars-theme-btn"
                        onClick={() =>
                            setTheme(
                                dark
                                    ? "light"
                                    : "dark"
                            )
                        }
                        aria-label="Toggle theme"
                    >

                        {dark ? (
                            <Sun size={17} />
                        ) : (
                            <Moon size={17} />
                        )}

                    </button>

                </div>

            </div>


            {/* Main header */}

            <header className="ars-header">

                <div className="ars-wrap ars-header-inner">


                    {/* Logo */}

                    <NavLink
                        className="ars-brand"
                        to="/"
                    >

                        <span className="ars-mark">

                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                            >

                                <path
                                    d="M12 2L21 6.5V12C21 17 17.5 20.7 12 22C6.5 20.7 3 17 3 12V6.5L12 2Z"
                                    stroke="#C0913F"
                                    strokeWidth="1.4"
                                />

                                <path
                                    d="M8.5 12L11 14.5L16 9"
                                    stroke="#C0913F"
                                    strokeWidth="1.4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />

                            </svg>

                        </span>


                        <span className="ars-brand-name">

                            <strong className="ars-serif">
                                Anchorpoint Registry
                            </strong>

                            <span>
                                Services Limited
                            </span>

                        </span>

                    </NavLink>


                    {/* Navigation */}

                    <nav
                        className="ars-nav"
                        aria-label="Primary"
                    >

                        {NAV.map((item) =>

                            item.hasDropdown ? (

                                /*
                                 * Bug 8 fix: ref={dropdownRef} was assigned
                                 * inside NAV.map(), which meant React
                                 * re-assigned it on every iteration and it
                                 * ended up pointing to the last element rather
                                 * than the dropdown wrapper. It is now placed
                                 * on this single conditional branch that only
                                 * renders once for the "Services" item.
                                 */
                                <div
                                    className="ars-nav-item"
                                    ref={dropdownRef}
                                    key={item.label}
                                >

                                    <button
                                        className="ars-nav-link"
                                        onClick={() =>
                                            setServicesOpen(
                                                (s) => !s
                                            )
                                        }
                                        aria-expanded={
                                            servicesOpen
                                        }
                                    >

                                        {item.label}

                                        <ChevronDown
                                            size={14}
                                        />

                                    </button>


                                    {servicesOpen && (

                                        <div className="ars-dropdown">

                                            {SERVICES.map(
                                                (s) => (

                                                    <NavLink
                                                        to={`/services#${s.slug}`}
                                                        key={s.slug}
                                                        onClick={() =>
                                                            setServicesOpen(
                                                                false
                                                            )
                                                        }
                                                    >

                                                        <span>

                                                            {s.title}

                                                            <br />

                                                            <span
                                                                style={{
                                                                    color:
                                                                        "var(--ink-soft)",
                                                                    fontWeight:
                                                                        400
                                                                }}
                                                            >
                                                                {s.sub}
                                                            </span>

                                                        </span>


                                                        <span className="ars-mono">

                                                            {s.ref}

                                                        </span>

                                                    </NavLink>

                                                )
                                            )}

                                        </div>

                                    )}

                                </div>

                            ) : (

                                <NavLink
                                    className={({ isActive }) =>
                                        "ars-nav-link" +
                                        (isActive
                                            ? " active"
                                            : "")
                                    }
                                    to={item.to}
                                    key={item.label}
                                    end={
                                        item.to === "/"
                                    }
                                >

                                    {item.label}

                                </NavLink>

                            )

                        )}

                    </nav>



                    {/* LANGUAGE SELECTOR */}

                    <div className="ars-language-selector">

                        <LanguageSelector />

                    </div>


                    {/* Mobile menu button */}

                    <button
                        className="ars-mobile-toggle"
                        onClick={() =>
                            setMobileOpen(
                                (m) => !m
                            )
                        }
                        aria-label="Toggle menu"
                    >

                        {mobileOpen ? (
                            <X size={18} />
                        ) : (
                            <Menu size={18} />
                        )}

                    </button>

                </div>


                {/* Mobile navigation */}

                {mobileOpen && (

                    <div className="ars-wrap ars-mobile-menu">

                        {NAV.map((item) => (

                            <NavLink
                                to={
                                    item.hasDropdown
                                        ? "/services"
                                        : item.to
                                }
                                key={item.label}
                                onClick={() =>
                                    setMobileOpen(false)
                                }
                            >

                                {item.label}

                            </NavLink>

                        ))}


                        {/* Language selector on mobile */}

                        <div className="ars-mobile-language">

                            <LanguageSelector />

                        </div>

                    </div>

                )}

            </header>

        </>

    );

}