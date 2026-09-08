"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BellRing,
  CheckCircle2,
  ChevronRight,
  Crosshair,
  MapPinned,
  ShieldCheck,
  Users,
} from "lucide-react";

type Priority = "CRITICAL" | "HIGH" | "MEDIUM";
type IncidentStatus = "New" | "Under Review" | "Team Assigned" | "In Progress" | "Resolved";
type IncidentType =
  | "Rescue Required"
  | "Medical Assistance"
  | "Missing Persons"
  | "Evacuation"
  | "Infrastructure Damage"
  | "Supply Request"
  | "Volunteer / Relief Activity"
  | "Safety Alert";

type Incident = {
  id: string;
  report: string;
  language: string;
  location: string;
  type: IncidentType;
  priority: Priority;
  status: IncidentStatus;
  time: string;
  recommendedAction: string;
  summary: string;
  team?: string;
};

type Team = {
  id: string;
  name: string;
  type: string;
  status: "AVAILABLE" | "EN ROUTE" | "BUSY";
  location: string;
};

const TEAM_OPTIONS: Team[] = [
  { id: "team-01", name: "Rescue Unit 04", type: "Rescue", status: "AVAILABLE", location: "Andheri" },
  { id: "team-02", name: "Fire & Rescue Team 12", type: "Fire Response", status: "EN ROUTE", location: "Dadar" },
  { id: "team-03", name: "Medical Response Team 03", type: "Medical", status: "AVAILABLE", location: "Shivaji Nagar" },
  { id: "team-04", name: "Field Assessment Unit 07", type: "Assessment", status: "BUSY", location: "Kurla" },
  { id: "team-05", name: "Shelter Operations Team 09", type: "Relief", status: "AVAILABLE", location: "Bandra" },
];

const INITIAL_INCIDENTS: Incident[] = [
  {
    id: "DR-001",
    report: "अंधेरी में लोग फंसे हुए हैं, कृपया मदद भेजिए",
    language: "Hindi",
    location: "Andheri",
    type: "Rescue Required",
    priority: "CRITICAL",
    status: "New",
    time: "2 min ago",
    summary: "People trapped and requesting rescue",
    recommendedAction: "Dispatch rescue team to assess and assist people reportedly trapped in the area.",
  },
  {
    id: "DR-002",
    report: "Bridge has collapsed near the station. Several people may be trapped.",
    language: "English",
    location: "Dadar",
    type: "Infrastructure Damage",
    priority: "CRITICAL",
    status: "Under Review",
    time: "4 min ago",
    summary: "Possible people trapped near collapsed bridge",
    recommendedAction: "Send engineering and rescue teams to secure the site and evacuate nearby residents.",
  },
  {
    id: "DR-003",
    report: "माझ्या परिसरात पाणी खूप वाढलं आहे, लोकांना सुरक्षित ठिकाणी हलवा",
    language: "Marathi",
    location: "Kurla",
    type: "Evacuation",
    priority: "HIGH",
    status: "Team Assigned",
    time: "6 min ago",
    summary: "Flooding reported — evacuation required",
    recommendedAction: "Coordinate immediate evacuation support and shelter preparation for affected residents.",
    team: "Rescue Unit 04",
  },
  {
    id: "DR-004",
    report: "আমাদের এলাকায় কয়েকজন মানুষ নিখোঁজ",
    language: "Bengali",
    location: "Bandra",
    type: "Missing Persons",
    priority: "CRITICAL",
    status: "New",
    time: "8 min ago",
    summary: "Multiple missing-person reports in the area",
    recommendedAction: "Launch a missing-person verification and neighborhood search to locate reported individuals.",
  },
  {
    id: "DR-005",
    report: "Volunteers are distributing food and water near the shelter.",
    language: "English",
    location: "Colaba",
    type: "Volunteer / Relief Activity",
    priority: "MEDIUM",
    status: "Under Review",
    time: "11 min ago",
    summary: "Relief activity active at local shelter",
    recommendedAction: "Coordinate aid distribution and monitor shelter capacity to support incoming displaced residents.",
  },
  {
    id: "DR-006",
    report: "शिवाजी नगर में दवाइयों और मेडिकल सहायता की तुरंत जरूरत है",
    language: "Hindi",
    location: "Shivaji Nagar",
    type: "Medical Assistance",
    priority: "CRITICAL",
    status: "New",
    time: "13 min ago",
    summary: "Medical assistance requested",
    recommendedAction: "Dispatch medical response team and triage support to the area.",
  },
  {
    id: "DR-007",
    report: "Strong winds are expected tonight. Residents should stay indoors.",
    language: "English",
    location: "Sion",
    type: "Safety Alert",
    priority: "HIGH",
    status: "In Progress",
    time: "17 min ago",
    summary: "Public safety alert issued for unstable conditions",
    recommendedAction: "Issue public warning and monitor vulnerable neighborhoods for wind damage risks.",
  },
  {
    id: "DR-008",
    report: "কিছু পরিবারকে নিরাপদ আশ্রয়ে সরিয়ে নেওয়া হয়েছে",
    language: "Bengali",
    location: "Chembur",
    type: "Evacuation",
    priority: "HIGH",
    status: "Resolved",
    time: "20 min ago",
    summary: "Families relocated to safe shelters",
    recommendedAction: "Continue shelter tracking and support services for displaced households.",
    team: "Shelter Operations Team 09",
  },
  {
    id: "DR-009",
    report: "Water has reached the low-lying homes near the railway line.",
    language: "English",
    location: "Byculla",
    type: "Infrastructure Damage",
    priority: "MEDIUM",
    status: "New",
    time: "26 min ago",
    summary: "Water level rising near low-lying homes",
    recommendedAction: "Activate drainage support and field inspection for affected residential blocks.",
  },
  {
    id: "DR-010",
    report: "मृत्यु की खबरें सामने आई हैं, परिवारों को सहारा देने की जरूरत है",
    language: "Hindi",
    location: "Vikhroli",
    type: "Medical Assistance",
    priority: "CRITICAL",
    status: "Under Review",
    time: "31 min ago",
    summary: "Casualty support required",
    recommendedAction: "Coordinate casualty support, welfare teams, and emergency family outreach.",
  },
  {
    id: "DR-011",
    report: "अनेक लोग रातभर बिछुड़े परिवारों के साथ मदद मांग रहे हैं",
    language: "Hindi",
    location: "Ghatkopar",
    type: "Missing Persons",
    priority: "HIGH",
    status: "Team Assigned",
    time: "38 min ago",
    summary: "Separated families seeking assistance",
    recommendedAction: "Verify family reunification records and coordinate reunion support workers.",
    team: "Field Assessment Unit 07",
  },
  {
    id: "DR-012",
    report: "People are offering food, medicine and blankets at the relief point.",
    language: "English",
    location: "Powai",
    type: "Supply Request",
    priority: "MEDIUM",
    status: "Resolved",
    time: "42 min ago",
    summary: "Community donation drive continues at relief point",
    recommendedAction: "Maintain resource tracking and coordinate volunteer support for ongoing distribution.",
  },
];

const STATUS_OPTIONS = ["All", "New", "Under Review", "Team Assigned", "In Progress", "Resolved"] as const;
const TYPE_OPTIONS = [
  "All",
  "Rescue Required",
  "Medical Assistance",
  "Missing Persons",
  "Evacuation",
  "Infrastructure Damage",
  "Supply Request",
  "Volunteer / Relief Activity",
  "Safety Alert",
] as const;
const PRIORITY_OPTIONS = ["All", "CRITICAL", "HIGH", "MEDIUM"] as const;
const LOCATION_OPTIONS = ["All", "Andheri", "Bandra", "Dadar", "Kurla", "Shivaji Nagar", "Powai", "Colaba"] as const;

const TAB_ITEMS = ["Overview", "Incidents", "Response Teams", "Map"] as const;
const SECTION_MAP = {
  Overview: "overview",
  Incidents: "incidents",
  "Response Teams": "response-teams",
  Map: "map",
} as const;

const priorityTheme: Record<Priority, string> = {
  CRITICAL: "bg-[#f4d9d9] text-[#1a0c0c] border border-[#f1a1a1]",
  HIGH: "bg-[#f5ebd8] text-[#1d1205] border border-[#e2c57b]",
  MEDIUM: "bg-[#dfe4ea] text-[#171b20] border border-[#b7c0ca]",
};

const statusTheme: Record<IncidentStatus, string> = {
  New: "bg-[#191919] text-[#f4f4f4] border border-[#2f2f2f]",
  "Under Review": "bg-[#181b22] text-[#dfeafc] border border-[#4f688d]",
  "Team Assigned": "bg-[#18221b] text-[#dff7e6] border border-[#4a8b66]",
  "In Progress": "bg-[#21201d] text-[#f6ead3] border border-[#b79152]",
  Resolved: "bg-[#171717] text-[#f5f5f5] border border-[#3d3d3d]",
};

const activitySeed = [
  { time: "12:47 PM", note: "Rescue Unit 04 assigned to Incident DR-003" },
  { time: "12:45 PM", note: "New critical rescue report received in Andheri" },
  { time: "12:43 PM", note: "Incident DR-002 moved to Under Review" },
  { time: "12:41 PM", note: "Medical assistance request received in Shivaji Nagar" },
];

function getCurrentTimeStamp() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function createLiveIncident(): Incident {
  const templates: Incident[] = [
    {
      id: "DR-013",
      report: "अंधेरी के पास जलभराव के कारण कई लोग फंसे हैं।",
      language: "Hindi",
      location: "Andheri",
      type: "Rescue Required",
      priority: "CRITICAL",
      status: "New",
      time: "Just now",
      summary: "Critical rescue request in flooded zone",
      recommendedAction: "Deploy rescue teams and emergency support to the reported location immediately.",
    },
    {
      id: "DR-014",
      report: "Medical supplies needed at the relief camp near Bandra.",
      language: "English",
      location: "Bandra",
      type: "Supply Request",
      priority: "HIGH",
      status: "New",
      time: "Just now",
      summary: "Supply request reported at relief camp",
      recommendedAction: "Coordinate material delivery and support logistics to the relief camp.",
    },
    {
      id: "DR-015",
      report: "माझ्या भागात पाणी वाढतेय, लोकांना सुरक्षित स्थळी पाठवा.",
      language: "Marathi",
      location: "Kurla",
      type: "Evacuation",
      priority: "HIGH",
      status: "New",
      time: "Just now",
      summary: "Residents request evacuation support",
      recommendedAction: "Initiate evacuation planning and route teams toward the affected neighborhood.",
    },
  ];

  const template = templates[Math.floor(Math.random() * templates.length)];
  return {
    ...template,
    id: `DR-${Math.max(13, Math.floor(Math.random() * 100) + 13)}`,
  };
}

export default function ResponseCenterPage() {
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(INITIAL_INCIDENTS[0].id);
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_OPTIONS)[number]>("All");
  const [typeFilter, setTypeFilter] = useState<(typeof TYPE_OPTIONS)[number]>("All");
  const [priorityFilter, setPriorityFilter] = useState<(typeof PRIORITY_OPTIONS)[number]>("All");
  const [locationFilter, setLocationFilter] = useState<(typeof LOCATION_OPTIONS)[number]>("All");
  const [activeTab, setActiveTab] = useState<(typeof TAB_ITEMS)[number]>("Overview");
  const [selectedTeamId, setSelectedTeamId] = useState<string>(TEAM_OPTIONS[0].id);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [activityLog, setActivityLog] = useState(activitySeed);

  const handleSectionNav = (tab: (typeof TAB_ITEMS)[number]) => {
    setActiveTab(tab);
    const sectionId = SECTION_MAP[tab];
    const node = document.getElementById(sectionId);
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    if (!isRunning) return;

    const timer = setTimeout(() => {
      const newIncident = createLiveIncident();
      setIncidents((current) => [newIncident, ...current]);
      setSelectedIncidentId(newIncident.id);
      setIsDetailOpen(true);
      setActivityLog((current) => [
        { time: getCurrentTimeStamp(), note: `New ${newIncident.priority.toLowerCase()} ${newIncident.type.toLowerCase()} report received in ${newIncident.location}` },
        ...current,
      ].slice(0, 5));
      setIsRunning(false);
    }, 1400);

    return () => clearTimeout(timer);
  }, [isRunning]);

  const sortedIncidents = useMemo(
    () => [...incidents].sort((a, b) => {
      const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 };
      return order[a.priority] - order[b.priority];
    }),
    [incidents],
  );

  const filteredIncidents = useMemo(() => {
    return sortedIncidents.filter((incident) => {
      const matchesStatus = statusFilter === "All" || incident.status === statusFilter;
      const matchesType = typeFilter === "All" || incident.type === typeFilter;
      const matchesPriority = priorityFilter === "All" || incident.priority === priorityFilter;
      const matchesLocation = locationFilter === "All" || incident.location === locationFilter;
      return matchesStatus && matchesType && matchesPriority && matchesLocation;
    });
  }, [sortedIncidents, statusFilter, typeFilter, priorityFilter, locationFilter]);

  const selectedIncident =
    filteredIncidents.find((incident) => incident.id === selectedIncidentId) ?? incidents.find((incident) => incident.id === selectedIncidentId) ?? incidents[0];

  const kpis = useMemo(() => {
    const criticalCount = incidents.filter((incident) => incident.priority === "CRITICAL").length;
    const rescueCount = incidents.filter((incident) => incident.type === "Rescue Required").length;
    const missingCount = incidents.filter((incident) => incident.type === "Missing Persons").length;
    const awaitingResponse = incidents.filter((incident) => incident.status === "New" || incident.status === "Under Review").length;

    return {
      active: incidents.length,
      critical: criticalCount,
      rescue: rescueCount,
      missing: missingCount,
      awaiting: awaitingResponse,
    };
  }, [incidents]);

  const updateIncidentStatus = (incidentId: string, nextStatus: IncidentStatus) => {
    setIncidents((current) =>
      current.map((incident) => {
        if (incident.id === incidentId) {
          return { ...incident, status: nextStatus };
        }
        return incident;
      }),
    );
    setActivityLog((current) => [
      { time: getCurrentTimeStamp(), note: `Incident ${incidentId} moved to ${nextStatus}` },
      ...current,
    ].slice(0, 5));
  };

  const assignTeamToIncident = () => {
    const selectedTeam = TEAM_OPTIONS.find((team) => team.id === selectedTeamId);
    if (!selectedTeam || !selectedIncident) return;

    setIncidents((current) =>
      current.map((incident) => {
        if (incident.id === selectedIncident.id) {
          return { ...incident, status: "Team Assigned", team: selectedTeam.name };
        }
        return incident;
      }),
    );
    setSelectedIncidentId(selectedIncident.id);
    setIsTeamModalOpen(false);
    setActivityLog((current) => [
      { time: getCurrentTimeStamp(), note: `${selectedTeam.name} assigned to ${selectedIncident.id}` },
      ...current,
    ].slice(0, 5));
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[#262d33] bg-[#07090b]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#f3f3f3] shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b7bec5]">Emergency Operations Center</div>
              <div className="mt-1 text-lg font-semibold text-white">Disaster Response Command Center</div>
            </div>
          </div>

          <nav className="hidden items-center gap-4 md:flex">
            {TAB_ITEMS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => handleSectionNav(tab)}
                className={[
                  "border-b border-transparent px-2 py-1 text-[11px] font-medium uppercase tracking-[0.18em] transition-colors",
                  activeTab === tab ? "border-white text-white" : "text-[#9aa5ad] hover:text-white",
                ].join(" ")}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3 rounded-full border border-[#2d373d] bg-[#11171b] px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-[#dfe6eb]">
            <span className="inline-flex h-2 w-2 rounded-full bg-[#7ef8b2]" />
            Simulation Mode
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section id="overview" className="scroll-mt-24 rounded-[28px] border border-[#2a333a] bg-[#0d1115] p-5 shadow-[0_12px_60px_rgba(0,0,0,0.28)] sm:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#2c363d] bg-[#11191d] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[#dfe8ee]">
                <span className="h-2 w-2 rounded-full bg-[#7ef8b2]" />
                SIMULATION ACTIVE
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Disaster Response Command Center
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-[#b4bec7] sm:text-base">
                Real-time situational awareness for emergency response teams
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsRunning(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#f3f3f3] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0a0a0a] transition hover:bg-[#dde4ea]"
              >
                <BellRing className="h-4 w-4" />
                Start Live Simulation
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-[#2c363d] bg-[#10171b] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#edf5fb] transition hover:border-[#3c4b55]"
              >
                Overview
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Active Incidents", value: kpis.active, icon: <Activity className="h-5 w-5" /> },
            { label: "Critical", value: kpis.critical, icon: <AlertTriangle className="h-5 w-5" /> },
            { label: "Rescue Requests", value: kpis.rescue, icon: <ShieldCheck className="h-5 w-5" /> },
            { label: "Missing Persons", value: kpis.missing, icon: <Users className="h-5 w-5" /> },
            { label: "Awaiting Response", value: kpis.awaiting, icon: <Crosshair className="h-5 w-5" /> },
          ].map((item) => (
            <div key={item.label} className="rounded-[22px] border border-[#2c363d] bg-[#0e1419] p-4">
              <div className="flex items-center justify-between text-[#a9b5bf]">
                <span className="text-[10px] uppercase tracking-[0.16em]">{item.label}</span>
                <span className="text-[#f2f7fb]">{item.icon}</span>
              </div>
              <div className="mt-6 text-3xl font-semibold text-white">{item.value}</div>
            </div>
          ))}
        </section>

        <section id="incidents" className="scroll-mt-24 mt-8 grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
          <div className="rounded-[28px] border border-[#2c363d] bg-[#0e1419] p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-[#99a6b1]">Incoming reports</div>
                <h2 className="mt-2 text-2xl font-semibold text-white">Live Incident Reports</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsRunning(true)}
                className="inline-flex items-center justify-center rounded-xl border border-[#37454d] bg-[#101a20] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#edf5fb] transition hover:border-[#4b5d68]"
              >
                Refresh Feed
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {filteredIncidents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#364349] bg-[#0c1318] p-10 text-center text-sm text-[#a9b8c1]">
                  No incidents match the current filters.
                </div>
              ) : (
                filteredIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className={[
                      "rounded-[22px] border p-4 transition-all hover:border-[#5a6976]",
                      incident.id === selectedIncident.id ? "border-[#4d5e69] bg-[#131b22]" : "border-[#2b343b] bg-[#10181d]",
                    ].join(" ")}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex rounded-full px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] ${priorityTheme[incident.priority]}`}>
                          {incident.priority}
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.18em] text-[#97a7b2]">{incident.id}</span>
                      </div>
                      <span className={`inline-flex rounded-full px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] ${statusTheme[incident.status]}`}>
                        {incident.status}
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="text-lg font-semibold text-white">{incident.summary}</div>
                      <p className="text-[15px] leading-relaxed text-[#dfe8ee]">“{incident.report}”</p>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div>
                        <div className="text-[9px] uppercase tracking-[0.18em] text-[#8e9aa4]">Type</div>
                        <div className="mt-1 text-sm font-medium text-[#f4f8fb]">{incident.type}</div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase tracking-[0.18em] text-[#8e9aa4]">Location</div>
                        <div className="mt-1 text-sm font-medium text-[#f4f8fb]">{incident.location}</div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase tracking-[0.18em] text-[#8e9aa4]">Reported</div>
                        <div className="mt-1 text-sm font-medium text-[#f4f8fb]">{incident.time}</div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#2a333b] pt-3">
                      <div className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.18em] text-[#a4b1b9]">
                        <span>Language: {incident.language}</span>
                        <span>Assigned to: {incident.team ?? "Unassigned"}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedIncidentId(incident.id);
                          setIsDetailOpen(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#3a4952] bg-[#151f25] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f6fbff] transition hover:border-[#5b6d78]"
                      >
                        View Incident
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-[#2c363d] bg-[#0e1419] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-[#98a7b1]">Operations view</div>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Incident Details</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDetailOpen((current) => !current)}
                  className="rounded-full border border-[#36424a] bg-[#111a1e] px-2 py-1 text-[9px] uppercase tracking-[0.18em] text-[#dfeaf3]"
                >
                  {isDetailOpen ? "Hide" : "Open"}
                </button>
              </div>

              {isDetailOpen && (
                <div className="mt-5 space-y-4 text-sm text-[#dfe8ee]">
                  <div className="rounded-2xl border border-[#2a343b] bg-[#10181d] p-3">
                    <div className="text-[9px] uppercase tracking-[0.18em] text-[#7d8a94]">Incident ID</div>
                    <div className="mt-2 text-xl font-semibold text-white">{selectedIncident.id}</div>
                  </div>

                  <div>
                    <div className="text-[9px] uppercase tracking-[0.18em] text-[#7d8a94]">Report</div>
                    <p className="mt-2 text-[15px] leading-relaxed text-[#f2f7fb]">“{selectedIncident.report}”</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.18em] text-[#7d8a94]">Incident Type</div>
                      <div className="mt-2 text-[#f2f7fb]">{selectedIncident.type}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.18em] text-[#7d8a94]">Priority</div>
                      <div className="mt-2 text-[#f2f7fb]">{selectedIncident.priority}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.18em] text-[#7d8a94]">Location</div>
                      <div className="mt-2 text-[#f2f7fb]">{selectedIncident.location}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.18em] text-[#7d8a94]">Reported</div>
                      <div className="mt-2 text-[#f2f7fb]">{selectedIncident.time}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] uppercase tracking-[0.18em] text-[#7d8a94]">Current Status</div>
                    <div className="mt-2 inline-flex rounded-full border border-[#2d373d] bg-[#111a1e] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f2f7fb]">
                      {selectedIncident.status}
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] uppercase tracking-[0.18em] text-[#7d8a94]">Assigned Team</div>
                    <div className="mt-2 text-[#f2f7fb]">{selectedIncident.team ?? "Unassigned"}</div>
                  </div>

                  <div>
                    <div className="text-[9px] uppercase tracking-[0.18em] text-[#7d8a94]">Recommended Response</div>
                    <p className="mt-2 leading-relaxed text-[#f2f7fb]">{selectedIncident.recommendedAction}</p>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsTeamModalOpen(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#f3f3f3] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0a0a0a] transition hover:bg-[#dfe5eb]"
                    >
                      Assign Response Team
                    </button>
                    <button
                      type="button"
                      onClick={() => updateIncidentStatus(selectedIncident.id, "Resolved")}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#3a4952] bg-[#111a1e] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#edf5fb] transition hover:border-[#556d7c]"
                    >
                      Mark As Resolved
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-[28px] border border-[#2c363d] bg-[#0e1419] p-5">
              <div className="flex items-center gap-2 text-white">
                <AlertTriangle className="h-4 w-4 text-[#f5ccb8]" />
                <h3 className="text-xl font-semibold">Recent Activity</h3>
              </div>

              <div className="mt-4 space-y-3">
                {activityLog.map((activity) => (
                  <div key={`${activity.time}-${activity.note}`} className="rounded-2xl border border-[#2a343b] bg-[#111b22] p-3">
                    <div className="text-[9px] uppercase tracking-[0.18em] text-[#8a98a4]">{activity.time}</div>
                    <div className="mt-2 text-sm text-[#edf5fb]">{activity.note}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-[#2c363d] bg-[#0e1419] p-5">
            <div className="flex items-center gap-2 text-white">
              <Crosshair className="h-4 w-4" />
              <h3 className="text-2xl font-semibold">Filters</h3>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
              <div>
                <div className="text-[9px] uppercase tracking-[0.18em] text-[#8a98a4]">Status</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setStatusFilter(option)}
                      className={[
                        "rounded-full border px-2.5 py-1.5 text-[9px] uppercase tracking-[0.16em] transition-colors",
                        statusFilter === option ? "border-white bg-white text-[#0b0f12]" : "border-[#36454d] bg-[#121b20] text-[#dfe8ee]",
                      ].join(" ")}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[9px] uppercase tracking-[0.18em] text-[#8a98a4]">Type</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TYPE_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setTypeFilter(option)}
                      className={[
                        "rounded-full border px-2.5 py-1.5 text-[9px] uppercase tracking-[0.16em] transition-colors",
                        typeFilter === option ? "border-white bg-white text-[#0b0f12]" : "border-[#36454d] bg-[#121b20] text-[#dfe8ee]",
                      ].join(" ")}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[9px] uppercase tracking-[0.18em] text-[#8a98a4]">Priority</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PRIORITY_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setPriorityFilter(option)}
                      className={[
                        "rounded-full border px-2.5 py-1.5 text-[9px] uppercase tracking-[0.16em] transition-colors",
                        priorityFilter === option ? "border-white bg-white text-[#0b0f12]" : "border-[#36454d] bg-[#121b20] text-[#dfe8ee]",
                      ].join(" ")}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[9px] uppercase tracking-[0.18em] text-[#8a98a4]">Location</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {LOCATION_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setLocationFilter(option)}
                      className={[
                        "rounded-full border px-2.5 py-1.5 text-[9px] uppercase tracking-[0.16em] transition-colors",
                        locationFilter === option ? "border-white bg-white text-[#0b0f12]" : "border-[#36454d] bg-[#121b20] text-[#dfe8ee]",
                      ].join(" ")}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#2c363d] bg-[#0e1419] p-5">
            <div className="text-[10px] uppercase tracking-[0.18em] text-[#97a6af]">Priority Response Queue</div>
            <h3 className="mt-2 text-2xl font-semibold text-white">Operations Queue</h3>

            <div className="mt-5 space-y-3">
              {sortedIncidents.slice(0, 4).map((incident, index) => (
                <div key={incident.id} className="rounded-2xl border border-[#2a343b] bg-[#111b22] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-[#9baab3]">{String(index + 1).padStart(2, "0")}</div>
                    <span className={`inline-flex rounded-full px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] ${priorityTheme[incident.priority]}`}>
                      {incident.priority}
                    </span>
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white">{incident.summary}</div>
                  <div className="mt-2 text-sm text-[#dfe8ee]">{incident.location}</div>
                  <div className="mt-3 text-[11px] uppercase tracking-[0.16em] text-[#9aa9b5]">Recommended action: {incident.recommendedAction}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="map" className="scroll-mt-24 mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-[#2c363d] bg-[#0e1419] p-5">
            <div className="flex items-center gap-2 text-white">
              <MapPinned className="h-4 w-4" />
              <h3 className="text-2xl font-semibold">Incident Map</h3>
            </div>

            <div className="relative mt-5 h-[320px] overflow-hidden rounded-[24px] border border-[#2a333b] bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1),_rgba(0,0,0,0)_60%)]">
              <div className="absolute inset-x-0 top-1/2 h-px bg-[#2a343b] -translate-y-1/2" />
              <div className="absolute inset-y-0 left-1/2 w-px bg-[#2a343b] -translate-x-1/2" />

              {[
                { name: "Andheri", x: 24, y: 30, priority: "CRITICAL" },
                { name: "Bandra", x: 64, y: 22, priority: "CRITICAL" },
                { name: "Dadar", x: 52, y: 48, priority: "CRITICAL" },
                { name: "Kurla", x: 74, y: 63, priority: "HIGH" },
                { name: "Shivaji Nagar", x: 40, y: 70, priority: "CRITICAL" },
                { name: "Colaba", x: 30, y: 80, priority: "MEDIUM" },
                { name: "Powai", x: 58, y: 85, priority: "MEDIUM" },
              ].map((pin) => (
                <button
                  key={pin.name}
                  type="button"
                  onClick={() => {
                    const match = incidents.find((incident) => incident.location === pin.name);
                    if (match) setSelectedIncidentId(match.id);
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#dfe8ee]">{pin.name}</span>
                    <span
                      className={[
                        "block h-4 w-4 rounded-full border border-white/60 shadow-[0_0_18px_rgba(255,255,255,0.35)]",
                        pin.priority === "CRITICAL" ? "bg-[#ef5d5d]" : pin.priority === "HIGH" ? "bg-[#f0bf67]" : "bg-[#dfe4ea]",
                      ].join(" ")}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div id="response-teams" className="scroll-mt-24 rounded-[28px] border border-[#2c363d] bg-[#0e1419] p-5">
            <div className="text-[10px] uppercase tracking-[0.18em] text-[#97a6af]">Response teams</div>
            <h3 className="mt-2 text-2xl font-semibold text-white">Available Teams</h3>

            <div className="mt-5 space-y-3">
              {TEAM_OPTIONS.map((team) => (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => setSelectedTeamId(team.id)}
                  className={[
                    "w-full rounded-2xl border p-3 text-left transition-colors",
                    selectedTeamId === team.id ? "border-[#5e6e79] bg-[#121b22]" : "border-[#2b343b] bg-[#10181d]",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-white">{team.name}</div>
                      <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#9aa9b5]">{team.type}</div>
                    </div>
                    <span className="rounded-full border border-[#36454d] bg-[#0c1217] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#eef5fa]">
                      {team.status}
                    </span>
                  </div>
                  <div className="mt-3 text-sm text-[#dfe8ee]">Current location: {team.location}</div>
                </button>
              ))}
            </div>
          </div>
        </section>

       
      </main>

      {isTeamModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#04070a]/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[24px] border border-[#303d46] bg-[#0e1419] p-5 shadow-[0_20px_90px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-[#9aa9b5]">Assign response team</div>
                <h3 className="mt-2 text-2xl font-semibold text-white">{selectedIncident.summary}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTeamModalOpen(false)}
                className="rounded-full border border-[#36454d] bg-[#111a1e] px-2 py-1 text-[9px] uppercase tracking-[0.18em] text-[#edf5fb]"
              >
                Close
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {TEAM_OPTIONS.map((team) => (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => setSelectedTeamId(team.id)}
                  className={[
                    "w-full rounded-2xl border p-3 text-left transition-colors",
                    selectedTeamId === team.id ? "border-[#5a6d79] bg-[#121d23]" : "border-[#2a343b] bg-[#10181d]",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-white">{team.name}</div>
                      <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#9aa9b5]">{team.type}</div>
                    </div>
                    <span className="rounded-full border border-[#38505b] bg-[#0b1419] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#edf5fb]">
                      {team.status}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-[#dfe8ee]">Location: {team.location}</div>
                </button>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsTeamModalOpen(false)}
                className="rounded-xl border border-[#36454d] bg-[#111a1e] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#edf5fb]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={assignTeamToIncident}
                className="rounded-xl bg-[#f3f3f3] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0a0a0a]"
              >
                Assign Team
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
