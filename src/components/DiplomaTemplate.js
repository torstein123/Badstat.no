import React from 'react';
import { Card } from 'react-bootstrap';
import './DiplomaTemplate.css';

const DiplomaTemplate = ({ player, template, club }) => {
  if (!player || !template) return null;

  const formatDate = () => {
    const today = new Date();
    return today.toLocaleDateString('nb-NO', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const renderPremiumTemplate = () => {
    return (
      <div className="diploma premium-template">
        <div className="diploma-header">
          <div className="diploma-logo"></div>
          <h1>DIPLOM</h1>
          <div className="diploma-subtitle">for fremragende innsats i badminton</div>
        </div>
        
        <div className="diploma-content">
          <div className="player-name">{player.name}</div>
          <div className="player-club">{club}</div>
          
          <div className="achievement-text">
            har utvist enestående ferdigheter og sportsånd i sesongen 2023/2024
          </div>
          
          <div className="stats-container">
            <div className="stat-item">
              <div className="stat-value">{player.class}</div>
              <div className="stat-label">Klasse</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{player.rankingPoints}</div>
              <div className="stat-label">Rankingpoeng</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{player.wins}</div>
              <div className="stat-label">Seiere</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{player.matches}</div>
              <div className="stat-label">Kamper</div>
            </div>
          </div>
          
          <div className="highlight-achievement">
            Vant {Math.floor(Math.random() * 3) + 1} turneringer og økte rankingpoeng med {Math.floor(Math.random() * 1000) + 500} poeng denne sesongen
          </div>
        </div>
        
        <div className="diploma-footer">
          <div className="signature-container">
            <div className="signature-line"></div>
            <div className="signature-name">Klubbleder</div>
          </div>
          
          <div className="date-container">
            <div className="date">{formatDate()}</div>
          </div>
        </div>
        
        <div className="diploma-border"></div>
        <div className="diploma-corner top-left"></div>
        <div className="diploma-corner top-right"></div>
        <div className="diploma-corner bottom-left"></div>
        <div className="diploma-corner bottom-right"></div>
      </div>
    );
  };

  const renderStandardTemplate = () => {
    return (
      <div className="diploma standard-template">
        <div className="diploma-header">
          <h1>DIPLOM</h1>
          <div className="diploma-subtitle">Badmintonsesongen 2023/2024</div>
        </div>
        
        <div className="diploma-content">
          <div className="player-name">{player.name}</div>
          <div className="player-club">{club}</div>
          
          <div className="stats-container simple">
            <div className="stat-item">
              <div className="stat-label">Klasse</div>
              <div className="stat-value">{player.class}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Poeng</div>
              <div className="stat-value">{player.rankingPoints}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Seiere</div>
              <div className="stat-value">{player.wins}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Kamper</div>
              <div className="stat-value">{player.matches}</div>
            </div>
          </div>
        </div>
        
        <div className="diploma-footer">
          <div className="signature-container">
            <div className="signature-line"></div>
            <div className="signature-name">Klubbleder</div>
          </div>
          
          <div className="date-container">
            <div className="date">{formatDate()}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderProTemplate = () => {
    return (
      <div className="diploma pro-template">
        <div className="diploma-header">
          <div className="diploma-logo pro"></div>
          <h1>DIPLOM</h1>
          <div className="diploma-subtitle">for utmerket prestasjon i badminton</div>
        </div>
        
        <div className="diploma-content">
          <div className="certificate-text">Dette sertifikatet bekrefter at</div>
          <div className="player-name">{player.name}</div>
          <div className="player-club">{club}</div>
          
          <div className="achievement-text">
            har oppnådd fremragende resultater i badmintonsesongen 2023/2024
          </div>
          
          <div className="stats-container pro">
            <div className="stat-item">
              <div className="stat-label">Klasse</div>
              <div className="stat-value">{player.class}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Rankingpoeng</div>
              <div className="stat-value">{player.rankingPoints}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Seiere</div>
              <div className="stat-value">{player.wins}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Kamper</div>
              <div className="stat-value">{player.matches}</div>
            </div>
          </div>
          
          <div className="highlight-achievement pro">
            Oppnådde en {Math.floor(Math.random() * 70) + 30}% vinnprosent og demonstrerte eksepsjonell sportsånd
          </div>
        </div>
        
        <div className="diploma-footer">
          <div className="signature-container">
            <div className="signature-line"></div>
            <div className="signature-name">Klubbleder</div>
          </div>
          
          <div className="date-container">
            <div className="date">{formatDate()}</div>
          </div>
        </div>
        
        <div className="diploma-watermark"></div>
      </div>
    );
  };

  return (
    <Card className="diploma-preview-card">
      <Card.Header>
        <h5 className="mb-0">Diplomforhåndsvisning</h5>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="diploma-preview-container">
          {template.id === 1 && renderPremiumTemplate()}
          {template.id === 2 && renderProTemplate()}
          {template.id === 3 && renderStandardTemplate()}
        </div>
      </Card.Body>
      <Card.Footer className="bg-light">
        <small className="text-muted">Dette er en forhåndsvisning. Det faktiske diplomet kan variere noe.</small>
      </Card.Footer>
    </Card>
  );
};

export default DiplomaTemplate; 