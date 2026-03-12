import React, { useState, useMemo } from 'react';
import { FISH_DATA, COOKING_DATA, ALL_INGREDIENTS, CATEGORIES } from './data';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// ─── 낚시 페이지 ─────────────────────────────────────────────────
const FishingPage = ({ onBack }: { onBack: () => void }) => {
  const [sortOrder, setSortOrder] = useState('asc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [tempFilter, setTempFilter] = useState<{ location: string[], weather: string[], time: number[] }>({
    location: [], weather: [], time: []
  });
  const [appliedFilter, setAppliedFilter] = useState<{ location: string[], weather: string[], time: number[] }>({
    location: [], weather: [], time: []
  });
  const [selectedMainCats, setSelectedMainCats] = useState<string[]>([]);

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

  const filteredData = useMemo(() => {
    let result = [...FISH_DATA];
    if (searchQuery.trim() !== '') {
      const q = searchQuery.replace(/\s+/g, '');
      result = result.filter(item => item.name.replace(/\s+/g, '').includes(q));
    }
    if (appliedFilter.location.length > 0) {
      result = result.filter(item => item.location.some(loc => appliedFilter.location.includes(loc)));
    }
    if (appliedFilter.weather.length > 0) {
      result = result.filter(item => matchesWeather(item.weather, appliedFilter.weather));
    }
    if (appliedFilter.time.length > 0) {
      result = result.filter(item => item.time.some(t => appliedFilter.time.includes(t)));
    }
    return result.sort((a, b) => sortOrder === 'asc' ? a.level - b.level : b.level - a.level);
  }, [appliedFilter, sortOrder, searchQuery]);

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

  return (
    <div className="min-h-screen bg-orange-50 p-4 font-sans">
      <div className="flex justify-between items-center mb-6 max-w-2xl mx-auto mt-4">
        <button onClick={onBack} className="text-gray-500 font-medium">← 뒤로</button>
        <h2 className="text-xl font-bold text-orange-600">🎣 낚시 도감</h2>
        <div className="space-x-2">
          <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="bg-white px-3 py-1 rounded-full shadow text-sm font-medium">레벨 {sortOrder === 'asc' ? '↑' : '↓'}</button>
          <button onClick={() => setIsFilterOpen(true)} className="bg-orange-400 text-white px-3 py-1 rounded-full shadow text-sm font-medium">필터 🔍</button>
        </div>
      </div>

      {/* 검색창 */}
      <div className="max-w-2xl mx-auto mb-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔎</span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="물고기 이름으로 검색..."
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white shadow-sm border border-orange-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm font-bold">✕</button>
          )}
        </div>
      </div>

      {filteredData.length === 0 && (
        <div className="max-w-2xl mx-auto text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🐟</p>
          <p className="font-medium">검색 결과가 없어요</p>
          <p className="text-sm mt-1">다른 이름으로 검색해보세요</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {filteredData.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-3xl shadow-sm flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-3xl flex-shrink-0">🐠</div>
            <div className="min-w-0">
              <p className="text-xs text-orange-400 font-bold">Lv.{item.level} 해금</p>
              <h3 className="font-bold text-base text-gray-800 truncate">{item.name}</h3>
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
              <div>
                <p className="font-bold text-sm mb-2 text-gray-500">⏰ 시간대</p>
                <div className="grid grid-cols-4 bg-gray-100 rounded-xl p-1">
                  {[0, 6, 12, 18].map(t => (
                    <button key={t} onClick={() => toggleFilter('time', t)} className={`py-2 text-[10px] font-bold rounded-lg transition ${tempFilter.time.includes(t) ? 'bg-white shadow text-orange-500' : 'text-gray-400'}`}>{t}-{t + 6}</button>
                  ))}
                </div>
              </div>
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

// ─── 요리 페이지 ─────────────────────────────────────────────────
const STAR_LABELS = ['★', '★★', '★★★', '★★★★', '★★★★★'];

const CookingPage = ({ onBack }: { onBack: () => void }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [tempIngredients, setTempIngredients] = useState<string[]>([]);
  const [appliedIngredients, setAppliedIngredients] = useState<string[]>([]);
  const [ingredientSearch, setIngredientSearch] = useState('');

  const filteredData = useMemo(() => {
    let result = [...COOKING_DATA];
    if (searchQuery.trim() !== '') {
      const q = searchQuery.replace(/\s+/g, '');
      result = result.filter(item => item.name.replace(/\s+/g, '').includes(q));
    }
    if (appliedIngredients.length > 0) {
      result = result.filter(item =>
        appliedIngredients.every(ing => item.ingredientTags.includes(ing))
      );
    }
    return result;
  }, [searchQuery, appliedIngredients]);

  const toggleIngredient = (ing: string) => {
    setTempIngredients(prev =>
      prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]
    );
  };

  const visibleIngredients = ingredientSearch.trim()
    ? ALL_INGREDIENTS.filter(i => i.includes(ingredientSearch.trim()))
    : ALL_INGREDIENTS;

  const prices = (item: typeof COOKING_DATA[0]) =>
    [item.price1, item.price2, item.price3, item.price4, item.price5];

  return (
    <div className="min-h-screen bg-green-50 p-4 font-sans">
      <div className="flex justify-between items-center mb-6 max-w-2xl mx-auto mt-4">
        <button onClick={onBack} className="text-gray-500 font-medium">← 뒤로</button>
        <h2 className="text-xl font-bold text-green-700">🍳 요리 도감</h2>
        <button onClick={() => setIsFilterOpen(true)} className="bg-green-500 text-white px-3 py-1 rounded-full shadow text-sm font-medium">
          재료 필터 🥕
          {appliedIngredients.length > 0 && (
            <span className="ml-1 bg-white text-green-600 rounded-full px-1.5 text-xs font-bold">{appliedIngredients.length}</span>
          )}
        </button>
      </div>

      {/* 검색창 */}
      <div className="max-w-2xl mx-auto mb-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔎</span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="요리 이름으로 검색..."
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white shadow-sm border border-green-100 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm font-bold">✕</button>
          )}
        </div>
      </div>

      {/* 적용된 재료 태그 */}
      {appliedIngredients.length > 0 && (
        <div className="max-w-2xl mx-auto mb-3 flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-400 font-medium">필터:</span>
          {appliedIngredients.map(ing => (
            <span key={ing} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              {ing}
              <button onClick={() => {
                const next = appliedIngredients.filter(i => i !== ing);
                setAppliedIngredients(next);
                setTempIngredients(next);
              }} className="text-green-500 hover:text-green-800 font-bold">×</button>
            </span>
          ))}
          <button onClick={() => { setAppliedIngredients([]); setTempIngredients([]); }} className="text-xs text-gray-400 underline">초기화</button>
        </div>
      )}

      {filteredData.length === 0 && (
        <div className="max-w-2xl mx-auto text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🍽️</p>
          <p className="font-medium">검색 결과가 없어요</p>
          <p className="text-sm mt-1">다른 이름이나 재료로 검색해보세요</p>
        </div>
      )}

      {/* 요리 카드 목록 */}
      <div className="grid grid-cols-1 gap-3 max-w-2xl mx-auto">
        {filteredData.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-3xl shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-green-50 flex items-center justify-center text-2xl flex-shrink-0">🍽️</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-gray-800">{item.name}</h3>
                    {item.note && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${item.note === '실패작' ? 'bg-red-100 text-red-500' : 'bg-yellow-100 text-yellow-600'}`}>{item.note}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{item.ingredients}</p>
                </div>
              </div>
            </div>
            {/* 재료 태그 */}
            {item.ingredientTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {item.ingredientTags.map(tag => (
                  <span key={tag} className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium border border-green-100">{tag}</span>
                ))}
              </div>
            )}
            {/* 별점 가격 테이블 */}
            <div className="grid grid-cols-5 gap-1 bg-gray-50 rounded-2xl p-2">
              {STAR_LABELS.map((label, i) => {
                const p = prices(item)[i];
                return (
                  <div key={label} className="flex flex-col items-center">
                    <span className="text-yellow-400 text-[9px] font-bold leading-none mb-1">{label}</span>
                    <span className={`text-[10px] font-bold ${p === '-' ? 'text-gray-300' : 'text-gray-700'}`}>{p === '-' ? '-' : `${p}G`}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 재료 필터 모달 */}
      {isFilterOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
            <h3 className="text-xl font-bold mb-1 text-center text-gray-800">재료로 필터링</h3>
            <p className="text-xs text-gray-400 text-center mb-4">선택한 재료가 모두 포함된 요리만 표시돼요</p>

            {/* 재료 내 검색 */}
            <div className="relative mb-3">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔎</span>
              <input
                type="text"
                value={ingredientSearch}
                onChange={e => setIngredientSearch(e.target.value)}
                placeholder="재료 검색..."
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>

            <div className="overflow-y-auto flex-1 mb-4">
              <div className="flex flex-wrap gap-2">
                {visibleIngredients.map(ing => (
                  <button
                    key={ing}
                    onClick={() => toggleIngredient(ing)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${tempIngredients.includes(ing) ? 'bg-green-500 text-white border-green-600' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
                  >
                    {tempIngredients.includes(ing) && '✓ '}{ing}
                  </button>
                ))}
              </div>
            </div>

            {tempIngredients.length > 0 && (
              <p className="text-xs text-green-600 font-medium mb-2 text-center">
                선택됨: {tempIngredients.join(', ')}
              </p>
            )}

            <button onClick={() => { setAppliedIngredients(tempIngredients); setIsFilterOpen(false); setIngredientSearch(''); }} className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg transition">적용하기</button>
            <button onClick={() => { setIsFilterOpen(false); setIngredientSearch(''); }} className="w-full text-gray-400 mt-3 text-sm font-medium text-center">닫기</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── 준비 중 페이지 ───────────────────────────────────────────────
const ComingSoonPage = ({ category, onBack }: { category: string; onBack: () => void }) => (
  <div className="min-h-screen bg-purple-50 flex flex-col items-center justify-center font-sans p-8">
    <p className="text-5xl mb-4">{category === '채집' ? '🌿' : '📸'}</p>
    <h2 className="text-2xl font-bold text-purple-600 mb-2">{category} 도감</h2>
    <p className="text-gray-400 mb-8">준비 중이에요! 곧 업데이트될 예정이에요 🛠️</p>
    <button onClick={onBack} className="bg-purple-400 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-full shadow transition">← 뒤로가기</button>
  </div>
);

// ─── 메인 앱 ─────────────────────────────────────────────────────
const MainApp = () => {
  const [view, setView] = useState<'landing' | 'category' | 'list'>('landing');
  const [selectedCategory, setSelectedCategory] = useState('');

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center font-sans">
        <h1 className="text-4xl font-bold text-pink-600 mb-8">🏠 두근두근타운 도감</h1>
        <button
          onClick={() => setView('category')}
          className="bg-pink-400 hover:bg-pink-500 text-white font-bold py-4 px-10 rounded-full shadow-lg transform transition hover:scale-105"
        >
          도감 시작하기
        </button>
      </div>
    );
  }

  if (view === 'category') {
    return (
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
  }

  const goBack = () => setView('category');

  if (selectedCategory === '낚시') return <FishingPage onBack={goBack} />;
  if (selectedCategory === '요리') return <CookingPage onBack={goBack} />;
  return <ComingSoonPage category={selectedCategory} onBack={goBack} />;
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
