"use client";

import React, { useState, useEffect, useRef } from "react";
import { getListings } from "../lib/wordpress";
import {
  Feather, Heart, Compass, BookOpen, Users, Sparkles, Check, X,
  ChevronRight, ChevronDown, ChevronLeft, Mail, Lock, Unlock, Mic,
  Phone, Video, MapPin, Share2, Menu, ArrowRight, Star, ShieldCheck,
  Music, Image as ImageIcon, ListChecks, PenLine, NotebookPen, Coffee,
  Clock, Quote, Plus, Search, SlidersHorizontal, Play
} from "lucide-react";

/* ----------------------------------------------------------------------
   DESIGN TOKENS
   Warm white canvas, forest green + warm brown as dual primaries,
   muted gold for moments that matter, soft gray for restraint.
   Display face: Fraunces (editorial, warm, a little literary).
   Body face: Inter. Utility/meta face: JetBrains Mono (postal, ledger-like).
   Signature motif: correspondence (postmarks, deckled cards, sealed
   progress) carried from Browse through Pen Pal Room to Mutual Unlock.
------------------------------------------------------------------------- */

const COLORS = {
  warmWhite: "#FAF8F4",
  cream: "#F1E9DA",
  forest: "#2F4A3C",
  forestDeep: "#22362B",
  brown: "#6B4A34",
  gold: "#B4884F",
  gray: "#8C8579",
  ink: "#2A271F",
};

/* ----------------------------------------------------------------------
   SHARED PRIMITIVES
------------------------------------------------------------------------- */

function Eyebrow({ children, dark }) {
  return (
    <div
      className="inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase mb-4"
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        color: dark ? "#D8CBAF" : COLORS.brown,
      }}
    >
      <span className="w-4 h-px" style={{ background: dark ? "#D8CBAF" : COLORS.gold }} />
      {children}
    </div>
  );
}

function Button({ children, variant = "primary", className = "", onClick, type = "button", icon: Icon }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[14.5px] font-medium transition-all duration-300 select-none";
  const variants = {
    primary:
      "text-white shadow-[0_4px_18px_rgba(47,74,60,0.28)] hover:shadow-[0_6px_22px_rgba(47,74,60,0.38)] hover:-translate-y-0.5",
    secondary:
      "border hover:-translate-y-0.5",
    ghost: "hover:bg-black/[0.03]",
    gold: "text-white shadow-[0_4px_18px_rgba(180,136,79,0.35)] hover:-translate-y-0.5",
  };
  const style =
    variant === "primary"
      ? { background: `linear-gradient(180deg, #35543F, ${COLORS.forestDeep})` }
      : variant === "secondary"
      ? { borderColor: "#DDD3C0", color: COLORS.ink, background: "#fff" }
      : variant === "gold"
      ? { background: `linear-gradient(180deg, #C39760, ${COLORS.gold})` }
      : { color: COLORS.ink };
  return (
    <button type={type} onClick={onClick} className={`${base} ${variants[variant]} ${className}`} style={style}>
      {children}
      {Icon && <Icon size={16} strokeWidth={2} />}
    </button>
  );
}

function Postmark({ label = "CHAPTER ONE", size = 64, className = "" }) {
  return (
    <div
      className={`relative shrink-0 rounded-full flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        border: `1.5px dashed ${COLORS.brown}88`,
        transform: "rotate(-8deg)",
      }}
    >
      <div
        className="absolute inset-[5px] rounded-full flex items-center justify-center text-center leading-tight"
        style={{ border: `1px solid ${COLORS.brown}66` }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: size * 0.12,
            letterSpacing: "0.08em",
            color: COLORS.brown,
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

function Seal({ initials, tone = "forest", size = 44 }) {
  const bg =
    tone === "forest"
      ? `linear-gradient(160deg, #3C5D48, ${COLORS.forestDeep})`
      : tone === "brown"
      ? `linear-gradient(160deg, #7C5A42, ${COLORS.brown})`
      : `linear-gradient(160deg, #C39760, ${COLORS.gold})`;
  return (
    <div
      className="rounded-full flex items-center justify-center text-white shrink-0"
      style={{
        width: size,
        height: size,
        background: bg,
        fontFamily: "'Fraunces', serif",
        fontSize: size * 0.36,
        boxShadow: "inset 0 -3px 6px rgba(0,0,0,0.25), 0 3px 8px rgba(0,0,0,0.18)",
      }}
    >
      {initials}
    </div>
  );
}

function Card({ children, className = "", style = {}, stamped = false }) {
  return (
    <div
      className={`relative rounded-[22px] bg-white ${className}`}
      style={{
        border: "1px solid #EAE2D2",
        boxShadow: "0 2px 4px rgba(43,39,31,0.03), 0 14px 34px -18px rgba(43,39,31,0.18)",
        ...style,
      }}
    >
      {stamped && <Postmark size={52} className="absolute -top-4 -right-4 bg-[#FAF8F4]" />}
      {children}
    </div>
  );
}

function Chip({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-full text-[13.5px] transition-colors duration-200 border"
      style={{
        background: active ? COLORS.forest : "#fff",
        color: active ? "#fff" : COLORS.ink,
        borderColor: active ? COLORS.forest : "#E3DAC8",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {children}
    </button>
  );
}

function SectionHeading({ eyebrow, title, sub, center }) {
  return (
    <div className={`max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2
        className="text-[34px] md:text-[44px] leading-[1.08] mb-4"
        style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink, fontWeight: 500 }}
      >
        {title}
      </h2>
      {sub && (
        <p className="text-[16.5px] leading-relaxed" style={{ color: "#5C574C" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------------
   NAVIGATION
------------------------------------------------------------------------- */

const PAGES = [
  { id: "landing", label: "Landing" },
  { id: "signup", label: "Sign Up" },
  { id: "application", label: "Candidate Application" },
  { id: "open", label: "Open Connections" },
  { id: "browse", label: "Browse Connections" },
  { id: "review", label: "Application Review" },
  { id: "penpal", label: "Pen Pal Room" },
  { id: "unlock", label: "Mutual Unlock" },
  { id: "references", label: "References" },
  { id: "reputation", label: "Reputation" },
];

function Logo({ dark }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: dark ? "#F1E9DA" : COLORS.forest }}
      >
        <Feather size={15} color={dark ? COLORS.forest : "#F1E9DA"} strokeWidth={2} />
      </div>
      <span
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 19,
          color: dark ? "#FAF8F4" : COLORS.ink,
          fontWeight: 500,
        }}
      >
        Chapter One
      </span>
    </div>
  );
}

function NavBar({ page, setPage, dark = false }) {
  const [openMenu, setOpenMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-md"
      style={{
        background: dark ? "rgba(34,54,43,0.85)" : "rgba(250,248,244,0.85)",
        borderBottom: `1px solid ${dark ? "#3a5a47" : "#EAE2D2"}`,
      }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-10 h-[76px] flex items-center justify-between">
        <button onClick={() => setPage("landing")}>
          <Logo dark={dark} />
        </button>

        <nav className="hidden lg:flex items-center gap-1">
          {[
            ["How it works", "landing"],
            ["Browse", "browse"],
            ["Reputation", "reputation"],
          ].map(([label, id]) => (
            <button
              key={id}
              onClick={() => setPage(id)}
              className="px-4 py-2 rounded-full text-[14px] transition-colors"
              style={{
                color: dark ? "#EDE6D6" : "#5C574C",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {label}
            </button>
          ))}

          {/* Prototype navigator: lets a reviewer jump anywhere in the flow */}
          <div className="relative ml-2">
            <button
              onClick={() => setOpenMenu((v) => !v)}
              className="px-4 py-2 rounded-full text-[14px] flex items-center gap-1.5 border"
              style={{
                color: dark ? "#EDE6D6" : COLORS.ink,
                borderColor: dark ? "#3a5a47" : "#E3DAC8",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12.5,
              }}
            >
              PROTOTYPE MAP <ChevronDown size={13} />
            </button>
            {openMenu && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-2 shadow-2xl"
                style={{ border: "1px solid #EAE2D2" }}
              >
                {PAGES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setPage(p.id);
                      setOpenMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-[13.5px] flex items-center justify-between hover:bg-[#F1E9DA]/60"
                    style={{ color: page === p.id ? COLORS.forest : COLORS.ink, fontFamily: "'Inter', sans-serif" }}
                  >
                    {p.label}
                    {page === p.id && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={() => setPage("signup")}
            className="text-[14px]"
            style={{ color: dark ? "#EDE6D6" : "#5C574C", fontFamily: "'Inter', sans-serif" }}
          >
            Sign in
          </button>
          <Button variant={dark ? "gold" : "primary"} onClick={() => setPage("signup")}>
            Apply
          </Button>
        </div>

        <button className="lg:hidden" onClick={() => setMobileOpen((v) => !v)}>
          <Menu color={dark ? "#FAF8F4" : COLORS.ink} />
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden px-5 sm:px-6 pb-6 flex flex-col gap-1 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center gap-3 py-2 mb-2">
            <Button
              className="flex-1"
              onClick={() => { setPage("signup"); setMobileOpen(false); }}
            >
              Apply
            </Button>
            <button
              onClick={() => { setPage("signup"); setMobileOpen(false); }}
              className="text-[14px] px-4 py-3"
              style={{ color: dark ? "#EDE6D6" : "#5C574C", fontFamily: "'Inter', sans-serif" }}
            >
              Sign in
            </button>
          </div>
          {PAGES.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setPage(p.id);
                setMobileOpen(false);
              }}
              className="text-left px-3 py-2.5 rounded-xl text-[14.5px]"
              style={{
                background: page === p.id ? (dark ? "#33513f" : "#F1E9DA") : "transparent",
                color: dark ? "#F1E9DA" : COLORS.ink,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

function Footer({ setPage }) {
  return (
    <footer style={{ background: COLORS.forestDeep }} className="text-[#D8CBAF] pt-16 pb-10 px-5 sm:px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 pb-12" style={{ borderBottom: "1px solid #3a5a47" }}>
          <div className="col-span-2">
            <Logo dark />
            <p className="mt-4 text-[14.5px] leading-relaxed max-w-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
              Every great story starts with a first chapter. We help people begin theirs with intention.
            </p>
          </div>
          {[
            ["Explore", ["Browse Connections", "browse"], ["How it works", "landing"], ["Reputation", "reputation"]],
            ["Get started", ["Apply", "signup"], ["Candidate application", "application"], ["Open connections", "open"]],
            ["The room", ["Pen Pal Room", "penpal"], ["Mutual Unlock", "unlock"], ["References", "references"]],
          ].map(([title, ...links], i) => (
            <div key={i}>
              <div
                className="text-[11px] tracking-[0.2em] uppercase mb-4"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: "#9CB3A2" }}
              >
                {title}
              </div>
              <div className="flex flex-col gap-2.5">
                {links.map(([label, id]) => (
                  <button
                    key={id}
                    onClick={() => setPage(id)}
                    className="text-left text-[14px]"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div
          className="pt-6 flex flex-col md:flex-row justify-between gap-3 text-[13px]"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: "#7C9686" }}
        >
          <span>© 2026 Chapter One, Inc. A prototype for thoughtful connection.</span>
          <span>Take your time.</span>
        </div>
      </div>
    </footer>
  );
}

/* ----------------------------------------------------------------------
   1. LANDING PAGE
------------------------------------------------------------------------- */

function LandingPage({ setPage }) {
  const steps = [
    {
      icon: NotebookPen,
      title: "Write your application",
      body: "Skip the profile. Answer a handful of real questions about who you are and what you're looking for.",
    },
    {
      icon: Compass,
      title: "Open or answer a listing",
      body: "Post what kind of connection you're seeking, or apply to someone else's: a hiking partner, a book club friend, a first date.",
    },
    {
      icon: Feather,
      title: "Correspond in the Pen Pal Room",
      body: "Anonymous, unhurried messages. No photos, no phone numbers. Just the conversation.",
    },
    {
      icon: Unlock,
      title: "Unlock trust together",
      body: "Voice, video, and meeting in person only happen when you both agree it's time.",
    },
  ];

  const testimonials = [
    {
      quote:
        "I wrote three drafts of my application before I sent it. That's the point. I'd never done that for a dating profile.",
      name: "M. Okafor",
      meta: "Matched through Open Connections, 8 months",
    },
    {
      quote:
        "We spent eleven days as pen pals before a single voice message. By the time we unlocked video, it felt earned.",
      name: "R. Solberg",
      meta: "Matched through Browse Connections, 5 months",
    },
    {
      quote:
        "I found my hiking partner here. We're on our thirtieth trail. Neither of us was looking for romance, and that was fine. The platform didn't assume otherwise.",
      name: "T. Alvarez",
      meta: "Friendship listing, 1 year",
    },
  ];

  const faqs = [
    {
      q: "Is this a dating app?",
      a: "No. Chapter One is a platform for intentional connection of every kind: friendship, dating, travel companionship, creative collaboration, and more. Dating is one of seven paths, never the default.",
    },
    {
      q: "Why an application instead of a profile?",
      a: "Profiles reward good photos. Applications reward honest, thoughtful answers. We ask the questions a good friend would eventually ask you anyway.",
    },
    {
      q: "When do photos or phone numbers get shared?",
      a: "Never automatically. The Pen Pal Room hides them by design. Sharing anything happens through Mutual Unlock, and only once both people agree.",
    },
    {
      q: "What if I don't hear back?",
      a: "Every application receives a response: accepted, shortlisted, or a kind decline. Silence isn't part of how Chapter One works.",
    },
  ];
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden" style={{ background: COLORS.warmWhite }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-10 pt-20 pb-24 md:pt-28 md:pb-32 grid md:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
          <div>
            <Eyebrow>A slower way to meet people</Eyebrow>
            <h1
              className="text-[38px] sm:text-[54px] md:text-[68px] leading-[1.06] sm:leading-[1.03] mb-7"
              style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink, fontWeight: 500 }}
            >
              Meet people through <span style={{ fontStyle: "italic", color: COLORS.forest }}>intention</span>.
            </h1>
            <p className="text-[18px] leading-relaxed max-w-lg mb-10" style={{ color: "#5C574C" }}>
              Chapter One helps people build genuine friendships and relationships through thoughtful
              applications and progressive trust.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => setPage("signup")} icon={ArrowRight}>
                Apply
              </Button>
              <Button variant="secondary" onClick={() => setPage("browse")}>
                Browse Connections
              </Button>
            </div>
            <div className="flex items-center gap-6 mt-12">
              {["Thoughtful", "Anonymous until ready", "Mutual, always"].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <Check size={15} color={COLORS.forest} />
                  <span className="text-[13.5px]" style={{ color: "#6B6559", fontFamily: "'Inter', sans-serif" }}>
                    {t}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Signature hero visual: a letter mid-unfold, seals down the margin */}
          <div className="relative h-[420px] hidden md:block">
            <div
              className="absolute inset-0 rounded-[28px] rotate-3"
              style={{ background: COLORS.cream, border: "1px solid #E3DAC8" }}
            />
            <div
              className="absolute inset-0 rounded-[28px] -rotate-2 bg-white p-8 flex flex-col"
              style={{ border: "1px solid #EAE2D2", boxShadow: "0 30px 60px -20px rgba(43,39,31,0.25)" }}
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-[11px] tracking-[0.2em] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: COLORS.brown }}>
                  Application draft
                </span>
                <Postmark size={46} />
              </div>
              <span className="text-[13px] mb-1" style={{ color: COLORS.gray, fontFamily: "'Inter', sans-serif" }}>
                Describe your ideal weekend.
              </span>
              <p
                className="text-[19px] leading-relaxed"
                style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink, fontStyle: "italic" }}
              >
                "Market on Saturday morning, something slow-cooked by evening, and one long
                conversation I didn't see coming."
              </p>
              <div className="mt-auto flex items-center gap-3">
                <div className="h-1.5 flex-1 rounded-full bg-[#F1E9DA] overflow-hidden">
                  <div className="h-full w-2/3 rounded-full" style={{ background: COLORS.forest }} />
                </div>
                <span className="text-[12px]" style={{ color: COLORS.gray, fontFamily: "'JetBrains Mono', monospace" }}>
                  6/9
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-5 sm:px-6 md:px-10 py-24" style={{ background: "#fff" }}>
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            eyebrow="How it works"
            title="Four steps, at a human pace."
            sub="Nothing here is instant on purpose. Each step exists to slow the process down just enough to matter."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
            {steps.map((s, i) => (
              <Card key={i} className="p-7">
                <span
                  className="text-[12px] block mb-6"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: COLORS.gold }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center mb-5"
                  style={{ background: COLORS.cream }}
                >
                  <s.icon size={18} color={COLORS.forest} />
                </div>
                <h3 className="text-[18.5px] mb-2.5" style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink }}>
                  {s.title}
                </h3>
                <p className="text-[14.5px] leading-relaxed" style={{ color: "#6B6559" }}>
                  {s.body}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHAPTER ONE */}
      <section className="px-5 sm:px-6 md:px-10 py-24" style={{ background: COLORS.warmWhite }}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <Eyebrow>Why Chapter One</Eyebrow>
            <h2
              className="text-[32px] md:text-[40px] leading-[1.1] mb-6"
              style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink, fontWeight: 500 }}
            >
              We built the opposite of a swipe.
            </h2>
            <div className="flex flex-col gap-6">
              {[
                ["No photos, at first", "Chemistry built on words holds up. Chemistry built on a thumbnail rarely does."],
                ["No endless feed", "You review a handful of applications with real attention, not a hundred with none."],
                ["No unilateral unlocking", "Voice, video, and meeting in person require both people to say yes, independently."],
              ].map(([t, d]) => (
                <div key={t} className="flex gap-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: COLORS.forest }}>
                    <Check size={15} color="#fff" />
                  </div>
                  <div>
                    <h4 className="text-[16.5px] mb-1" style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink }}>
                      {t}
                    </h4>
                    <p className="text-[14.5px] leading-relaxed" style={{ color: "#6B6559" }}>
                      {d}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Card className="p-8" stamped>
            <Eyebrow>Signal, not spectacle</Eyebrow>
            <h3 className="text-[22px] mb-5" style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink }}>
              Trust badges replace star ratings
            </h3>
            <div className="flex flex-col gap-3">
              {["Thoughtful Writer", "Great Listener", "Keeps Commitments"].map((b) => (
                <div key={b} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: COLORS.warmWhite }}>
                  <ShieldCheck size={17} color={COLORS.gold} />
                  <span className="text-[14.5px]" style={{ fontFamily: "'Inter', sans-serif", color: COLORS.ink }}>
                    {b}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setPage("reputation")}
              className="mt-6 text-[13.5px] flex items-center gap-1.5"
              style={{ color: COLORS.forest, fontFamily: "'Inter', sans-serif" }}
            >
              See the full reputation system <ChevronRight size={14} />
            </button>
          </Card>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-5 sm:px-6 md:px-10 py-24" style={{ background: "#fff" }}>
        <div className="max-w-7xl mx-auto">
          <SectionHeading center eyebrow="Early stories" title="Meaningful conversations begin with curiosity." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
            {testimonials.map((t, i) => (
              <Card key={i} className="p-7 flex flex-col">
                <Quote size={22} color={COLORS.gold} className="mb-4" />
                <p className="text-[16px] leading-relaxed flex-1" style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink, fontStyle: "italic" }}>
                  "{t.quote}"
                </p>
                <div className="mt-6 pt-5 flex items-center gap-3" style={{ borderTop: "1px solid #EFE8D9" }}>
                  <Seal initials={t.name[0]} size={36} tone={i === 1 ? "brown" : "forest"} />
                  <div>
                    <div className="text-[13.5px]" style={{ fontFamily: "'Inter', sans-serif", color: COLORS.ink }}>{t.name}</div>
                    <div className="text-[12px]" style={{ color: COLORS.gray, fontFamily: "'JetBrains Mono', monospace" }}>{t.meta}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-5 sm:px-6 md:px-10 py-24" style={{ background: COLORS.warmWhite }}>
        <div className="max-w-3xl mx-auto">
          <SectionHeading eyebrow="Questions" title="Frequently asked." center />
          <div className="mt-12 flex flex-col gap-3">
            {faqs.map((f, i) => (
              <div key={i} className="rounded-2xl bg-white overflow-hidden" style={{ border: "1px solid #EAE2D2" }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="text-[16px]" style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink }}>{f.q}</span>
                  <ChevronDown
                    size={17}
                    color={COLORS.brown}
                    style={{ transform: openFaq === i ? "rotate(180deg)" : "none", transition: "transform 0.25s" }}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-[14.5px] leading-relaxed" style={{ color: "#6B6559" }}>
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 sm:px-6 md:px-10 py-24" style={{ background: COLORS.forestDeep }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-[32px] md:text-[42px] mb-5 text-white" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
            Every great story starts with a first chapter.
          </h2>
          <p className="text-[16px] mb-9" style={{ color: "#C9D9CE", fontFamily: "'Inter', sans-serif" }}>
            Take your time. There's no clock running here.
          </p>
          <Button variant="gold" onClick={() => setPage("signup")} icon={ArrowRight}>
            Begin your application
          </Button>
        </div>
      </section>
    </div>
  );
}

/* ----------------------------------------------------------------------
   2. SIGN UP
------------------------------------------------------------------------- */

function SignUpPage({ setPage }) {
  const options = [
    { id: "friendship", label: "Friendship", icon: Users, desc: "Someone to call, confide in, or grab coffee with." },
    { id: "dating", label: "Dating", icon: Heart, desc: "A relationship built on more than a first impression." },
    { id: "professional", label: "Professional Friend", icon: Coffee, desc: "A peer for career, ideas, and honest feedback." },
    { id: "travel", label: "Travel Companion", icon: Compass, desc: "Someone whose pace matches yours on the road." },
    { id: "study", label: "Study Buddy", icon: BookOpen, desc: "Shared focus, shared accountability." },
    { id: "creative", label: "Creative Collaborator", icon: PenLine, desc: "A partner for the thing you keep meaning to make." },
    { id: "language", label: "Language Partner", icon: Feather, desc: "Practice a language with a real person, not an app." },
  ];
  const [selected, setSelected] = useState(["friendship"]);
  const toggle = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div className="min-h-[80vh] px-5 sm:px-6 md:px-10 py-20" style={{ background: COLORS.warmWhite }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-10">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-3 flex-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[12.5px] shrink-0"
                style={{
                  background: n === 1 ? COLORS.forest : "#fff",
                  color: n === 1 ? "#fff" : COLORS.gray,
                  border: n === 1 ? "none" : "1px solid #E3DAC8",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {n}
              </div>
              {n < 3 && <div className="flex-1 h-px" style={{ background: "#E3DAC8" }} />}
            </div>
          ))}
        </div>

        <Eyebrow>Step 1 of 3</Eyebrow>
        <h1 className="text-[32px] md:text-[38px] mb-3" style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink, fontWeight: 500 }}>
          What are you hoping to find here?
        </h1>
        <p className="text-[15.5px] mb-10" style={{ color: "#6B6559" }}>
          Choose as many as feel true. You can open or answer listings across every one of these later.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {options.map((o) => {
            const active = selected.includes(o.id);
            return (
              <button
                key={o.id}
                onClick={() => toggle(o.id)}
                className="text-left p-5 rounded-2xl transition-all duration-200"
                style={{
                  background: active ? COLORS.forest : "#fff",
                  border: active ? `1px solid ${COLORS.forest}` : "1px solid #EAE2D2",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: active ? "rgba(255,255,255,0.15)" : COLORS.cream }}
                  >
                    <o.icon size={17} color={active ? "#fff" : COLORS.forest} />
                  </div>
                  {active && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: COLORS.gold }}>
                      <Check size={12} color="#fff" />
                    </div>
                  )}
                </div>
                <h3
                  className="text-[16.5px] mb-1"
                  style={{ fontFamily: "'Fraunces', serif", color: active ? "#fff" : COLORS.ink }}
                >
                  {o.label}
                </h3>
                <p className="text-[13.5px] leading-relaxed" style={{ color: active ? "#D8E3DA" : COLORS.gray }}>
                  {o.desc}
                </p>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[13.5px]" style={{ color: COLORS.gray, fontFamily: "'Inter', sans-serif" }}>
            {selected.length} selected
          </span>
          <Button onClick={() => setPage("application")} icon={ArrowRight}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------
   3. CANDIDATE APPLICATION (two-step: essays, then supporting documents)
------------------------------------------------------------------------- */

function LabeledTextArea({ label, placeholder, rows = 3 }) {
  return (
    <div className="mb-7">
      <label
        className="block text-[15px] mb-2.5"
        style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink, fontStyle: "italic" }}
      >
        {label}
      </label>
      <textarea
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-xl px-4 py-3.5 text-[14.5px] leading-relaxed outline-none focus:ring-2 transition-all resize-none placeholder:text-[#B3AC9C]"
        style={{ border: "1px solid #E3DAC8", background: "#fff", fontFamily: "'Inter', sans-serif", color: COLORS.ink }}
      />
    </div>
  );
}

function Dropzone({ icon: Icon, label, hint }) {
  return (
    <button
      className="w-full flex items-center gap-4 p-5 rounded-2xl text-left transition-colors hover:bg-[#F1E9DA]/40"
      style={{ border: "1.5px dashed #DCD0B6", background: "#fff" }}
    >
      <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: COLORS.cream }}>
        <Icon size={17} color={COLORS.brown} />
      </div>
      <div className="flex-1">
        <div className="text-[14.5px]" style={{ fontFamily: "'Inter', sans-serif", color: COLORS.ink }}>{label}</div>
        <div className="text-[12.5px]" style={{ color: COLORS.gray }}>{hint}</div>
      </div>
      <Plus size={16} color={COLORS.gray} />
    </button>
  );
}

function ApplicationPage() {
  const [step, setStep] = useState(1);
  const essays = [
    { label: "What brings you here?", placeholder: "Take your time. There's no wrong answer." },
    { label: "What makes you happy?", placeholder: "Small things count." },
    { label: "Describe your ideal weekend.", placeholder: "Be specific. Specific is more honest than aspirational." },
    { label: "What are you passionate about?", placeholder: "The thing you'd talk about for an hour unprompted." },
    { label: "Three things your friends would say about you.", placeholder: "Ask one, if you're not sure." },
    { label: "One flaw you're working on.", placeholder: "Self-awareness reads as trust." },
    { label: "How do you resolve conflict?", placeholder: "A real example is more useful than a philosophy." },
    { label: "What are you looking for?", placeholder: "Be as precise as you can bear to be." },
  ];
  const docs = [
    { icon: ImageIcon, label: "Photos", hint: "Shown only after Mutual Unlock, if you choose." },
    { icon: Music, label: "Spotify playlist", hint: "A dozen songs say more than a bio." },
    { icon: BookOpen, label: "Favorite books", hint: "Optional, but a strong signal." },
    { icon: ListChecks, label: "Reading list", hint: "What you're currently working through." },
    { icon: Star, label: "Bucket list", hint: "Three or four, real ones." },
    { icon: Mic, label: "Voice introduction", hint: "60 seconds, unedited is fine." },
    { icon: Coffee, label: "Recipe", hint: "One you'd actually cook for someone." },
    { icon: Sparkles, label: "Mood board", hint: "A handful of images that feel like you." },
    { icon: Mail, label: "Letter to future friend or partner", hint: "Written before you know who reads it." },
    { icon: ShieldCheck, label: "Reference letters", hint: "From people who've known you a while." },
  ];

  return (
    <div className="px-5 sm:px-6 md:px-10 py-16" style={{ background: COLORS.warmWhite }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-10">
          {["Basic information", "About me", "Supporting documents"].map((label, i) => {
            const n = i + 1;
            const active = step >= n;
            return (
              <div key={label} className="flex items-center gap-3 flex-1">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] shrink-0"
                  style={{
                    background: active ? COLORS.forest : "#fff",
                    color: active ? "#fff" : COLORS.gray,
                    border: active ? "none" : "1px solid #E3DAC8",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {n}
                </div>
                <span className="hidden sm:inline text-[12.5px]" style={{ color: active ? COLORS.ink : COLORS.gray }}>
                  {label}
                </span>
                {n < 3 && <div className="flex-1 h-px" style={{ background: "#E3DAC8" }} />}
              </div>
            );
          })}
        </div>

        {step === 1 && (
          <div>
            <Eyebrow>Candidate application</Eyebrow>
            <h1 className="text-[32px] mb-3" style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink, fontWeight: 500 }}>
              Basic information
            </h1>
            <p className="text-[15px] mb-9" style={{ color: "#6B6559" }}>
              Nothing performative. Just the facts a real introduction needs.
            </p>
            <Card className="p-7">
              <div className="grid sm:grid-cols-2 gap-5">
                {[["Full name", "Amara Whitfield"], ["Pronouns", "she / her"], ["Location", "Portland, OR"], ["Age", "29"]].map(
                  ([label, ph]) => (
                    <div key={label}>
                      <label className="block text-[13px] mb-2" style={{ color: COLORS.gray, fontFamily: "'Inter', sans-serif" }}>
                        {label}
                      </label>
                      <input
                        placeholder={ph}
                        className="w-full rounded-xl px-4 py-3 text-[14.5px] outline-none placeholder:text-[#B3AC9C]"
                        style={{ border: "1px solid #E3DAC8", fontFamily: "'Inter', sans-serif", color: COLORS.ink }}
                      />
                    </div>
                  )
                )}
              </div>
            </Card>
            <div className="flex justify-end mt-9">
              <Button onClick={() => setStep(2)} icon={ArrowRight}>Continue</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <Eyebrow>Candidate application</Eyebrow>
            <h1 className="text-[32px] mb-3" style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink, fontWeight: 500 }}>
              About me
            </h1>
            <p className="text-[15px] mb-9" style={{ color: "#6B6559" }}>
              These answers matter more than any photo will. Write them like you mean them.
            </p>
            <Card className="p-7">
              {essays.map((e) => (
                <LabeledTextArea key={e.label} label={e.label} placeholder={e.placeholder} />
              ))}
              <div className="rounded-xl p-5 flex items-center gap-4" style={{ background: COLORS.cream }}>
                <Video size={18} color={COLORS.brown} />
                <div className="flex-1">
                  <div className="text-[14px]" style={{ fontFamily: "'Inter', sans-serif", color: COLORS.ink }}>
                    Two-minute introduction video
                  </div>
                  <div className="text-[12.5px]" style={{ color: COLORS.gray }}>Optional, shown only to people you accept.</div>
                </div>
                <Button variant="secondary" icon={Play}>Record</Button>
              </div>
            </Card>
            <div className="flex justify-between mt-9">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)} icon={ArrowRight}>Continue</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <Eyebrow>Candidate application</Eyebrow>
            <h1 className="text-[32px] mb-3" style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink, fontWeight: 500 }}>
              Supporting documents
            </h1>
            <p className="text-[15px] mb-9" style={{ color: "#6B6559" }}>
              All optional. Each one is another honest way to be known. Add only what feels true.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {docs.map((d) => (
                <Dropzone key={d.label} {...d} />
              ))}
            </div>
            <div className="flex justify-between mt-9">
              <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
              <Button variant="gold" icon={Check}>Submit application</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------
   Shared listing data (used by Open Connections + Browse + Review)
------------------------------------------------------------------------- */

const LISTING_KINDS = [
  { title: "Looking for a Book Club Friend", type: "Friendship", tone: "forest" },
  { title: "Looking for a Hiking Partner", type: "Friendship", tone: "forest" },
  { title: "Looking for a Boyfriend", type: "Dating", tone: "brown" },
  { title: "Looking for a Girlfriend", type: "Dating", tone: "brown" },
  { title: "Looking for a Travel Buddy", type: "Travel Companion", tone: "gold" },
  { title: "Looking for a Museum Companion", type: "Friendship", tone: "forest" },
];

const LISTINGS = LISTING_KINDS.map((l, i) => ({
  id: i + 1,
  ...l,
  location: ["Portland, OR", "Remote", "Chicago, IL", "Lisbon, Portugal", "Austin, TX", "Brooklyn, NY"][i],
  age: 24 + i * 3,
  languages: ["English"][0],
  description:
    "I'm looking for someone to share this with regularly, not a one-off, but something that becomes part of a normal week.",
  requirements: ["Responds within a few days, not a few minutes", "Comfortable with a slow start", "Lives within a reasonable distance, or genuinely open to remote"],
  niceToHave: ["Similar taste in conversation over small talk", "A standing weekly rhythm works for you"],
  expect: "I show up prepared, I follow through on plans, and I'll tell you honestly if something isn't working rather than disappearing.",
  applicants: 3 + i,
}));

/* ----------------------------------------------------------------------
   4. OPEN CONNECTIONS (create & manage your own listings)
------------------------------------------------------------------------- */

function OpenConnectionsPage({ setPage }) {
  const [showForm, setShowForm] = useState(false);
  const mine = LISTINGS.slice(0, 2);

  return (
    <div className="px-5 sm:px-6 md:px-10 py-16" style={{ background: COLORS.warmWhite }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between flex-wrap gap-6 mb-12">
          <div>
            <Eyebrow>Open Connections</Eyebrow>
            <h1 className="text-[34px] mb-3" style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink, fontWeight: 500 }}>
              What are you opening yourself to?
            </h1>
            <p className="text-[15px] max-w-xl" style={{ color: "#6B6559" }}>
              Post a listing instead of a profile. Say plainly what you're looking for, what matters
              to you, and what someone can expect from you in return.
            </p>
          </div>
          <Button onClick={() => setShowForm((v) => !v)} icon={Plus}>
            New listing
          </Button>
        </div>

        {showForm && (
          <Card className="p-7 mb-12">
            <h3 className="text-[19px] mb-6" style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink }}>
              Draft a connection listing
            </h3>
            <div className="mb-5">
              <label className="block text-[13px] mb-2" style={{ color: COLORS.gray }}>Title</label>
              <input
                placeholder="Looking for a Sunday Running Partner"
                className="w-full rounded-xl px-4 py-3 text-[14.5px] outline-none placeholder:text-[#B3AC9C]"
                style={{ border: "1px solid #E3DAC8", fontFamily: "'Inter', sans-serif" }}
              />
            </div>
            <LabeledTextArea label="Description" placeholder="What kind of connection are you hoping to build, and why now?" />
            <LabeledTextArea label="Requirements" placeholder="What matters, non-negotiable and plainly stated." rows={2} />
            <LabeledTextArea label="Nice-to-have qualities" placeholder="Not required, but would make this easier." rows={2} />
            <LabeledTextArea label="What someone can expect from me" placeholder="Your side of the agreement." rows={2} />
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowForm(false)}>Save as draft</Button>
              <Button variant="gold" icon={Check}>Publish listing</Button>
            </div>
          </Card>
        )}

        <h3 className="text-[13px] tracking-[0.18em] uppercase mb-5" style={{ fontFamily: "'JetBrains Mono', monospace", color: COLORS.brown }}>
          Your listings
        </h3>
        <div className="grid sm:grid-cols-2 gap-6 mb-16">
          {mine.map((l) => (
            <Card key={l.id} className="p-6" stamped>
              <span
                className="inline-block text-[11.5px] px-3 py-1 rounded-full mb-4"
                style={{ background: COLORS.cream, color: COLORS.brown, fontFamily: "'JetBrains Mono', monospace" }}
              >
                {l.type}
              </span>
              <h4 className="text-[19px] mb-2" style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink }}>{l.title}</h4>
              <p className="text-[14px] leading-relaxed mb-5" style={{ color: "#6B6559" }}>{l.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-[13px]" style={{ color: COLORS.gray }}>{l.applicants} applications</span>
                <button
                  onClick={() => setPage("review")}
                  className="text-[13.5px] flex items-center gap-1"
                  style={{ color: COLORS.forest, fontFamily: "'Inter', sans-serif" }}
                >
                  Review applications <ChevronRight size={13} />
                </button>
              </div>
            </Card>
          ))}
        </div>

        <h3 className="text-[13px] tracking-[0.18em] uppercase mb-5" style={{ fontFamily: "'JetBrains Mono', monospace", color: COLORS.brown }}>
          For inspiration: kinds of listings people open
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {LISTING_KINDS.map((l) => (
            <div key={l.title} className="p-5 rounded-2xl" style={{ background: "#fff", border: "1px solid #EAE2D2" }}>
              <Feather size={16} color={COLORS.gold} className="mb-3" />
              <div className="text-[15px]" style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink }}>{l.title}</div>
              <div className="text-[12.5px] mt-1" style={{ color: COLORS.gray }}>{l.type}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------
   5. BROWSE CONNECTIONS
------------------------------------------------------------------------- */

function BrowseConnectionsPage({ setPage }) {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [applied, setApplied] = useState(false);
  const [listings, setListings] = useState(LISTINGS);
  const filters = ["All", "Friendship", "Dating", "Travel Companion", "Remote", "Local"];

  // Pull live listings from WordPress if NEXT_PUBLIC_WORDPRESS_API_URL is
  // configured; otherwise this silently keeps the local demo data above.
  useEffect(() => {
    let cancelled = false;
    getListings().then((wpListings) => {
      if (!cancelled && wpListings && wpListings.length) setListings(wpListings);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const visible =
    filter === "All" || filter === "Remote" || filter === "Local"
      ? listings
      : listings.filter((l) => l.type === filter);

  if (selected) {
    return (
      <div className="px-5 sm:px-6 md:px-10 py-16" style={{ background: COLORS.warmWhite }}>
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => { setSelected(null); setApplied(false); }}
            className="flex items-center gap-2 text-[13.5px] mb-8"
            style={{ color: COLORS.brown }}
          >
            <ChevronLeft size={15} /> Back to Browse Connections
          </button>
          <Card className="p-8" stamped>
            <span
              className="inline-block text-[11.5px] px-3 py-1 rounded-full mb-5"
              style={{ background: COLORS.cream, color: COLORS.brown, fontFamily: "'JetBrains Mono', monospace" }}
            >
              {selected.type}
            </span>
            <h1 className="text-[30px] mb-3" style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink, fontWeight: 500 }}>
              {selected.title}
            </h1>
            <div className="flex items-center gap-4 text-[13.5px] mb-7" style={{ color: COLORS.gray }}>
              <span className="flex items-center gap-1.5"><MapPin size={13} />{selected.location}</span>
              <span>Age {selected.age}+</span>
              <span>{selected.applicants} applications so far</span>
            </div>
            <p className="text-[15.5px] leading-relaxed mb-8" style={{ color: "#4A463C" }}>{selected.description}</p>

            <div className="grid sm:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="text-[13px] tracking-[0.15em] uppercase mb-3" style={{ fontFamily: "'JetBrains Mono', monospace", color: COLORS.brown }}>
                  Requirements
                </h4>
                <ul className="flex flex-col gap-2.5">
                  {selected.requirements.map((r) => (
                    <li key={r} className="flex gap-2.5 text-[14px] leading-relaxed" style={{ color: "#4A463C" }}>
                      <Check size={15} color={COLORS.forest} className="shrink-0 mt-0.5" /> {r}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-[13px] tracking-[0.15em] uppercase mb-3" style={{ fontFamily: "'JetBrains Mono', monospace", color: COLORS.brown }}>
                  Nice to have
                </h4>
                <ul className="flex flex-col gap-2.5">
                  {selected.niceToHave.map((r) => (
                    <li key={r} className="flex gap-2.5 text-[14px] leading-relaxed" style={{ color: "#4A463C" }}>
                      <Sparkles size={14} color={COLORS.gold} className="shrink-0 mt-0.5" /> {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-xl p-5 mb-8" style={{ background: COLORS.cream }}>
              <h4 className="text-[13px] tracking-[0.15em] uppercase mb-2" style={{ fontFamily: "'JetBrains Mono', monospace", color: COLORS.brown }}>
                What you can expect from me
              </h4>
              <p className="text-[14.5px] leading-relaxed" style={{ color: "#4A463C" }}>{selected.expect}</p>
            </div>

            {applied ? (
              <div className="flex items-center gap-3 px-5 py-4 rounded-xl" style={{ background: "#EAF1EC" }}>
                <Check size={18} color={COLORS.forest} />
                <span className="text-[14.5px]" style={{ color: COLORS.forestDeep, fontFamily: "'Inter', sans-serif" }}>
                  Your application has been sent. You'll hear back, one way or another.
                </span>
              </div>
            ) : (
              <Button variant="gold" onClick={() => setApplied(true)} icon={ArrowRight}>
                Apply to this listing
              </Button>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 sm:px-6 md:px-10 py-16" style={{ background: COLORS.warmWhite }}>
      <div className="max-w-6xl mx-auto">
        <Eyebrow>Browse Connections</Eyebrow>
        <h1 className="text-[34px] mb-3" style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink, fontWeight: 500 }}>
          A room full of open listings.
        </h1>
        <p className="text-[15px] mb-8 max-w-xl" style={{ color: "#6B6559" }}>
          Read a few closely rather than skimming a hundred. Each one was written by a real person, on purpose.
        </p>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] px-4 py-2.5 rounded-full bg-white" style={{ border: "1px solid #E3DAC8" }}>
            <Search size={15} color={COLORS.gray} />
            <input
              placeholder="Search listings..."
              className="flex-1 outline-none text-[14px] bg-transparent placeholder:text-[#B3AC9C]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
          </div>
          <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white" style={{ border: "1px solid #E3DAC8" }}>
            <SlidersHorizontal size={15} color={COLORS.brown} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2.5 mb-10">
          {filters.map((f) => (
            <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>{f}</Chip>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((l) => (
            <Card key={l.id} className="p-6 flex flex-col cursor-pointer hover:-translate-y-1 transition-transform duration-300" style={{}} >
              <div onClick={() => setSelected(l)}>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-[11.5px] px-3 py-1 rounded-full"
                    style={{ background: COLORS.cream, color: COLORS.brown, fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {l.type}
                  </span>
                  <Seal initials={l.title[11] || "C"} size={30} tone={l.tone} />
                </div>
                <h3 className="text-[18px] mb-2" style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink }}>{l.title}</h3>
                <p className="text-[13.5px] leading-relaxed mb-5 flex-1" style={{ color: "#6B6559" }}>
                  {l.description}
                </p>
                <div className="flex items-center justify-between text-[12.5px]" style={{ color: COLORS.gray }}>
                  <span className="flex items-center gap-1"><MapPin size={12} />{l.location}</span>
                  <span>{l.applicants} applied</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------
   6. APPLICATION REVIEW
------------------------------------------------------------------------- */

const APPLICANTS = [
  { name: "J. Marchetti", initial: "J", tone: "forest", excerpt: "I'm looking for a book club friend because I miss arguing gently about endings.", badges: ["Thoughtful Writer", "Great Listener"] },
  { name: "S. Okonkwo", initial: "S", tone: "brown", excerpt: "My ideal weekend starts with a long run and ends with something I cooked slowly.", badges: ["Keeps Commitments"] },
  { name: "P. Lindgren", initial: "P", tone: "gold", excerpt: "Conflict, for me, means naming the feeling before naming the disagreement.", badges: ["Respectful Communicator", "Community Favorite"] },
  { name: "A. Delacroix", initial: "A", tone: "forest", excerpt: "Three things my friends would say: patient, occasionally too honest, a good listener.", badges: ["Thoughtful Writer"] },
];

function ApplicationReviewPage() {
  const [statuses, setStatuses] = useState({});
  const [open, setOpen] = useState(null);
  const setStatus = (i, s) => setStatuses((st) => ({ ...st, [i]: s }));

  return (
    <div className="px-5 sm:px-6 md:px-10 py-16" style={{ background: COLORS.warmWhite }}>
      <div className="max-w-4xl mx-auto">
        <Eyebrow>Application Review</Eyebrow>
        <h1 className="text-[32px] mb-2" style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink, fontWeight: 500 }}>
          Looking for a Book Club Friend
        </h1>
        <p className="text-[15px] mb-10" style={{ color: "#6B6559" }}>4 applications received. Read each one like it deserves the time.</p>

        <div className="flex flex-col gap-4">
          {APPLICANTS.map((a, i) => {
            const status = statuses[i];
            const isOpen = open === i;
            return (
              <Card key={a.name} className="p-6">
                <div className="flex items-start gap-4">
                  <Seal initials={a.initial} tone={a.tone} size={46} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h3 className="text-[17px]" style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink }}>{a.name}</h3>
                      {status && (
                        <span
                          className="text-[11.5px] px-3 py-1 rounded-full"
                          style={{
                            background: status === "Declined" ? "#F3E7E3" : status === "Accepted" ? "#E4EEE7" : COLORS.cream,
                            color: status === "Declined" ? "#8A5A45" : status === "Accepted" ? COLORS.forestDeep : COLORS.brown,
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          {status}
                        </span>
                      )}
                    </div>
                    <p
                      className="text-[14.5px] leading-relaxed mt-2 mb-3"
                      style={{ color: "#4A463C", fontFamily: "'Fraunces', serif", fontStyle: "italic" }}
                    >
                      "{a.excerpt}"
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {a.badges.map((b) => (
                        <span
                          key={b}
                          className="flex items-center gap-1.5 text-[12px] px-3 py-1 rounded-full"
                          style={{ background: "#fff", border: "1px solid #EAE2D2", color: COLORS.brown }}
                        >
                          <ShieldCheck size={11} /> {b}
                        </span>
                      ))}
                    </div>

                    {isOpen && (
                      <div className="rounded-xl p-5 mb-4" style={{ background: COLORS.warmWhite }}>
                        <p className="text-[13.5px] leading-relaxed" style={{ color: "#4A463C" }}>
                          <strong style={{ color: COLORS.ink }}>What brings you here: </strong>
                          A friend who moved away used to be my book club of one. I'd like to find that
                          rhythm again with someone nearby.
                        </p>
                        <p className="text-[13.5px] leading-relaxed mt-3" style={{ color: "#4A463C" }}>
                          <strong style={{ color: COLORS.ink }}>What I'm looking for: </strong>
                          Someone who finishes the book, even the slow ones, and doesn't mind a
                          two-hour tangent about the ending.
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setOpen(isOpen ? null : i)}
                        className="text-[13px] px-4 py-2 rounded-full"
                        style={{ border: "1px solid #E3DAC8", color: COLORS.ink, fontFamily: "'Inter', sans-serif" }}
                      >
                        {isOpen ? "Close application" : "Open application"}
                      </button>
                      <button
                        onClick={() => setStatus(i, "Shortlisted")}
                        className="text-[13px] px-4 py-2 rounded-full"
                        style={{ border: "1px solid #E3DAC8", color: COLORS.brown, fontFamily: "'Inter', sans-serif" }}
                      >
                        Shortlist
                      </button>
                      <button
                        onClick={() => setStatus(i, "Accepted")}
                        className="text-[13px] px-4 py-2 rounded-full text-white"
                        style={{ background: COLORS.forest, fontFamily: "'Inter', sans-serif" }}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => setStatus(i, "Declined")}
                        className="text-[13px] px-4 py-2 rounded-full"
                        style={{ color: "#8A5A45", fontFamily: "'Inter', sans-serif" }}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------
   7. PEN PAL ROOM
------------------------------------------------------------------------- */

function PenPalRoomPage() {
  const initialMessages = [
    { from: "them", text: "I've been meaning to write for two days. Wanted it to be a good first letter.", time: "Day 1" },
    { from: "me", text: "Take the time you need. I'd rather read something true than something quick.", time: "Day 1" },
    { from: "them", text: "Fair. Then: I moved here for a job I've since left, and stayed for reasons I'm still working out.", time: "Day 2" },
  ];
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const prompts = [
    "Tell me about your happiest memory.",
    "What book changed your life?",
    "What makes you laugh?",
  ];

  const send = () => {
    if (!draft.trim()) return;
    setMessages((m) => [...m, { from: "me", text: draft, time: "Today" }]);
    setDraft("");
  };

  return (
    <div className="px-5 sm:px-6 md:px-10 py-16" style={{ background: COLORS.warmWhite }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Feather size={18} color={COLORS.brown} />
          <Eyebrow>Pen Pal Room · Anonymous</Eyebrow>
        </div>
        <h1 className="text-[30px] mb-2" style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink, fontWeight: 500 }}>
          Correspondence, day 2
        </h1>
        <p className="text-[14.5px] mb-8" style={{ color: "#6B6559" }}>
          No photos. No phone numbers. No social media. Just what you choose to write.
        </p>

        <Card className="p-6 mb-6">
          <div className="flex flex-col gap-5 mb-6">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[80%]">
                  <div
                    className="px-5 py-4 rounded-2xl text-[14.5px] leading-relaxed"
                    style={{
                      fontFamily: "'Fraunces', serif",
                      background: m.from === "me" ? COLORS.forest : COLORS.cream,
                      color: m.from === "me" ? "#fff" : COLORS.ink,
                      borderTopRightRadius: m.from === "me" ? 4 : 22,
                      borderTopLeftRadius: m.from === "me" ? 22 : 4,
                    }}
                  >
                    {m.text}
                  </div>
                  <div
                    className={`text-[11px] mt-1.5 ${m.from === "me" ? "text-right" : ""}`}
                    style={{ color: COLORS.gray, fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {m.from === "me" ? "You" : "Them"} · {m.time}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            {prompts.map((p) => (
              <button
                key={p}
                onClick={() => setDraft(p + " ")}
                className="text-[12.5px] px-3.5 py-2 rounded-full flex items-center gap-1.5"
                style={{ border: "1px dashed #DCD0B6", color: COLORS.brown, fontFamily: "'Inter', sans-serif" }}
              >
                <Sparkles size={11} /> {p}
              </button>
            ))}
          </div>

          <div className="flex items-end gap-3">
            <textarea
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write your letter..."
              className="flex-1 rounded-xl px-4 py-3 text-[14.5px] outline-none resize-none placeholder:text-[#B3AC9C]"
              style={{ border: "1px solid #E3DAC8", fontFamily: "'Inter', sans-serif", color: COLORS.ink }}
            />
            <Button onClick={send} icon={Mail}>Send</Button>
          </div>
        </Card>

        <div className="flex items-center gap-2 justify-center">
          <Clock size={13} color={COLORS.gray} />
          <span className="text-[12.5px]" style={{ color: COLORS.gray, fontFamily: "'Inter', sans-serif" }}>
            Meaningful conversations begin with curiosity. There's no need to rush this.
          </span>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------
   8. MUTUAL UNLOCK
------------------------------------------------------------------------- */

function MutualUnlockPage() {
  const stagesInit = [
    { key: "voice-msg", label: "Voice Messages", icon: Mic, you: true, them: true },
    { key: "voice-call", label: "Voice Calls", icon: Phone, you: true, them: false },
    { key: "video-call", label: "Video Calls", icon: Video, you: false, them: false },
    { key: "social", label: "Share Social Media", icon: Share2, you: false, them: false },
    { key: "meet", label: "Meet in Person", icon: MapPin, you: false, them: false },
  ];
  const [stages, setStages] = useState(stagesInit);
  const toggleYou = (i) =>
    setStages((s) => s.map((st, idx) => (idx === i ? { ...st, you: !st.you } : st)));

  return (
    <div className="px-5 sm:px-6 md:px-10 py-16" style={{ background: COLORS.warmWhite }}>
      <div className="max-w-2xl mx-auto">
        <Eyebrow>Mutual Unlock</Eyebrow>
        <h1 className="text-[32px] mb-3" style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink, fontWeight: 500 }}>
          Trust unlocks together, or not at all.
        </h1>
        <p className="text-[15px] mb-12" style={{ color: "#6B6559" }}>
          Toggle your side below. Each stage only opens once both people have agreed, independently
          and without seeing the other's answer in advance.
        </p>

        <div className="relative">
          <div className="absolute left-[27px] top-2 bottom-2 w-px" style={{ background: "#E3DAC8" }} />
          <div className="flex flex-col gap-8">
            {stages.map((s, i) => {
              const unlocked = s.you && s.them;
              return (
                <div key={s.key} className="relative flex items-start gap-6">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 z-10"
                    style={{
                      background: unlocked ? COLORS.forest : "#fff",
                      border: unlocked ? "none" : "1.5px solid #E3DAC8",
                      boxShadow: unlocked ? "0 6px 16px rgba(47,74,60,0.3)" : "none",
                    }}
                  >
                    {unlocked ? <Unlock size={19} color="#fff" /> : <Lock size={17} color={COLORS.gray} />}
                  </div>
                  <Card className="flex-1 p-5">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <s.icon size={16} color={COLORS.brown} />
                        <h3 className="text-[16.5px]" style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink }}>{s.label}</h3>
                      </div>
                      <span
                        className="text-[11px] px-3 py-1 rounded-full"
                        style={{
                          background: unlocked ? "#E4EEE7" : COLORS.cream,
                          color: unlocked ? COLORS.forestDeep : COLORS.brown,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        {unlocked ? "Unlocked" : "Locked"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <button
                        onClick={() => toggleYou(i)}
                        className="flex items-center justify-between gap-1.5 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl transition-colors"
                        style={{ background: s.you ? "#E4EEE7" : COLORS.warmWhite, border: "1px solid " + (s.you ? "#BFD8C7" : "#EAE2D2") }}
                      >
                        <span className="text-[13px] sm:text-[13.5px]" style={{ fontFamily: "'Inter', sans-serif", color: COLORS.ink }}>You</span>
                        {s.you ? <Check size={15} className="shrink-0" color={COLORS.forest} /> : <span className="text-[10.5px] sm:text-[11.5px] text-right" style={{ color: COLORS.gray }}>Tap to agree</span>}
                      </button>
                      <div
                        className="flex items-center justify-between gap-1.5 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl"
                        style={{ background: s.them ? "#E4EEE7" : COLORS.warmWhite, border: "1px solid " + (s.them ? "#BFD8C7" : "#EAE2D2") }}
                      >
                        <span className="text-[13px] sm:text-[13.5px]" style={{ fontFamily: "'Inter', sans-serif", color: COLORS.ink }}>Them</span>
                        {s.them ? <Check size={15} className="shrink-0" color={COLORS.forest} /> : <span className="text-[10.5px] sm:text-[11.5px] text-right" style={{ color: COLORS.gray }}>Waiting</span>}
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------
   9. REFERENCES
------------------------------------------------------------------------- */

function ReferencesPage() {
  const refs = [
    { name: "Priya N.", relation: "Knew Sarah for six years", quote: "She remembers birthdays. She'll absolutely steal your fries. She's one of the kindest people I know.", tone: "forest" },
    { name: "Diego M.", relation: "College roommate, four years", quote: "She once drove two hours at midnight because I was having a rough week. That's just who she is.", tone: "brown" },
    { name: "Wren T.", relation: "Former coworker, two years", quote: "Direct, funny, and the first person on the team anyone went to with bad news.", tone: "gold" },
  ];
  return (
    <div className="px-5 sm:px-6 md:px-10 py-16" style={{ background: COLORS.warmWhite }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between flex-wrap gap-6 mb-12">
          <div>
            <Eyebrow>References</Eyebrow>
            <h1 className="text-[32px] mb-3" style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink, fontWeight: 500 }}>
              What people who know Sarah say.
            </h1>
            <p className="text-[15px] max-w-lg" style={{ color: "#6B6559" }}>
              References carry more weight than a self-written bio. Anyone can request them from people who know them well.
            </p>
          </div>
          <Button variant="secondary" icon={Plus}>Request a reference</Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {refs.map((r) => (
            <Card key={r.name} className="p-7 flex flex-col" stamped>
              <Quote size={20} color={COLORS.gold} className="mb-4" />
              <p className="text-[16px] leading-relaxed flex-1 mb-6" style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink, fontStyle: "italic" }}>
                "{r.quote}"
              </p>
              <div className="flex items-center gap-3 pt-5" style={{ borderTop: "1px solid #EFE8D9" }}>
                <Seal initials={r.name[0]} tone={r.tone} size={38} />
                <div>
                  <div className="text-[13.5px]" style={{ fontFamily: "'Inter', sans-serif", color: COLORS.ink }}>{r.name}</div>
                  <div className="text-[12px]" style={{ color: COLORS.gray }}>{r.relation}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------
   10. REPUTATION
------------------------------------------------------------------------- */

function ReputationPage() {
  const badges = [
    { label: "Thoughtful Writer", desc: "Consistently writes messages that show real reflection, not just reaction.", icon: PenLine, earned: true },
    { label: "Great Listener", desc: "Asks follow-up questions. Remembers what people share.", icon: Users, earned: true },
    { label: "Respectful Communicator", desc: "Handles disagreement and declines with care.", icon: ShieldCheck, earned: true },
    { label: "Keeps Commitments", desc: "Shows up for plans, and communicates early when they can't.", icon: Check, earned: false },
    { label: "Community Favorite", desc: "Recognized often across references and correspondence.", icon: Star, earned: false },
  ];
  return (
    <div className="px-5 sm:px-6 md:px-10 py-16" style={{ background: COLORS.warmWhite }}>
      <div className="max-w-4xl mx-auto">
        <Eyebrow>Reputation</Eyebrow>
        <h1 className="text-[32px] mb-3" style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink, fontWeight: 500 }}>
          Trust badges, not star ratings.
        </h1>
        <p className="text-[15px] mb-12 max-w-xl" style={{ color: "#6B6559" }}>
          Chapter One doesn't rank people with numbers. Instead, patterns in how someone writes,
          listens, and follows through earn them recognition that actually means something.
        </p>

        <div className="flex flex-col gap-4">
          {badges.map((b) => (
            <Card key={b.label} className="p-6 flex items-center gap-5" style={{ opacity: b.earned ? 1 : 0.55 }}>
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                style={{ background: b.earned ? COLORS.forest : COLORS.cream }}
              >
                <b.icon size={20} color={b.earned ? "#fff" : COLORS.gray} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-[17px]" style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink }}>{b.label}</h3>
                  {b.earned && (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full" style={{ background: "#E4EEE7", color: COLORS.forestDeep, fontFamily: "'JetBrains Mono', monospace" }}>
                      EARNED
                    </span>
                  )}
                </div>
                <p className="text-[14px] leading-relaxed" style={{ color: "#6B6559" }}>{b.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------
   APP ROOT
------------------------------------------------------------------------- */

export default function ChapterOneApp() {
  const [page, setPage] = useState("landing");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [page]);

  const darkNav = ["penpal", "unlock"].includes(page) === false && false; // reserved for future theming
  const pages = {
    landing: <LandingPage setPage={setPage} />,
    signup: <SignUpPage setPage={setPage} />,
    application: <ApplicationPage />,
    open: <OpenConnectionsPage setPage={setPage} />,
    browse: <BrowseConnectionsPage setPage={setPage} />,
    review: <ApplicationReviewPage />,
    penpal: <PenPalRoomPage />,
    unlock: <MutualUnlockPage />,
    references: <ReferencesPage />,
    reputation: <ReputationPage />,
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: COLORS.warmWhite }}>
      <NavBar page={page} setPage={setPage} />
      {pages[page]}
      <Footer setPage={setPage} />
    </div>
  );
}
