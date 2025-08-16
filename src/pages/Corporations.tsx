import { supabase } from "../supabase-client";
import { useEffect, useState } from "react";
import Card from "../components/Card";
import JLink from "../components/JLink";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../components/ui/table";
interface Corporation {
  id: number;
  name: string;
  pack?: { name: string };
  tm_scores?: Array<{
    id: number;
    match_id: number;
    points: number;
    ranking: number;
  }>;
  wins: number;
  gamesPlayed: number;
  winPercent: number;
}

export default function Corporations() {
  const [corporations, setCorporations] = useState<Corporation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: corporationsData, error } = await supabase.from(
        "tm_corporations"
      ).select(`
          id,
          name,
          pack:tm_packs(name),
          tm_scores(id, match_id, points, ranking)
        `);

      if (error) {
        console.error(error);
      } else if (corporationsData) {
        const dataWithStats = corporationsData.map((corp: any) => {
          const wins =
            corp.tm_scores?.filter((s: any) => s.ranking === 1).length || 0;
          const gamesPlayed = corp.tm_scores?.length || 0;
          const winPercent = gamesPlayed > 0 ? (wins / gamesPlayed) * 100 : 0;

          return {
            ...corp,
            wins,
            gamesPlayed,
            winPercent,
          };
        });

        // Sort by gamesPlayed descending
        dataWithStats.sort((a, b) => b.gamesPlayed - a.gamesPlayed);

        setCorporations(dataWithStats);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <Card title="Corporations Stats">
      <Table className="min-w-full border border-gray-300">
        <TableHeader className="bg-gray-100">
          <TableRow>
            <TableHead>Corporation</TableHead>
            <TableHead>Pack</TableHead>
            <TableHead>Games Played</TableHead>
            <TableHead>Wins</TableHead>
            <TableHead>Win %</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {corporations.map((corp) => (
            <TableRow key={corp.id} className="hover:bg-gray-50">
              <TableCell>
                <JLink
                  variant="default"
                  to={`/corporations/${corp.id}`}
                  className="p-2 bg-blue-200 hover:bg-blue-300 rounded"
                >
                  {corp.name}
                </JLink>
              </TableCell>
              <TableCell>
                {corp.pack?.name || (
                  <span className="text-gray-500">No pack</span>
                )}
              </TableCell>
              <TableCell>{corp.gamesPlayed}</TableCell>
              <TableCell>{corp.wins}</TableCell>
              <TableCell>{corp.winPercent.toFixed(1)}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
