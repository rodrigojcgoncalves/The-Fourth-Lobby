import roniiImg from '@img/artists/residents/ronii.jpg';
import safImg from '@img/artists/residents/SAF.jpg';
import neketImg from '@img/artists/residents/neket.jpg';
import roniiBanner from '@img/artists/residents/ronii_banner.jpg';
import safBanner from '@img/artists/residents/saf_banner.jpeg';
import neketBanner from '@img/artists/residents/neket_banner.jpg';

export interface Resident {
  slug: string;
  name: string;
  role: string;
  genres: string[];
  image: string;
  bannerImage: string;
  socials: {
    instagram?: string;
    soundcloud?: string;
  };
}

export const residents: Resident[] = [
  {
    slug: 'ronii',
    name: 'RØNII',
    role: 'Resident DJ / Co-Founder',
    genres: ['Hard Techno', 'Schranz', 'Psy'],
    image: roniiImg,
    bannerImage: roniiBanner,
    socials: {
      instagram: 'https://www.instagram.com/ronii.wav/',
      soundcloud: 'https://soundcloud.com/roniib0y'
    }
  },
  {
    slug: 'saf',
    name: 'SAF',
    role: 'Resident DJ',
    genres: ['HardBounce', 'Hardgroove', 'Hard Techno'],
    image: safImg,
    bannerImage: safBanner,
    socials: {
      instagram: 'https://www.instagram.com/saf_wav/',
      soundcloud: 'https://soundcloud.com/saf_17'
    }
  },
  {
    slug: 'neket',
    name: 'NËKËT',
    role: 'Resident DJ',
    genres: ['Industrial', 'Hard Techno', 'Raw'],
    image: neketImg,
    bannerImage: neketBanner,
    socials: {
      instagram: 'https://www.instagram.com/andre_neket/',
      soundcloud: 'https://soundcloud.com/neket-13'
    }
  }
];
