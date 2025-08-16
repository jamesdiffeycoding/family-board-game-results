import { supabase } from "../supabase-client";
import { useEffect, useState } from "react";
import Card from "../components/Card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../components/ui/table";
import { Link } from "react-router-dom";
import JLink from "../components/JLink";

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
          ranking
        )
      `);

      if (error) {
        console.error(error);
      } else {
        const dataWithStats = data.map((player) => {
          const totalWins =
            player.tm_scores?.filter((s) => s.ranking == 1).length || 0;
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
      <Table>
        <TableHeader className="bg-gray-100">
          <TableRow>
            <TableHead>Player</TableHead>
            <TableHead>Score history</TableHead>
            <TableHead>Wins</TableHead>
            <TableHead>Games Played</TableHead>
            <TableHead>Win %</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {playerScores.map((player) => (
            <TableRow key={player.id} className="hover:bg-gray-50">
              <TableCell>
                <JLink
                  variant="default"
                  to={`/players/${player.id}`}
                  className="p-2 bg-blue-200 hover:bg-blue-300 rounded"
                >
                  {player.name}{" "}
                </JLink>
              </TableCell>
              <TableCell className="space-x-2">
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
              </TableCell>
              <TableCell>{player.totalWins}</TableCell>
              <TableCell>{player.gamesPlayed}</TableCell>
              <TableCell>
                {player.gamesPlayed > 0
                  ? ((player.totalWins / player.gamesPlayed) * 100).toFixed(1) +
                    "%"
                  : "0%"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
