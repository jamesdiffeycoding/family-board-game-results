import Card from "../components/Card";
import { supabase } from "../supabase-client";
import JLink from "../components/JLink";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../components/ui/table";
import { useEffect, useState } from "react";
import { cn } from "../utils/cn";
import { formatRelativeDate } from "../utils/dates";

export default function MatchHistory() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("tm_matches")
        .select(
          `
          match_id:id,
          date:occured_on,
          tm_scores (
            score_id:id,
            points,
            ranking,
            person:tm_people(name,id),
            corporation:tm_corporations(id, name)
          )
        `
        )
        .order("occured_on", { ascending: false }); // recent first

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
    <>
      <Card title="Match History">
        <Table className="min-w-full border border-gray-300">
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Winner</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Corporation</TableHead>
              <TableHead>Players</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map((match) =>
              match.tm_scores
                ?.filter((entry) => entry.ranking === 1) // only show winner row
                .map((winner) => {
                  // Sort the scores alphabetically by player name
                  const sortedScores = [...match.tm_scores].sort((a, b) =>
                    (a.person?.name || "").localeCompare(b.person?.name || "")
                  );

                  return (
                    <TableRow
                      key={winner.score_id}
                      className={cn("hover:bg-gray-50")}
                    >
                      <TableCell>
                        <JLink
                          variant="default"
                          to={`/matches/${match.match_id}`}
                          className="p-2 bg-blue-100 hover:bg-blue-200 rounded"
                        >
                          {formatRelativeDate(match.date) || "unknown"}
                        </JLink>
                      </TableCell>
                      <TableCell>
                        <div>
                          <JLink
                            variant="default"
                            to={`/players/${winner.person?.id}`}
                            className="p-2 bg-blue-100 hover:bg-blue-200 rounded"
                          >
                            {winner.person?.name || "Unknown Player"}
                          </JLink>{" "}
                        </div>
                      </TableCell>
                      <TableCell>{winner.points}</TableCell>
                      <TableCell>
                        <JLink
                          variant="default"
                          to={`/corporations/${winner.corporation?.id}`}
                          className="p-2 bg-blue-100 hover:bg-blue-200 rounded"
                        >
                          {winner.corporation?.name || "Unknown Corp"}
                        </JLink>
                      </TableCell>
                      <TableCell>
                        <div
                          className={cn("grid gap-1 grid-cols-5", "font-bold")}
                        >
                          {sortedScores.map((result) => (
                            <JLink
                              variant="small"
                              key={result.score_id}
                              to={`/players/${result.person.id}`} // link for each player
                              className={cn(
                                result.ranking === 1 &&
                                  "text-green-600 font-semibold",
                                "text-center bg-blue-100 hover:bg-blue-200 rounded"
                              )}
                            >
                              {result.person?.name.slice(0, 1) || "??"}
                            </JLink>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
