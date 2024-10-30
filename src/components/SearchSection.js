import React, { useCallback } from 'react';
import axios from 'axios';

function SearchSection({ onPlayerSelect, selectedPlayers }) {
  const [query, setQuery] = React.useState('');
  const [suggestions, setSuggestions] = React.useState([]);
  const debounceTimer = React.useRef(null);

  const fetchSuggestions = useCallback(async (value) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/v1/pitcher/auto/${value}`);
      if (response.data.data === null) {
        setSuggestions([{ id: 'no-result', name: '선수가 없습니다', team: '' }]);
      } else {
        setSuggestions(response.data.data);
      }
    } catch (error) {
      console.error('자동완성 조회 실패:', error);
      setSuggestions([]);
    }
  }, []);

  const handleSearch = useCallback((value) => {
    setQuery(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!value.trim()) {
      setSuggestions([]); // Clear suggestions if the input is empty
      return;
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 50);
  }, [fetchSuggestions]);

  const handleSuggestionClick = (player) => {
    setQuery('');  // 검색어 초기화
    setSuggestions([]); // 제안 목록 초기화
    onPlayerSelect(player); // 선택한 플레이어 처리
  };

  React.useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <section className="search-section">
      <div className="search-container">
        <input
          type="text"
          placeholder="선수 검색"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="search-input"
        />
        {query && suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((player) => {
              const isSelected = selectedPlayers.has(player.id);
              return (
                <li
                  key={player.id}
                  className={`suggestion-item ${isSelected ? 'selected' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation(); // 이벤트 전파 방지
                    handleSuggestionClick(player);
                  }}
                >
                  {player.name}
                  {player.team && ` - ${player.team}`} {/* 팀 정보가 있을 때만 표시 */}
                  {isSelected && <span className="already-selected"> (이미 선택함)</span>}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

export default SearchSection;
