import React from 'react';

function GameStatus({ attempts, maxAttempts, gameStatus, onRestart }) {
  if (gameStatus?.status === 'CORRECT') {
    return (
      <div className="game-status correct">
        <p>정답입니다! 축하드립니다.</p>
        <p className="correct-answer">정답: {gameStatus.correctTeam} - {gameStatus.correctPlayerName}</p>
        <button className="restart-button" onClick={onRestart}>
          게임 다시하기
        </button>
      </div>
    );
  }

  if (gameStatus?.status === 'GAME_OVER') {
    return (
      <div className="game-status game-over">
        <p>실패 ㅠㅠ</p>
        <p className="correct-answer">정답: {gameStatus.correctTeam} - {gameStatus.correctPlayerName}</p>
        <button className="restart-button" onClick={onRestart}>
          게임 다시하기
        </button>
      </div>
    );
  }

  return (
    <div className="game-status">
      <p>남은 기회: {maxAttempts - attempts + 1}회</p>
    </div>
  );
}

export default GameStatus;
