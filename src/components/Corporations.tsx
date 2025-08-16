import { supabase } from "./../supabase-client";
import { useEffect, useState } from "react";
import Card from "./Card";
import { Link } from "react-router-dom";

interface Corporation {
  id: number;
  name: string;
  pack?: { name: string };
  tm_scores?: Array<{
    id: number;
    match_id: number;
    points: number;
    ranking: number;
  }>;
  wins: number;
  gamesPlayed: number;
  winPercent: number;
}

export default function Corporations() {
  const [corporations, setCorporations] = useState<Corporation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: corporationsData, error } = await supabase.from(
        "tm_corporations"
      ).select(`
          id,
          name,
          pack:tm_packs(name),
          tm_scores(id, match_id, points, ranking)
        `);

      if (error) {
        console.error(error);
      } else if (corporationsData) {
        const dataWithStats = corporationsData.map((corp: any) => {
          const wins =
            corp.tm_scores?.filter((s: any) => s.ranking === 1).length || 0;
          const gamesPlayed = corp.tm_scores?.length || 0;
          const winPercent = gamesPlayed > 0 ? (wins / gamesPlayed) * 100 : 0;

          return {
            ...corp,
            wins,
            gamesPlayed,
            winPercent,
          };
        });

        // Sort by gamesPlayed descending
        dataWithStats.sort((a, b) => b.gamesPlayed - a.gamesPlayed);

        setCorporations(dataWithStats);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <Card title="Corporations Stats">
      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2 text-left">Corporation</th>
            <th className="border px-4 py-2 text-left">Pack</th>
            <th className="border px-4 py-2 text-left">Games Played</th>
            <th className="border px-4 py-2 text-left">Wins</th>
            <th className="border px-4 py-2 text-left">Win %</th>
          </tr>
        </thead>
        <tbody>
          {corporations.map((corp) => (
            <tr key={corp.id} className="hover:bg-gray-50">
              <td className="border px-4 py-2">
                <Link
                  to={`/corporations/${encodeURIComponent(
                    corp.name.toLowerCase()
                  )}`}
                  className="text-blue-600 hover:underline"
                >
                  {corp.name}
                </Link>
              </td>
              <td className="border px-4 py-2">
                {corp.pack?.name || (
                  <span className="text-gray-500">No pack</span>
                )}
              </td>
              <td className="border px-4 py-2">{corp.gamesPlayed}</td>
              <td className="border px-4 py-2">{corp.wins}</td>
              <td className="border px-4 py-2">
                {corp.winPercent.toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
