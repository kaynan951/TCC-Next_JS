'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import LogoJS from '../../public/JavaScript.svg';
import LogoNextJS from '../../public/Next.js.svg';
export default function CovidDashboard() {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    country: 'BRA',
    province: 'All',
    city: 'Todas',
    specificDate: '2022-07-01'
  });
  const [stats, setStats] = useState({
    total: '0',
    deaths: '0',
    recovered: '0',
    active: '0'
  });
  const [tableData, setTableData] = useState([]);

  const statsCards = useMemo(() => [
    {
      title: 'Total de Casos',
      value: stats.total,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-500',
      iconPath: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      title: 'Óbitos',
      value: stats.deaths,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-500',
      iconPath: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      title: 'Recuperados',
      value: stats.recovered,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-500',
      iconPath: 'M5 13l4 4L19 7'
    },
    {
      title: 'Ativos',
      value: stats.active,
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-500',
      iconPath: 'M3 3h18v18H3z'
    }
  ], [stats]);

  const normalizeStr = (s) => {
    if (!s) return '';
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const formatDateDisplay = (isoDate) => {
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  };

  const getDateRange = (centerDate) => {
    const dates = [];
    const center = new Date(centerDate + 'T00:00:00');

    for (let offset = -3; offset <= 3; offset++) {
      const date = new Date(center);
      date.setDate(center.getDate() + offset);
      dates.push(date.toISOString().slice(0, 10));
    }

    return dates;
  };

  const dateRangeTitle = useMemo(() => {
    const dates = getDateRange(filters.specificDate);
    return `${formatDateDisplay(dates[0])} - ${formatDateDisplay(dates[6])}`;
  }, [filters.specificDate]);

  const fetchDataForDate = async (isoDate) => {
    try {
      const response = await fetch(
        `https://covid-api.com/api/reports?date=${isoDate}&iso=${filters.country}`
      );
      const json = await response.json();

      if (!json.data?.length) {
        return { confirmed: 0, deaths: 0, recovered: 0, active: 0 };
      }

      const filteredData = json.data.filter((item) => {
        if (!item.region) return false;
        if (filters.province === 'All') return true;
        return normalizeStr(item.region.province || '') === normalizeStr(filters.province);
      });

      return filteredData.reduce(
        (acc, item) => ({
          confirmed: acc.confirmed + (item.confirmed || 0),
          deaths: acc.deaths + (item.deaths || 0),
          recovered: acc.recovered + (item.recovered || 0),
          active: acc.active + (item.active || 0)
        }),
        { confirmed: 0, deaths: 0, recovered: 0, active: 0 }
      );
    } catch (error) {
      console.error(`Erro ao buscar dados para ${isoDate}:`, error);
      return { confirmed: 0, deaths: 0, recovered: 0, active: 0 };
    }
  };

  const fetchCovidData = async () => {
    setLoading(true);

    try {
      const dates = getDateRange(filters.specificDate);

      const results = await Promise.all(
        dates.map(async (date) => ({
          date,
          data: await fetchDataForDate(date)
        }))
      );

      setTableData(results.map(({ date, data }) => ({
        date: formatDateDisplay(date),
        cases: formatNumber(data.confirmed),
        deaths: formatNumber(data.deaths),
        recovered: formatNumber(data.recovered),
        active: formatNumber(data.active)
      })));

      const centerData = results[3].data;

      setStats({
        total: formatNumber(centerData.confirmed),
        deaths: formatNumber(centerData.deaths),
        recovered: formatNumber(centerData.recovered),
        active: formatNumber(centerData.active)
      });
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    fetchCovidData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8 rounded-lg">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 justify-center">
            <div className="bg-blue-500 rounded-full p-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Painel COVID-19 no Nordeste Brasileiro</h1>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-2xl font-semibold text-gray-800 gap-2">Filtros de Busca</h2>
            <div className="flex items-end gap-4 w-full md:w-auto md:flex-row flex-col">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex-wrap">Estado</label>
                <select
                  value={filters.province}
                  onChange={(e) => handleFilterChange('province', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="All">Todos os estados</option>
                  <option value="Alagoas">Alagoas</option>
                  <option value="Bahia">Bahia</option>
                  <option value="Ceará">Ceará</option>
                  <option value="Maranhão">Maranhão</option>
                  <option value="Paraíba">Paraíba</option>
                  <option value="Pernambuco">Pernambuco</option>
                  <option value="Piauí">Piauí</option>
                  <option value="Rio Grande do Norte">Rio Grande do Norte</option>
                  <option value="Sergipe">Sergipe</option>
                </select>
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">Data específica</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={filters.specificDate}
                    onChange={(e) => handleFilterChange('specificDate', e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <button
                onClick={fetchCovidData}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {loading ? 'Carregando...' : 'Buscar'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {statsCards.map((card, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className={`${card.bgColor} rounded-full p-4`}>
                  <svg className={`${card.iconColor} w-8 h-8`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={card.iconPath} />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Table */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              {filters.province !== 'All'
                ? `Tabela de Resultados do estado: ${filters.province} entre (${dateRangeTitle})`
                : `Tabela de Resultados do Nordeste em: (${dateRangeTitle})`
              }
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Casos</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Mortes</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Recup.</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ativos</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-sm text-gray-700">{row.date}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800">{row.cases}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800">{row.deaths}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800">{row.recovered}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800">{row.active}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center text-gray-600 flex items-center justify-around flex-col md:flex-row gap-8">
          <div className="flex items-center justify-center gap-2">
            <a
              href="https://nextjs.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Image src={LogoNextJS} alt="Next.js Logo" className="w-10 h-10" />
              <span className="font-semibold">Next.js</span>
            </a>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="mt-2">
              Desenvolvido com Next.js, JavaScript e Tailwind CSS.
            </div>
            <div className="mt-2">
              Dados fornecidos por <a href="https://covid-api.com/" target="_blank" className="text-blue-500 underline">COVID-API</a>.
            </div>
            <div className="mt-2">
              Desenvolvedor: Kaynan Pereira de Sousa.
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/JavaScript"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Image src={LogoJS} alt="JavaScript Logo" className="w-10 h-10" />
              <span className="font-semibold">JavaScript</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}