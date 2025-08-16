import { supabase } from "./../supabase-client";
import { useEffect, useState } from "react";
import Card from "./Card";

export default function PlayerStats() {
  const [playerScores, setPlayerScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from("tm_people").select(`
        id,
        name,
        tm_scores (
          id,
          match_id,
          points,
          winner
        )
      `);

      if (error) {
        console.error(error);
      } else {
        const dataWithStats = data.map((player) => {
          const totalWins =
            player.tm_scores?.filter((s) => s.winner).length || 0;
          const gamesPlayed = player.tm_scores?.length || 0;

          return {
            ...player,
            totalWins,
            gamesPlayed,
          };
        });

        setPlayerScores(dataWithStats);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <Card title="Player stats">
      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2 text-left">Player</th>
            <th className="border px-4 py-2 text-left">Scores</th>
            <th className="border px-4 py-2 text-left">Wins</th>
            <th className="border px-4 py-2 text-left">Games Played</th>
            <th className="border px-4 py-2 text-left">Win %</th>
          </tr>
        </thead>
        <tbody>
          {playerScores.map((player) => (
            <tr key={player.id} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{player.name}</td>
              <td className="border px-4 py-2 space-x-2">
                {player.tm_scores && player.tm_scores.length > 0 ? (
                  player.tm_scores.map((score) => (
                    <span
                      key={score.id}
                      className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${
                        score.winner
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {score.points}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">No scores yet</span>
                )}
              </td>
              <td className="border px-4 py-2">{player.totalWins}</td>
              <td className="border px-4 py-2">{player.gamesPlayed}</td>
              <td className="border px-4 py-2">
                {player.gamesPlayed > 0
                  ? ((player.totalWins / player.gamesPlayed) * 100).toFixed(1) +
                    "%"
                  : "0%"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
