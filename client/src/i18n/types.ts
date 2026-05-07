export interface NavTranslations {
  about: string;
  expertise: string;
  projects: string;
  experience: string;
}

export interface HeroTranslations {
  greeting: string;
  role: string;
  at: string;
  subtitle: string;
  cta: string;
  availability: string;
  location: string;
  proof: string[];
}

export interface MarqueeTranslations {
  label: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  link: string;
}

export interface ProjectsTranslations {
  title: string;
  subtitle: string;
  viewCode: string;
  items: ProjectItem[];
}

export interface ExpertiseItem {
  number: string;
  title: string;
  description: string;
  tags: string[];
}

export interface ExpertiseTranslations {
  title: string;
  subtitle: string;
  items: ExpertiseItem[];
}

export interface AboutTranslations {
  title: string;
  description: string;
  description2: string;
  interests: string;
}

export interface ExperienceItem {
  period: string;
  title: string;
  company: string;
  location: string;
  description: string;
}

export interface EducationItem {
  period: string;
  title: string;
  school: string;
}

export interface ExperienceTranslations {
  title: string;
  items: ExperienceItem[];
  education: EducationItem[];
}

export interface FooterTranslations {
  made: string;
  by: string;
}

export interface LifestyleItem {
  emoji: string;
  title: string;
  description: string;
}

export interface LifestyleTennis {
  title: string;
  subtitle: string;
  tenup: string;
}

export interface LifestyleTranslations {
  title: string;
  subtitle: string;
  sportLabel: string;
  otherLabel: string;
  tennis: LifestyleTennis;
  items: LifestyleItem[];
}

export interface Translations {
  nav: NavTranslations;
  hero: HeroTranslations;
  marquee: MarqueeTranslations;
  expertise: ExpertiseTranslations;
  projects: ProjectsTranslations;
  about: AboutTranslations;
  experience: ExperienceTranslations;
  lifestyle: LifestyleTranslations;
  footer: FooterTranslations;
}
