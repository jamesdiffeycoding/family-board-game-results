import { supabase } from "./../supabase-client";
import { useEffect, useState } from "react";
import Card from "./Card";

export default function Corporations() {
  const [corporations, setCorporations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch corporations along with pack info and scores
      const { data: corporations, error } = await supabase.from(
        "tm_corporations"
      ).select(`
          id,
          name,
          pack:tm_packs(name),
          tm_scores(id, match_id, points, winner)
        `);

      if (error) {
        console.error(error);
      } else {
        const dataWithStats = corporations.map((corp) => {
          const wins = corp.tm_scores?.filter((s) => s.winner).length || 0;
          const gamesPlayed = corp.tm_scores?.length || 0;

          return {
            ...corp,
            wins,
            gamesPlayed,
          };
        });

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
          </tr>
        </thead>
        <tbody>
          {corporations.map((corp) => (
            <tr key={corp.id} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{corp.name}</td>
              <td className="border px-4 py-2">
                {corp.pack?.name || (
                  <span className="text-gray-500">No pack</span>
                )}
              </td>
              <td className="border px-4 py-2">{corp.gamesPlayed}</td>
              <td className="border px-4 py-2">{corp.wins}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
