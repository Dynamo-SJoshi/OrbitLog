import React, { useState } from 'react';
import { 
  Info, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  BookOpen 
} from 'lucide-react';

export default function ISSInfoPanel() {
  const [activeTab, setActiveTab] = useState('parameters'); // 'parameters' | 'facts' | 'resources'

  const orbitalReferenceSpecs = [
    { label: 'Orbital Period', value: '~92.9 minutes', note: '15.54 orbits / Earth day' },
    { label: 'Orbital Inclination', value: '51.64°', note: 'Covers ~90% of Earth population' },
    { label: 'Nominal Altitude', value: '415 – 430 km', note: 'Low Earth Orbit (LEO)' },
    { label: 'Average Speed', value: '~27,600 km/h', note: '~7.66 km per second' },
    { label: 'Apogee / Perigee', value: '422 km / 418 km', note: 'Slightly elliptical orbit' },
    { label: 'Orbital Decay', value: '~2 km / month', note: 'Periodic reboosts by Progress/Cygnus' }
  ];

  const verifiedFacts = [
    {
      title: 'Continuous Human Presence',
      description: 'The ISS has been continuously inhabited by international crews since Expedition 1 arrived on November 2, 2000.'
    },
    {
      title: 'Massive Orbital Lab',
      description: 'Spanning 109 meters end-to-end (comparable to a football field) with a total mass of over 450 metric tons (450,000 kg).'
    },
    {
      title: '16 Sunrises Every 24 Hours',
      description: 'Traveling at 27,600 km/h, astronauts aboard witness a sunrise or sunset approximately every 45 minutes.'
    },
    {
      title: 'Solar Array Wingspan',
      description: 'Over 1 acre of solar arrays generate up to 120 kilowatts of usable electrical power for scientific laboratories.'
    }
  ];

  const educationalResources = [
    {
      name: 'NASA Spot the Station',
      desc: 'Calculate exact sighting times and elevation angles for your city.',
      url: 'https://spotthestation.nasa.gov/'
    },
    {
      name: 'ESA ISS Interactive 3D Tour',
      desc: 'Explore the European Space Agency Columbus laboratory and station modules.',
      url: 'https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/International_Space_Station'
    },
    {
      name: 'Heavens-Above',
      desc: 'Detailed satellite tracking passes, ground tracks, and sky charts.',
      url: 'https://www.heavens-above.com/'
    },
    {
      name: 'CelesTrak Orbital Ephemeris',
      desc: 'Raw Two-Line Element (TLE) sets and space situational awareness data.',
      url: 'https://celestrak.org/'
    }
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-5 shadow-xl">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Mission Specifications &amp; Science Reference
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                NORAD ID: 25544
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Curated by ASTRA &bull; Astronomy and Astrophysics Club, IIIT Surat
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center rounded-lg bg-slate-950/80 p-1 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('parameters')}
            className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
              activeTab === 'parameters'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Reference Values
          </button>
          <button
            onClick={() => setActiveTab('facts')}
            className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
              activeTab === 'facts'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Station Facts
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
              activeTab === 'resources'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Resources
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="pt-4">
        {/* 1. Reference Values Tab */}
        {activeTab === 'parameters' && (
          <div>
            <div className="mb-3 px-3 py-2 rounded-lg bg-sky-950/40 border border-sky-800/40 text-[11px] text-sky-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
              <span>
                <strong>Note for students:</strong> Values below are baseline orbital reference standards. Live telemetry on the cards above fluctuates continuously due to atmospheric drag, orbital perturbations, and station maneuvers.
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {orbitalReferenceSpecs.map((spec, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all"
                >
                  <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    {spec.label}
                  </div>
                  <div className="text-base sm:text-lg font-mono font-bold text-cyan-300 mt-0.5">
                    {spec.value}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {spec.note}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Facts Tab */}
        {activeTab === 'facts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {verifiedFacts.map((fact, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-2 text-cyan-300 font-semibold text-sm">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                  {fact.title}
                </div>
                <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                  {fact.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* 3. Resources Tab */}
        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {educationalResources.map((res, idx) => (
              <a
                key={idx}
                href={res.url}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900/80 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-200 group-hover:text-cyan-300">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                      {res.name}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 transition-colors" />
                  </div>
                  <p className="mt-1 text-xs text-slate-400 leading-normal">
                    {res.desc}
                  </p>
                </div>
                <div className="mt-2 text-[10px] text-cyan-400/80 font-mono">
                  Visit resource &rarr;
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
