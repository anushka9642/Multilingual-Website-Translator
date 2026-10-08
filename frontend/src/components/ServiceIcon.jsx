import React from "react";
import {
  Fingerprint,
  Landmark,
  KeyRound,
  ShieldCheck,
  Heart,
  ScrollText,
  Receipt,
  GraduationCap,
  FileSignature,
  MonitorCheck,
  BadgeCheck,
} from "lucide-react";

const ICONS = {
  Fingerprint,
  Landmark,
  KeyRound,
  ShieldCheck,
  Heart,
  ScrollText,
  Receipt,
  GraduationCap,
  FileSignature,
  MonitorCheck,
  BadgeCheck,
};

export default function ServiceIcon({ name, size = 19 }) {
  const Icon = ICONS[name] || ShieldCheck;
  return <Icon size={size} />;
}
