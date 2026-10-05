import React, { useState } from 'react';
import { Club, CultureGuides, Story } from '../types';

interface EventsSectionProps {
  clubs: Club[];
  events: Story[];
  cultureGuides: CultureGuides;
  selectedLocation: string;
  onOpenLocation: () => void;
}

type EventsTab = 'baladas' | 'cinema' | 'teatro';

export const EventsSection: React.FC<EventsSectionProps> = ({
  clubs,
  events,
  cultureGuides,
  selectedLocation,
  onOpenLocation
}) => {
  const [activeTab, setActiveTab] = useState<EventsTab>('baladas');
  const tabs: { id: EventsTab; label: string }[] = [
    { id: 'baladas', label: 'Eventos' },
    { id: 'cinema', label: 'Cinema' },
    { id: 'teatro', label: 'Teatro' }
  ];

  return (
    <section className="editorial-section page-section" id="eventos" aria-labelledby="events-title">
      <div className="editorial-intro">
        <div>
          <span className="eyebrow">Agenda cultural · {selectedLocation || 'Belo Horizonte · MG'}</span>
          <h2 id="events-title">Onde ir e o que fazer</h2>
        </div>
        <p>Eventos, cinema e teatro com data, local e fonte para você planejar seu próximo rolê.</p>
      </div>

      <div className="events-toolbar">
        <button type="button" onClick={onOpenLocation} className="location-button events-location-button">
          <span>Localidade</span>
          <strong>{selectedLocation || 'Escolher cidade'}</strong>
        </button>

        <div className="events-tabs" role="group" aria-label="Tipo de programação">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`events-tab-${tab.id}`}
              type="button"
              aria-pressed={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div
        id={`events-panel-${activeTab}`}
        className="events-content"
      >
        {activeTab === 'baladas' && (
          <>
            {events.length > 0 ? (
              <div className="events-live-grid">
                {events.map((event) => (
                  <article className="events-live-card" key={event.id}>
                    <div className="events-live-card-top">
                      <span className="events-live-date">{event.dateLabel}</span>
                      <span className="events-live-mark">{event.artMark || 'KURTI'}</span>
                    </div>
                    <h3>{event.title}</h3>
                    <p>{event.summary}</p>
                    <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer" className="events-live-link">
                      Ingressos e detalhes <span aria-hidden="true">↗</span>
                    </a>
                    <small>Fonte: {event.source}</small>
                  </article>
                ))}
              </div>
            ) : (
              <div className="events-empty-state">
                <span aria-hidden="true">✦</span>
                <h3>Nenhum evento futuro publicado por enquanto</h3>
                <p>Confira as agendas oficiais dos espaços abaixo e volte em breve para novas datas.</p>
              </div>
            )}

            <div className="events-venues">
              <div className="events-subheading">
                <span className="eyebrow">Para acompanhar</span>
                <h3>Espaços da cena</h3>
              </div>
              <div className="events-venue-grid">
                {clubs.map((club) => (
                  <a
                    key={club.name}
                    href={club.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="events-venue-card"
                  >
                    <span>{club.area}</span>
                    <strong>{club.name}</strong>
                    <small>{club.address}</small>
                    <em>Ver agenda oficial <span aria-hidden="true">↗</span></em>
                  </a>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'cinema' && (
          <CultureCards kind="cinema" items={cultureGuides.Cinema} />
        )}

        {activeTab === 'teatro' && (
          <CultureCards kind="teatro" items={cultureGuides.Teatro} />
        )}
      </div>
    </section>
  );
};

function CultureCards({
  kind,
  items
}: {
  kind: 'cinema' | 'teatro';
  items: CultureGuides['Cinema'];
}) {
  if (!items?.length) {
    return <div className="events-empty-state"><h3>Programação em atualização</h3><p>Consulte os canais oficiais dos espaços para confirmar próximas datas.</p></div>;
  }

  return (
    <div className="events-live-grid">
      {items.map((item) => (
        <article className="events-live-card culture-live-card" key={item.title}>
          <div className="events-live-card-top">
            <span className="events-live-date">{item.date}</span>
            <span className="events-live-mark">{kind === 'cinema' ? 'CINEMA' : 'TEATRO'}</span>
          </div>
          <h3>{item.title}</h3>
          <p className="events-live-venue">{item.venue}</p>
          <p>{item.note}</p>
          <div className="events-live-price">{item.price}</div>
          {item.sourceUrl && (
            <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="events-live-link">
              Conferir programação <span aria-hidden="true">↗</span>
            </a>
          )}
          {item.source && <small>Fonte: {item.source}</small>}
        </article>
      ))}
    </div>
  );
}
