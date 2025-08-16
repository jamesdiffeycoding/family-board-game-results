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
import { formatRelativeDate } from "../utils/dates";
import JLink from "../components/JLink";

interface MatchDisplay {
  matchId: number;
  date: string;
  points: number;
  rank: number;
  players: number;
}

export default function CorporationInfo() {
  // 🚨 now we expect corpId in the route
  const { corpId } = useParams<{ corpId: string }>();
  const [corpName, setCorpName] = useState<string>("");
  const [matches, setMatches] = useState<MatchDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!corpId) return;

      const { data, error } = await supabase
        .from("tm_corporations")
        .select(
          `
          id,
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
        .eq("id", Number(corpId)) // ✅ query by ID now
        .single(); // only one corporation expected

      if (error) {
        console.error("Error fetching matches:", error);
      } else if (data) {
        setCorpName(data.name);

        const matchList: MatchDisplay[] = data.scores.map((score: any) => ({
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
  }, [corpId]);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Corporation: {corpName}</h1>

      {matches.length === 0 ? (
        <p>No matches found.</p>
      ) : (
        <Table className="min-w-full border border-gray-300">
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Rank</TableHead>
              <TableHead>Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map((m, idx) => (
              <TableRow key={idx} className="hover:bg-gray-50">
                <TableCell>
                  <JLink variant="default" to={`/matches/${m.matchId}`}>
                    {formatRelativeDate(m.date)}
                  </JLink>
                </TableCell>
                <TableCell>
                  {m.rank} / {m.players}
                </TableCell>
                <TableCell>{m.points}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
