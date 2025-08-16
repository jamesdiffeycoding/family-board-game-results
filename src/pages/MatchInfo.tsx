import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabase-client";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../components/ui/table";
import JLink from "../components/JLink";
import { Star } from "lucide-react";
interface Person {
  name: string;
}

interface ScoreDisplay {
  corporation: string;
  personId: number;
  person?: Person;
  points: number;
  ranking: number;
  karma: number;
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
            karma:black_cubes_left,
            person_id,
            person:tm_people(name),
            corporation:tm_corporations(id, name)
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
          corpId: s.corporation.id,
          personId: s.person_id,
          person: s.person,
          points: s.points,
          ranking: s.ranking,
          karma: s.karma,
        }));

        setScores(scoreList);
      }

      setLoading(false);
    };

    fetchMatch();
  }, [matchId]);

  if (loading) return <p>Loading match data...</p>;
  console.log(scores);

  return (
    <div>
      <h1>Match Details: {matchId}</h1>
      <p>Date: {new Date(matchDate).toLocaleDateString()}</p>

      {scores.length === 0 ? (
        <p>No scores found for this match.</p>
      ) : (
        <Table className="min-w-full border border-gray-300">
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead>Corporation</TableHead>
              <TableHead>Person Name</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Rank</TableHead>
              <TableHead>Karma</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scores.map((s, idx) => (
              <TableRow
                key={idx}
                className={`px-4 py-2 ${
                  s.ranking === 1
                    ? "bg-green-200 font-bold"
                    : "hover:bg-gray-50"
                }`}
              >
                <TableCell>
                  {" "}
                  <JLink variant="default" to={`/corporations/${s.corpId}`}>
                    {s.corporation || "Unknown"}
                  </JLink>
                </TableCell>
                <TableCell>
                  <JLink variant="default" to={`/players/${s.personId}`}>
                    {s.person?.name || "Unknown"}
                  </JLink>
                </TableCell>
                <TableCell>{s.points}</TableCell>
                <TableCell>{s.ranking}</TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    {Array.from({ length: s.karma }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-black" />
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
