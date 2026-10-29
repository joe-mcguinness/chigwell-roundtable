// Shared facts about the site, so a change to the club's details
// only needs updating in one place.

export const pages = [
  { path: '/', title: 'Chigwell Round Table', nav: 'Home', h1: /Good mates/ },
  { path: '/about/', title: 'About | Chigwell Round Table', nav: 'About', h1: /Part of something bigger/ },
  { path: '/contact/', title: 'Contact | Chigwell Round Table', nav: 'Contact', h1: /Come and say hello/ },
] as const;

export const club = {
  email: 'chigwell@roundtable.org.uk',
  facebook: 'https://www.facebook.com/chigwellroundtable',
  instagram: 'https://www.instagram.com/chigwell.roundtable/',
  rtbi: 'https://www.roundtable.co.uk/',
  rti: 'https://round-table.org/',
  meetings: /2nd and 4th Wednesday|second and fourth Wednesday/,
};

export const isLive = !!process.env.BASE_URL;
