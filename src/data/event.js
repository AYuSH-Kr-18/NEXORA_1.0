// ============================================================================
//  TECHNOGAMING — the ONE file to edit.
//  Every name, date, venue, fee, prize, rule and contact on the site comes
//  from here. Values marked TODO are placeholders: replace before going live.
// ============================================================================

export const fest = {
  name: 'TECHNOGAMING',
  year: '2027',
  edition: 'Sunset Edition',            // script accent under the title
  organiser: 'RAIoT Club',               // TODO: your club / department name
  college: 'Your University Name',       // TODO
  tagline: 'Two days. Eight missions. One city of gamers and builders.',
  // ISO times with timezone so the countdown is correct everywhere
  startsAt: '2027-02-19T09:00:00+05:30', // TODO
  endsAt: '2027-02-20T20:00:00+05:30',   // TODO
  dateLabel: '19 – 20 FEB 2027',
  registrationClosesAt: '2027-02-15T23:59:00+05:30', // TODO
  prizePoolLabel: '₹2,00,000',
  about: [
    'Technogaming is the university\'s two-day fest where esports squads and hardware hackers share one map.',
    'Pick a mission, build your crew, and play it out on campus. Cash prizes, certificates, and bragging rights for every winner.',
  ],
  heroInfo: [
    { k: 'Dates', v: '19 – 20 FEB 2027' },
    { k: 'Venue', v: 'Main Campus' },
    { k: 'Prize pool', v: '₹2,00,000' },
    { k: 'Missions', v: '8 events' },
  ],
}

// Payment details. Frontend only builds a UPI link and QR from these.
export const payment = {
  vpa: 'yourclub@upi',          // TODO: real UPI ID of the club/treasurer
  payeeName: 'RAIoT Club',      // TODO: name exactly as on the UPI account
  notePrefix: 'TG27',           // added to the UPI note with the registration id
  verifyNote: 'Organisers verify every payment manually within 24 hours. Your pass becomes ACTIVE after verification.',
  helpPhone: '+91 90000 00000', // TODO
}

// category: 'gaming' | 'tech'
// fee is per team (or per player for solo events), in rupees
// wanted = difficulty 1-5 (shown as wanted stars)
export const events = [
  {
    id: 'bgmi',
    name: 'BGMI Squad Showdown',
    codename: 'Drop Zone',
    category: 'gaming',
    wanted: 4,
    teamMin: 4, teamMax: 5,
    fee: 400,
    prizes: [16000, 9000, 5000],
    day: 1, time: '10:00 – 17:00', venue: 'lab-block',
    blurb: 'Squads of four drop in, loot up and fight for the last circle across six matches.',
    rules: [
      'Squad of 4 players plus 1 optional substitute.',
      'Bring your own phone and earphones. Tablets and emulators are not allowed.',
      'Points table: placement points plus 1 point per finish.',
      'Report 30 minutes before your slot with college ID.',
    ],
    contact: { name: 'Event head', phone: '+91 90000 00001' },
  },
  {
    id: 'valorant',
    name: 'Valorant 5v5 Cup',
    codename: 'Spike Run',
    category: 'gaming',
    wanted: 5,
    teamMin: 5, teamMax: 6,
    fee: 500,
    prizes: [22000, 11000, 6000],
    day: 1, time: '09:30 – 20:00', venue: 'esports-arena',
    blurb: 'Single elimination, best of one until the semis, best of three for the final.',
    rules: [
      'Teams of 5 plus 1 optional substitute.',
      'Lab PCs provided. Bring your own mouse, keyboard and headset if you like.',
      'Tournament mode, standard competitive map pool.',
      'Any cheating or account sharing means instant disqualification.',
    ],
    contact: { name: 'Event head', phone: '+91 90000 00002' },
  },
  {
    id: 'eafc',
    name: 'EA FC Solo League',
    codename: 'Golden Boot',
    category: 'gaming',
    wanted: 2,
    teamMin: 1, teamMax: 1,
    fee: 150,
    prizes: [6000, 3000, 1500],
    day: 2, time: '10:00 – 15:00', venue: 'esports-arena',
    blurb: 'One controller, one club, knockout brackets on the big screen.',
    rules: [
      'Solo event on console. Controllers provided.',
      '6 minute halves, no extra time in group stage.',
      'Any club allowed, no custom squads.',
    ],
    contact: { name: 'Event head', phone: '+91 90000 00003' },
  },
  {
    id: 'tekken',
    name: 'Tekken 8 Fight Night',
    codename: 'Iron Fist',
    category: 'gaming',
    wanted: 3,
    teamMin: 1, teamMax: 1,
    fee: 150,
    prizes: [6000, 3000, 1500],
    day: 2, time: '15:00 – 19:00', venue: 'esports-arena',
    blurb: 'Double elimination brackets, first to three, finals first to five.',
    rules: [
      'Solo event. Bring your own fight stick or pad if you prefer.',
      'All characters allowed.',
      'Winner keeps the same character, loser may switch.',
    ],
    contact: { name: 'Event head', phone: '+91 90000 00004' },
  },
  {
    id: 'hackathon',
    name: 'Heist Hack (24h)',
    codename: 'The Big Score',
    category: 'tech',
    wanted: 5,
    teamMin: 2, teamMax: 4,
    fee: 400,
    prizes: [30000, 15000, 8000],
    day: 1, time: '12:00 Day 1 – 12:00 Day 2', venue: 'innovation-hall',
    blurb: 'Plan it, build it, pitch it. 24 hours to ship a working prototype on an open theme revealed at kickoff.',
    rules: [
      'Teams of 2 to 4. Cross-college teams allowed.',
      'All code written during the event. Open-source libraries allowed.',
      'Food and power provided. Bring laptops and chargers.',
      'Judging: idea, execution, design, demo.',
    ],
    contact: { name: 'Event head', phone: '+91 90000 00005' },
  },
  {
    id: 'robo-race',
    name: 'Robo Race',
    codename: 'Getaway Driver',
    category: 'tech',
    wanted: 3,
    teamMin: 2, teamMax: 4,
    fee: 300,
    prizes: [12000, 6000, 3000],
    day: 1, time: '11:00 – 16:00', venue: 'open-ground',
    blurb: 'Wired or wireless bots race a track of ramps, sand and tight turns. Fastest clean lap wins.',
    rules: [
      'Bot max 30 × 30 × 30 cm, max 5 kg.',
      'Supply up to 12 V. No IC engines.',
      'Three attempts, best time counts. Touching the bot adds 5 seconds.',
    ],
    contact: { name: 'Event head', phone: '+91 90000 00006' },
  },
  {
    id: 'robo-soccer',
    name: 'Robo Soccer',
    codename: 'Street Kings',
    category: 'tech',
    wanted: 4,
    teamMin: 2, teamMax: 4,
    fee: 300,
    prizes: [12000, 6000, 3000],
    day: 2, time: '10:00 – 16:00', venue: 'open-ground',
    blurb: 'One-on-one bot football in a walled arena. Push, dribble, score.',
    rules: [
      'Bot max 25 × 25 × 25 cm, max 3 kg.',
      'Two halves of 3 minutes.',
      'No weapons, no flippers, no damage to the ball.',
    ],
    contact: { name: 'Event head', phone: '+91 90000 00007' },
  },
  {
    id: 'iot-sprint',
    name: 'IoT Build Sprint',
    codename: 'Wired Up',
    category: 'tech',
    wanted: 3,
    teamMin: 1, teamMax: 3,
    fee: 200,
    prizes: [8500, 4000, 2500],
    day: 2, time: '09:30 – 14:30', venue: 'innovation-hall',
    blurb: 'Five hours, one kit, one problem statement. Make the sensor talk to the cloud.',
    rules: [
      'Teams of 1 to 3. Kits (microcontroller, sensors) provided on loan.',
      'Problem statement revealed at start.',
      'Kits must be returned to get a certificate.',
    ],
    contact: { name: 'Event head', phone: '+91 90000 00008' },
  },
]

// Venues. x,y are positions (0-100) on the stylised campus minimap.
export const venues = {
  'esports-arena':   { name: 'Esports Arena',   where: 'Auditorium, Block A', x: 30, y: 34 },
  'lab-block':       { name: 'Lab Block',       where: 'Computer Labs 1-4, Block C', x: 64, y: 26 },
  'innovation-hall': { name: 'Innovation Hall', where: 'Seminar Hall, Block B', x: 70, y: 62 },
  'open-ground':     { name: 'Open Ground',     where: 'Behind Main Gate', x: 26, y: 72 },
  'help-desk':       { name: 'Help Desk',       where: 'Main Gate Reception', x: 48, y: 86 },
}

export const location = {
  name: 'Main Campus',                                  // TODO
  address: 'Your University, Campus Road, City, State 000000', // TODO
  mapsUrl: 'https://maps.google.com/?q=Your+University', // TODO: paste your Google Maps share link
  howToReach: [
    { by: 'Metro', text: 'Nearest station is 10 minutes walk. Shuttle every 20 minutes on event days.' },
    { by: 'Bus', text: 'City buses stop at the main gate.' },
    { by: 'Car', text: 'Visitor parking at Gate 2. Carry your pass.' },
  ],
}

export const schedule = [
  {
    day: 1, date: 'Fri, 19 Feb',
    items: [
      { time: '08:30', title: 'Check-in opens', venue: 'help-desk' },
      { time: '09:30', title: 'Valorant 5v5 Cup starts', venue: 'esports-arena', event: 'valorant' },
      { time: '10:00', title: 'BGMI Squad Showdown', venue: 'lab-block', event: 'bgmi' },
      { time: '11:00', title: 'Robo Race heats', venue: 'open-ground', event: 'robo-race' },
      { time: '12:00', title: 'Heist Hack kickoff', venue: 'innovation-hall', event: 'hackathon' },
      { time: '18:00', title: 'Valorant playoffs on the big screen', venue: 'esports-arena', event: 'valorant' },
      { time: '20:00', title: 'Day 1 wrap', venue: 'help-desk' },
    ],
  },
  {
    day: 2, date: 'Sat, 20 Feb',
    items: [
      { time: '09:30', title: 'IoT Build Sprint', venue: 'innovation-hall', event: 'iot-sprint' },
      { time: '10:00', title: 'EA FC Solo League', venue: 'esports-arena', event: 'eafc' },
      { time: '10:00', title: 'Robo Soccer', venue: 'open-ground', event: 'robo-soccer' },
      { time: '12:00', title: 'Heist Hack demos and judging', venue: 'innovation-hall', event: 'hackathon' },
      { time: '15:00', title: 'Tekken 8 Fight Night', venue: 'esports-arena', event: 'tekken' },
      { time: '19:00', title: 'Prize ceremony', venue: 'esports-arena' },
    ],
  },
]

export const faqs = [
  { q: 'Who can take part?', a: 'Any student with a valid college ID. Teams can mix colleges unless an event says otherwise.' },
  { q: 'How do I pay?', a: 'After registering you get a UPI QR for the exact amount. Pay from any UPI app, then enter the 12-digit UTR and upload a screenshot.' },
  { q: 'When is my registration confirmed?', a: 'Organisers verify payments within 24 hours. Your pass shows ACTIVE once verified.' },
  { q: 'Can I join more than one event?', a: 'Yes, as long as the timings do not clash. Check the schedule before you pick.' },
  { q: 'Is there a refund?', a: 'Fees are non-refundable, except if an event is cancelled by the organisers.' },
  { q: 'Do I need to bring anything?', a: 'College ID and your pass QR. Each event lists the gear you need.' },
]

export const contacts = [
  { title: 'The Boss', role: 'Fest coordinator', name: 'Name Surname', phone: '+91 90000 00010' },     // TODO
  { title: 'Gaming Lieutenant', role: 'Gaming lead', name: 'Name Surname', phone: '+91 90000 00011' },           // TODO
  { title: 'Tech Lieutenant', role: 'Tech events lead', name: 'Name Surname', phone: '+91 90000 00012' },      // TODO
]

export const socials = [
  { label: 'Instagram', url: 'https://instagram.com/' }, // TODO
  { label: 'Discord', url: 'https://discord.gg/' },      // TODO
  { label: 'Email', url: 'mailto:fest@example.edu' },    // TODO
]

export const sponsors = ['Title Sponsor', 'Gaming Partner', 'Hardware Partner', 'Food Partner', 'Media Partner'] // TODO

// helpers
export const getEvent = (id) => events.find((e) => e.id === id)
export const prizeTotal = (e) => e.prizes.reduce((a, b) => a + b, 0)
export const inr = (n) => '₹' + n.toLocaleString('en-IN')
export const teamLabel = (e) => (e.teamMax === 1 ? 'Solo' : e.teamMin === e.teamMax ? `${e.teamMin} players` : `${e.teamMin}–${e.teamMax} players`)
export const totalPrizePool = events.reduce((s, e) => s + prizeTotal(e), 0)
