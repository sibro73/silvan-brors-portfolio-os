import './About.css';

import { profile } from '../../../data';

export function About() {
  return (
    <div className="about">
      <h1 className="about__title">{profile.greeting}</h1>
      <p className="about__muted">{profile.tagline}</p>
      <p className="about__intro">
        {profile.intro.map((part, i) =>
          part.mark ? <mark key={i}>{part.text}</mark> : <span key={i}>{part.text}</span>,
        )}
      </p>
      {profile.about.map((p) => (
        <p key={p} className="about__intro">
          {p}
        </p>
      ))}
      <p className="about__muted">{profile.tip}</p>
    </div>
  );
}
