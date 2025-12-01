import { useState, useEffect } from 'react';

const PriceRangeSlider = ({ minPrice = 0, maxPrice = 1000000, onPriceChange, loading }) => {
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  useEffect(() => {
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
  }, [minPrice, maxPrice]);

  const handleMinChange = (e) => {
    const newMin = Math.min(Number(e.target.value), localMax - 1000);
    setLocalMin(newMin);
    onPriceChange(newMin, localMax);
  };

  const handleMaxChange = (e) => {
    const newMax = Math.max(Number(e.target.value), localMin + 1000);
    setLocalMax(newMax);
    onPriceChange(localMin, newMax);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h3 className="font-semibold text-lg mb-4">Price Range</h3>
      
      <div className="space-y-4">
        {/* Range Slider Track */}
        <div className="relative pt-2">
          <input
            type="range"
            min={0}
            max={1000000}
            value={localMin}
            onChange={handleMinChange}
            disabled={loading}
            className="absolute w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer z-5 accent-blue-600 pointer-events-none"
            style={{
              background: `linear-gradient(to right, #e5e7eb 0%, #e5e7eb ${((localMin / 1000000) * 100)}%, #2563eb ${((localMin / 1000000) * 100)}%, #2563eb ${((localMax / 1000000) * 100)}%, #e5e7eb ${((localMax / 1000000) * 100)}%, #e5e7eb 100%)`
            }}
          />
          <input
            type="range"
            min={0}
            max={1000000}
            value={localMax}
            onChange={handleMaxChange}
            disabled={loading}
            className="absolute w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer z-4 accent-blue-600 pointer-events-auto"
            style={{
              background: 'transparent'
            }}
          />
          <div className="w-full h-2 bg-gray-300 rounded-lg pointer-events-none"></div>
        </div>

        {/* Price Display */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Min Price</label>
            <div className="flex items-center border rounded-lg">
              <span className="px-3 text-gray-500">₹</span>
              <input
                type="number"
                value={localMin}
                onChange={(e) => {
                  const newVal = Math.max(0, Number(e.target.value));
                  setLocalMin(newVal);
                  onPriceChange(newVal, localMax);
                }}
                disabled={loading}
                className="w-full px-2 py-2 border-none focus:outline-none focus:ring-0"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Max Price</label>
            <div className="flex items-center border rounded-lg">
              <span className="px-3 text-gray-500">₹</span>
              <input
                type="number"
                value={localMax}
                onChange={(e) => {
                  const newVal = Math.min(1000000, Number(e.target.value));
                  setLocalMax(newVal);
                  onPriceChange(localMin, newVal);
                }}
                disabled={loading}
                className="w-full px-2 py-2 border-none focus:outline-none focus:ring-0"
              />
            </div>
          </div>
        </div>

        {/* Quick Select Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Under ₹10K', min: 0, max: 10000 },
            { label: '₹10K - ₹50K', min: 10000, max: 50000 },
            { label: '₹50K - ₹1L', min: 50000, max: 100000 },
            { label: 'Above ₹1L', min: 100000, max: 1000000 }
          ].map((range) => (
            <button
              key={range.label}
              onClick={() => {
                setLocalMin(range.min);
                setLocalMax(range.max);
                onPriceChange(range.min, range.max);
              }}
              disabled={loading}
              className="px-3 py-2 text-xs font-medium border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PriceRangeSlider;
