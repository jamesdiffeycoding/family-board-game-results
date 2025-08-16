import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabase-client";

interface Person {
  name: string;
}

interface ScoreDisplay {
  corporation: string;
  personId: number;
  person?: Person;
  points: number;
  ranking: number;
  blackCubes: number;
}

export default function MatchInfo() {
  const { matchId } = useParams<{ matchId: string }>();
  const [scores, setScores] = useState<ScoreDisplay[]>([]);
  const [matchDate, setMatchDate] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatch = async () => {
      if (!matchId) return;

      const { data, error } = await supabase
        .from("tm_matches")
        .select(
          `
          id,
          occured_on,
          scores:tm_scores(
            points,
            ranking,
            black_cubes_left,
            person_id,
            person:tm_people(name),
            corporation:tm_corporations(name)
          )
        `
        )
        .eq("id", Number(matchId))
        .order("ranking", { foreignTable: "tm_scores", ascending: true })
        .single();

      if (error) {
        console.error("Error fetching match:", error);
      } else if (data) {
        setMatchDate(data.occured_on);

        const scoreList: ScoreDisplay[] = data.scores.map((s: any) => ({
          corporation: s.corporation.name,
          personId: s.person_id,
          person: s.person,
          points: s.points,
          ranking: s.ranking,
          blackCubes: s.black_cubes_left,
        }));

        setScores(scoreList);
      }

      setLoading(false);
    };

    fetchMatch();
  }, [matchId]);

  if (loading) return <p>Loading match data...</p>;

  return (
    <div>
      <h1>Match Details: {matchId}</h1>
      <p>Date: {new Date(matchDate).toLocaleDateString()}</p>

      {scores.length === 0 ? (
        <p>No scores found for this match.</p>
      ) : (
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Corporation</th>
              <th className="border px-4 py-2">Person Name</th>
              <th className="border px-4 py-2">Points</th>
              <th className="border px-4 py-2">Rank</th>
              <th className="border px-4 py-2">Black Cubes Left</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((s, idx) => (
              <tr
                key={idx}
                className={`border px-4 py-2 ${
                  s.ranking === 1
                    ? "bg-green-200 font-bold"
                    : "hover:bg-gray-50"
                }`}
              >
                <td className="border px-4 py-2">{s.corporation}</td>
                <td className="border px-4 py-2">
                  {s.person?.name || "Unknown"}
                </td>
                <td className="border px-4 py-2">{s.points}</td>
                <td className="border px-4 py-2">{s.ranking}</td>
                <td className="border px-4 py-2">{s.blackCubes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
