import { useSyncExternalStore } from "react";

export type Role = "employee" | "compliance_officer" | "manager";

export type Persona = {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  jobTitle: string;
  avatarColor: string;
  initials: string;
};

export const PERSONAS: Persona[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Arjun Singh",
    email: "arjun@test.com",
    role: "employee",
    department: "Operations",
    jobTitle: "Reference Data Analyst",
    avatarColor: "bg-emerald-500",
    initials: "AS",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Jacob Gertel",
    email: "jacob@test.com",
    role: "compliance_officer",
    department: "Compliance",
    jobTitle: "Data & Compliance Officer",
    avatarColor: "bg-indigo-500",
    initials: "JG",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "David Brupbacher",
    email: "david@test.com",
    role: "manager",
    department: "Executive",
    jobTitle: "Chief Knowledge Officer",
    avatarColor: "bg-amber-500",
    initials: "DB",
  },
];

const STORAGE_KEY = "six-sense:persona-id";
const EVENT = "six-sense:persona-change";

const isBrowser = typeof window !== "undefined";

function readId(): string | null {
  if (!isBrowser) return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getCurrentPersona(): Persona | null {
  const id = readId();
  if (!id) return null;
  return PERSONAS.find((p) => p.id === id) ?? null;
}

export function setCurrentPersona(id: string | null) {
  if (!isBrowser) return;
  if (id) localStorage.setItem(STORAGE_KEY, id);
  else localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  if (!isBrowser) return () => {};
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useCurrentPersona(): Persona | null {
  return useSyncExternalStore(
    subscribe,
    () => getCurrentPersona(),
    () => null,
  );
}

export const ROLE_LABEL: Record<Role, string> = {
  employee: "Employee",
  compliance_officer: "Data & Compliance Officer",
  manager: "C-Level / Management",
};
