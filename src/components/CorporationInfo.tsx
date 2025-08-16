import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabase-client";

function capitalizeStr(str: string) {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

interface MatchDisplay {
  matchId: number;
  date: string;
  points: number;
  rank: number;
  players: number;
}

export default function CorporationInfo() {
  const { corpNameLower } = useParams<{ corpNameLower: string }>();
  const corpName = capitalizeStr(corpNameLower);
  const [matches, setMatches] = useState<MatchDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!corpName) return;

      const { data, error } = await supabase
        .from("tm_corporations")
        .select(
          `
          name,
          scores:tm_scores(
            points,
            ranking,
            match:tm_matches(
              id,
              occured_on,
              scores:tm_scores(points)
            )
          )
        `
        )
        .eq("name", corpName);

      if (error) {
        console.error("Error fetching matches:", error);
      } else if (data && data.length > 0) {
        const matchList: MatchDisplay[] = data[0].scores.map((score: any) => ({
          matchId: score.match.id,
          date: score.match.occured_on,
          points: score.points,
          rank: score.ranking,
          players: score.match.scores.length, // total players in this match
        }));

        setMatches(matchList);
      }

      setLoading(false);
    };

    fetchMatches();
  }, [corpName]);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Corporation: {corpName}</h1>

      {matches.length === 0 ? (
        <p>No matches found.</p>
      ) : (
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Date</th>
              <th className="border px-4 py-2">Rank</th>
              <th className="border px-4 py-2">Points</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border px-4 py-2">
                  {new Date(m.date).toLocaleDateString()}
                </td>
                <td className="border px-4 py-2">
                  {m.rank} / {m.players}
                </td>
                <td className="border px-4 py-2">{m.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
