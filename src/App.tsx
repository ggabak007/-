import React, { useState, useMemo } from 'react';
import { FISH_DATA, CATEGORIES } from './data';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

const MainApp = () => {
  const [view, setView] = useState('landing');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 필터 상태
  const [tempFilter, setTempFilter] = useState<{ location: string[], weather: string[], time: number[] }>({
    location: [],
    weather: [],
    time: []
  });
  const [appliedFilter, setAppliedFilter] = useState<{ location: string[], weather: string[], time: number[] }>({ 
    location: [], 
    weather: [], 
    time: [] 
  });

  const [selectedMainCats, setSelectedMainCats] = useState<string[]>([]);

  // --- [데이터 그룹화 로직] ---
  const getMainCategory = (loc: string) => {
    const n = loc.replace(/\s+/g, '');
    if (n.includes('강')) return '강';
    if (n.includes('바다') || n.includes('동해') || n.includes('구해') || n === '바다낚시') return '바다';
    if (n.includes('호수') || n.includes('온천산수')) return '호수';
    return '기타';
  };

  const subLocationsMap = useMemo(() => {
    const locs = Array.from(new Set(FISH_DATA.flatMap(item => item.location)));
    const groups: { [key: string]: string[] } = { '강': [], '바다': [], '호수': [] };
    locs.forEach(loc => {
      const main = getMainCategory(loc);
      if (groups[main]) groups[main].push(loc);
    });
    return groups;
  }, []);

  // --- [날씨 매칭 로직] ---
  const weatherCategories = ['눈/비', '맑음', '무지개'];

  const matchesWeather = (itemWeather: string, filterCats: string[]) => {
    if (filterCats.length === 0) return true;
    return filterCats.some(cat => {
      if (cat === '눈/비') return itemWeather.includes('비') || itemWeather.includes('눈');
      if (cat === '맑음') return itemWeather.includes('맑') || itemWeather.includes('무관');
      if (cat === '무지개') return itemWeather.includes('무지개');
      return false;
    });
  };

  // --- [필터링 및 정렬] ---
  const filteredData = useMemo(() => {
    let result = [...FISH_DATA];

    // 장소 필터
    if (appliedFilter.location.length > 0) {
      result = result.filter(item => 
        item.location.some(loc => appliedFilter.location.includes(loc))
      );
    }
    // 날씨 필터 (그룹화 로직 적용)
    if (appliedFilter.weather.length > 0) {
      result = result.filter(item => matchesWeather(item.weather, appliedFilter.weather));
    }
    // 시간 필터
    if (appliedFilter.time.length > 0) {
      result = result.filter(item => item.time.some(t => appliedFilter.time.includes(t)));
    }

    return result.sort((a, b) => sortOrder === 'asc' ? a.level - b.level : b.level - a.level);
  }, [appliedFilter, sortOrder]);

  const toggleMainCategory = (mainCat: string) => {
    const subs = subLocationsMap[mainCat];
    const isAlreadySelected = selectedMainCats.includes(mainCat);
    if (isAlreadySelected) {
      setSelectedMainCats(prev => prev.filter(c => c !== mainCat));
      setTempFilter(prev => ({ ...prev, location: prev.location.filter(loc => !subs.includes(loc)) }));
    } else {
      setSelectedMainCats(prev => [...prev, mainCat]);
      setTempFilter(prev => ({ ...prev, location: Array.from(new Set([...prev.location, ...subs])) }));
    }
  };

  const toggleFilter = (type: 'location' | 'weather' | 'time', value: any) => {
    setTempFilter(prev => {
      const currentList = prev[type] as any[];
      return {
        ...prev,
        [type]: currentList.includes(value) ? currentList.filter(v => v !== value) : [...currentList, value]
      };
    });
  };

  // UI 렌더링 (생략된 부분은 기존과 동일)
  if (view === 'landing') return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center font-sans">
      <h1 className="text-4xl font-bold text-pink-600 mb-8">🏠 두근두근타운 도감</h1>
      <button onClick={() => setView('category')} className="bg-pink-400 hover:bg-pink-500 text-white font-bold py-4 px-10 rounded-full shadow-lg transform transition hover:scale-105">도감 시작하기</button>
    </div>
  );

  if (view === 'category') return (
    <div className="min-h-screen bg-blue-50 p-8 flex flex-col items-center font-sans">
      <h2 className="text-2xl font-bold text-blue-600 mb-8">카테고리를 선택하세요</h2>
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => { setSelectedCategory(cat); setView('list'); }} className="bg-white p-6 rounded-3xl shadow-md text-xl font-bold text-gray-700 hover:bg-blue-100 transition">
            {cat === '낚시' ? '🎣' : cat === '채집' ? '🌿' : cat === '요리' ? '🍳' : '📸'} {cat}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-orange-50 p-4 font-sans">
      <div className="flex justify-between items-center mb-6 max-w-2xl mx-auto mt-4">
        <button onClick={() => setView('category')} className="text-gray-500 font-medium">← 뒤로</button>
        <h2 className="text-xl font-bold text-orange-600">{selectedCategory} 도감</h2>
        <div className="space-x-2">
          <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="bg-white px-3 py-1 rounded-full shadow text-sm font-medium">레벨 {sortOrder === 'asc' ? '↑' : '↓'}</button>
          <button onClick={() => setIsFilterOpen(true)} className="bg-orange-400 text-white px-3 py-1 rounded-full shadow text-sm font-medium">필터 🔍</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {filteredData.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-3xl shadow-sm flex items-center space-x-4">
            <img src={item.image || "https://via.placeholder.com/100"} alt={item.name} className="w-16 h-16 rounded-2xl bg-gray-100 object-cover" />
            <div>
              <p className="text-xs text-orange-400 font-bold">Lv.{item.level} 해금</p>
              <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
              <div className="flex flex-wrap gap-1 mt-1">
                {item.location.map(loc => (
                  <span key={loc} className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">{loc}</span>
                ))}
                <span className="text-[10px] bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full font-medium">{item.weather}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isFilterOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold mb-6 text-center text-gray-800">도감 필터링</h3>
            <div className="space-y-8">
              {/* 장소 섹션 */}
              <div>
                <p className="font-bold text-sm mb-3 text-gray-500">📍 지역 대분류</p>
                <div className="grid grid-cols-3 gap-3">
                  {['강', '바다', '호수'].map(id => (
                    <button key={id} onClick={() => toggleMainCategory(id)} className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${selectedMainCats.includes(id) ? 'bg-orange-50 border-orange-400 text-orange-600' : 'bg-gray-50 border-transparent text-gray-400'}`}>
                      <span className="text-2xl mb-1">{id === '강' ? '🏞️' : id === '바다' ? '🌊' : '💧'}</span>
                      <span className="font-bold text-xs">{id}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedMainCats.length > 0 && (
                <div className="space-y-2">
                  <p className="font-bold text-sm text-gray-500">🔍 세부 장소</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMainCats.flatMap(cat => subLocationsMap[cat]).map(loc => (
                      <button key={loc} onClick={() => toggleFilter('location', loc)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${tempFilter.location.includes(loc) ? 'bg-orange-400 text-white border-orange-500' : 'bg-white text-gray-500 border-gray-200'}`}>{loc}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* 시간 섹션 */}
              <div>
                <p className="font-bold text-sm mb-2 text-gray-500">⏰ 시간대</p>
                <div className="grid grid-cols-4 bg-gray-100 rounded-xl p-1">
                  {[0, 6, 12, 18].map(t => (
                    <button key={t} onClick={() => toggleFilter('time', t)} className={`py-2 text-[10px] font-bold rounded-lg transition ${tempFilter.time.includes(t) ? 'bg-white shadow text-orange-500' : 'text-gray-400'}`}>{t}-{t+6}</button>
                  ))}
                </div>
              </div>

              {/* 날씨 섹션 (눈/비, 맑음, 무지개로 고정) */}
              <div>
                <p className="font-bold text-sm mb-2 text-gray-500">☀️ 날씨 조건</p>
                <div className="flex gap-2">
                  {weatherCategories.map(w => (
                    <button key={w} onClick={() => toggleFilter('weather', w)} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${tempFilter.weather.includes(w) ? 'bg-orange-400 text-white border-orange-500 shadow-md' : 'bg-white text-gray-400 border-gray-100'}`}>
                      {w === '눈/비' ? '🌧️ ' : w === '맑음' ? '☀️ ' : '🌈 '}{w}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={() => { setAppliedFilter(tempFilter); setIsFilterOpen(false); }} className="w-full bg-orange-500 text-white py-4 rounded-2xl mt-8 font-bold text-lg shadow-lg hover:bg-orange-600 transition">적용하기</button>
            <button onClick={() => setIsFilterOpen(false)} className="w-full text-gray-400 mt-4 text-sm font-medium text-center">닫기</button>
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <MainApp />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;