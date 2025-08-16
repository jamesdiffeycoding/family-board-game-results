import { supabase } from "./../supabase-client";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "./Card";

export default function MatchHistory() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("tm_matches")
        .select(
          `
          id,
          occured_on,
          tm_scores (
            id,
            points,
            ranking,
            person:tm_people(name),
            corporation:tm_corporations(name)
          )
        `
        )
        .order("occured_on", { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setMatches(data);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <Card title="Match History">
      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2 text-left">Date</th>
            <th className="border px-4 py-2 text-left">Player</th>
            <th className="border px-4 py-2 text-left">Corporation</th>
            <th className="border px-4 py-2 text-left">Score</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match) =>
            match.tm_scores?.map((score) => (
              <tr key={score.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">
                  <Link
                    to={`/matches/${match.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {new Date(match.occured_on).toLocaleDateString()}
                  </Link>
                </td>
                <td
                  className={`border px-4 py-2 ${
                    score.ranking === 1 ? "bg-green-100 font-semibold" : ""
                  }`}
                >
                  {score.person?.name || "Unknown Player"}
                </td>
                <td className="border px-4 py-2">
                  {score.corporation?.name || "Unknown Corp"}
                </td>
                <td
                  className={`border px-4 py-2 ${
                    score.ranking === 1 ? "bg-green-100 font-semibold" : ""
                  }`}
                >
                  {score.points}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Card>
  );
}
