import React, { useEffect, useState } from 'react';
import './ResultComparison.css'; // CSS 파일을 import

const ResultComparison = ({ gameResult }) => {
  const [visibleIndex, setVisibleIndex] = useState(-1);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleIndex((prev) => prev + 1);
    }, 300); // 300ms 간격으로 항목 표시

    return () => clearInterval(timer);
  }, [gameResult]); // gameResult가 변경될 때마다 다시 시작

  return (
    <div className="guess-item">
      <div className="player-name comparison-item">
        {gameResult.userPitcherResponse.team} - {gameResult.userPitcherResponse.name}
      </div>
      <div className="comparison-row">
        {['team', 'position', 'age', 'backNumber'].map((field, index) => (
          <div
            key={field}
            className={`comparison-item ${index <= visibleIndex ? 'show' : ''}`}
          >
            <span className="label">{field.toUpperCase()}</span>
            <div className={`value ${gameResult[`${field}Diff`] ? 'same' : 'different'}`}>
              {gameResult.userPitcherResponse[field]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultComparison;
