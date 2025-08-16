import { supabase } from "../supabase-client";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Card from "../components/Card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../components/ui/table";
import JLink from "../components/JLink";

export default function PlayerInfo() {
  const { playerId } = useParams<{ playerId: string }>();

  const [playerData, setPlayerData] = useState<any | null>(null);
  const [matchScores, setMatchScores] = useState<Record<number, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!playerId) return;

      // Fetch player and their scores including match date
      const { data, error } = await supabase
        .from("tm_people")
        .select(
          `
          id,
          name,
          tm_scores (
            id,
            match_id,
            points,
            ranking,
            match:tm_matches(occured_on)
          )
        `
        )
        .eq("id", playerId)
        .single();

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      if (!data) {
        setLoading(false);
        return;
      }

      // Fetch all scores for the matches the player participated in
      const matchIds = data.tm_scores?.map((s) => s.match_id) || [];

      let allScores: Record<number, any[]> = {};

      if (matchIds.length > 0) {
        const { data: scoresData, error: scoresError } = await supabase
          .from("tm_scores")
          .select("*")
          .in("match_id", matchIds);

        if (scoresError) {
          console.error(scoresError);
        } else if (scoresData) {
          scoresData.forEach((s) => {
            if (!allScores[s.match_id]) allScores[s.match_id] = [];
            allScores[s.match_id].push(s);
          });
        }
      }

      const totalWins =
        data.tm_scores?.filter((s) => s.ranking === 1).length || 0;
      const gamesPlayed = data.tm_scores?.length || 0;

      setPlayerData({
        ...data,
        totalWins,
        gamesPlayed,
      });

      setMatchScores(allScores);
      setLoading(false);
    };

    fetchData();
  }, [playerId]);

  if (loading) return <p>Loading...</p>;
  if (!playerData) return <p>Player not found</p>;

  return (
    <Card title={`Stats for ${playerData.name}`}>
      <Table>
        <TableHeader className="bg-gray-100">
          <TableRow>
            <TableHead>Match Date</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Ranking</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {playerData.tm_scores?.length > 0 ? (
            playerData.tm_scores.map((score) => {
              const totalPlayers = matchScores[score.match_id]?.length || 0;
              const matchDate = score.match?.occured_on
                ? new Date(score.match.occured_on).toLocaleDateString()
                : "Unknown";

              return (
                <TableRow key={score.id} className="hover:bg-gray-50">
                  <TableCell>
                    <JLink
                      variant="default"
                      to={`/matches/${score.match_id}`}
                      className="p-2 bg-blue-200 hover:bg-blue-300 rounded"
                    >
                      {matchDate}
                    </JLink>
                  </TableCell>
                  <TableCell>{score.points}</TableCell>
                  <TableCell
                    className={
                      score.ranking === 1 ? "text-green-600 font-semibold" : ""
                    }
                  >
                    {score.ranking} / {totalPlayers}
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-gray-500 text-center">
                No scores yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="mt-4">
        <p>Total Wins: {playerData.totalWins}</p>
        <p>Games Played: {playerData.gamesPlayed}</p>
        <p>
          Win %:{" "}
          {playerData.gamesPlayed > 0
            ? ((playerData.totalWins / playerData.gamesPlayed) * 100).toFixed(
                1
              ) + "%"
            : "0%"}
        </p>
      </div>
    </Card>
  );
}
