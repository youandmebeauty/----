import { useEffect, useState } from 'react';

type AnalyticsRow = {
  dimensionValues: { value: string }[];
  metricValues: { value: string }[];
};

export default function GoogleAnalytics() {
  const [data, setData] = useState<AnalyticsRow[] | null>(null);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/gAnalyse');
      const json = await res.json();
      setData(json.data);
    }
    fetchData();
  }, []);

  if (!data) return <p>Loading analytics...</p>;

  return (
    <div>
      <h1>Google Analytics Active Users (Last 30 days)</h1>
      <ul>
        {data.map((row, idx) => (
          <li key={idx}>
            Date: {row.dimensionValues[0].value} — Active Users: {row.metricValues[0].value}
          </li>
        ))}
      </ul>
    </div>
  );
}
