import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

import SearchSection from './components/SearchSection';
import GameStatus from './components/GameStatus';
import ResultComparison from './components/ResultComparison';

function App() {
  const [randomPlayer, setRandomPlayer] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameStatus, setGameStatus] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState(new Set());
  const [videoUrl, setVideoUrl] = useState('');
  const MAX_ATTEMPTS = 6;
  const isFirstRender = useRef(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fetchRandomPlayer();
    }
  }, []);

  const fetchRandomPlayer = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}api/v1/pitcher/random`);
      const quizFileUrl = 'https://kbo-pitcher-game.pages.dev/result/' + response.data.data.quizFileName;
      setRandomPlayer({ ...response.data.data, videoUrl: quizFileUrl });
      setHasError(false); // 성공 시 에러 상태 초기화
    } catch (error) {
      setHasError(true);
      console.error('랜덤 선수 조회 실패:', error);
    }
  };

  if (hasError) {
    return (
      <div className="error-page">
        <h1>에러 발생!</h1>
        <p>랜덤 선수를 불러오는 데 실패했습니다. 서버 상태를 확인하거나 다시 시도해 주세요.</p>
        <button onClick={fetchRandomPlayer}>다시 시도</button>
      </div>
    );
  }

  const handlePlayerSelect = async (player) => {
    try {
      if (isGameOver) {
        return;
      }

      if (guesses.some(guess => guess.playerName === player.name)) {
        alert('이미 선택한 선수입니다!');
        return;
      }

      const response = await axios.post('http://localhost:8080/api/v1/pitcher/submit', {
        randomPlayerId: randomPlayer.id,
        userPlayerId: player.id,
        tryCount: attempts + 1
      });

      const result = response.data.data;
      
      if (result.gameStatus === 'CORRECT' || result.gameStatus === 'GAME_OVER') {
        const resultFileUrl = 'https://kbo-pitcher-game.pages.dev/original/' + result.randomPitcherResponse.answerFileName;
        setVideoUrl(resultFileUrl);
        setIsGameOver(true);
        setGameStatus({
          status: result.gameStatus,
          correctPlayerName: result.randomPitcherResponse.name,
          correctTeam: result.randomPitcherResponse.team
        });
        return;
      }

      const newGuess = {
        playerName: player.name,
        result: result
      };
      setGuesses(prev => [newGuess, ...prev]);
      setAttempts(prev => prev + 1);

    } catch (error) {
      console.error('결과 제출 실패:', error);
    }
  };

  const handleRestart = () => {
    // 모든 상태 초기화
    setIsGameOver(false);
    setGameStatus(null);
    setAttempts(0);
    setGuesses([]);
    setVideoUrl('');
    
    // 새로운 랜덤 선수 가져오기
    fetchRandomPlayer();
  };

  return (
    <div className="App">
      <header className="header">
        <h1>KBO 투구폼 맞추기</h1>
      </header>

      <main className="main-content">
        <div className="video-container">
          <video 
            src={videoUrl || randomPlayer?.videoUrl} 
            autoPlay 
            loop 
            muted 
            playsInline
            controls={false}
            className="game-video"
          />
        </div>
        <GameStatus 
          attempts={attempts} 
          maxAttempts={MAX_ATTEMPTS} 
          gameStatus={gameStatus}
          onRestart={handleRestart}
        />
        <SearchSection 
          onPlayerSelect={handlePlayerSelect} 
          selectedPlayers={selectedPlayers}
        />
        <div className="guesses-stack">
          {guesses.map((guess, index) => (
            <div key={index} className="guess-item">
              <ResultComparison 
                gameResult={guess.result}
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App; 